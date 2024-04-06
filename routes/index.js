var express = require("express");
var router = express.Router();
const userModel = require("./users");
const eventModel = require("./event");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
require('dotenv').config({path:"./.env"})
const courseModel = require("./course");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

/* GET home page. */
router.get("/", async function (req, res, next) {
  const admin = await userModel.findOne({ role: "admin" });

  res.render("index", { admin });
});
router.get("/gallery", async (req, res) => {
  const admin = await userModel.findOne({ role: "admin" });
  res.render("gallery", { admin });
});
router.get("/programs", async (req, res) => {
  const admin = await userModel.findOne({ role: "admin" });
  res.render("programs", { admin });
});
router.get("/contact", async (req, res) => {
  const admin = await userModel.findOne({ role: "admin" });
  res.render("contact", { admin });
});
router.get("/about", async (req, res) => {
  const admin = await userModel.findOne({ role: "admin" });
  res.render("about", { admin });
});
router.get("/activity", async (req, res) => {
  const admin = await userModel.findOne({ role: "admin" });
  const events = await eventModel.find({});
  res.render("activities", { admin,events });
});
router.get("/register", async function (req, res, next) {
  res.render("register", { error: req.flash("error") });
});
router.post("/register", async function (req, res, next) {
  try {
    if (!req.body.username || !req.body.email || !req.body.password) {
      req.flash("error", "All fields are required");
      return res.redirect("/login");
    }

    const { username, password, email } = req.body;
    const existingUserEmail = await userModel.findOne({ email });
    if (existingUserEmail) {
      req.flash("error", "This Email already exists");
      return res.redirect("/register");
    }
    const data = await userModel.create({ username, email, password });
    const token = await data.generateToken();
    res.cookie("token", token, { httpOnly: true }); // Set token as a cookie
    res.redirect("/"); // Redirect to / page
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while registering the user" });
  }
});
router.get("/dashboard", isLoggedIn, async function (req, res, next) {
  res.render("admin/dashboard");
});
router.post('/createCourse', isLoggedIn,async (req, res) => {
  const course = req.files.courseImage;
  cloudinary.uploader.upload(course.tempFilePath, async function (err, result) {
    if (err) return next(err);
    const newCourse = new courseModel({
      courseName: req.body.courseName,
      courseDescription: req.body.courseDescription,
      courseDuration: req.body.courseDuration,
      coursePrice: req.body.coursePrice,
      courseImage: result.secure_url,
      seatsAvailable: req.body.seatsAvailable,
    });
    await newCourse.save();
    req.flash('success', 'course created successfully');
    res.redirect('/manageCourse');
  })
});
router.get('/createCourse', isLoggedIn,(req, res) => {
res.render('admin/createCourse');
});
router.get('/manageCourse', isLoggedIn, async function (req, res, next) {
  try {
    const courses = await courseModel.find({});

    // Pass flash messages to the template
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');

    res.render('admin/manageCourse', { courses, successMessage, errorMessage });
  } catch (error) {
    console.error("Error fetching course:", error);
    req.flash('error', 'Failed to fetch course data');
    res.redirect('/dashboard'); // Redirect to a suitable page in case of error
  }
});

router.get('/editCourse/:id', isLoggedIn, async function (req, res, next) {
  const course = await courseModel.findById(req.params.id);
  res.render('admin/editCourse', { course });
});

router.post('/editCourse/:id', isLoggedIn, async function (req, res, next) {
  try {
    const course = await courseModel.findByIdAndUpdate(req.params.id, {
      courseName: req.body.courseName,
      courseDescription: req.body.courseDescription,
      courseDuration : req.body.courseDuration,
      coursePrice: req.body.coursePrice,
      seatsAvailable:req.body.seatsAvailable
    }, { new: true });
    await course.save();

    // Set flash message
    req.flash('success', 'Course details updated successfully');

    res.redirect('/manageCourse');
  } catch (error) {
    // Handle error appropriately
    console.error("Error updating product:", error);
    req.flash('error', 'Failed to update product details');
    res.redirect('/dashboard');
  }
});

router.get('/deleteCourse/:id', isLoggedIn, async function (req, res, next) {
  try {
    const course = await courseModel.findById(req.params.id);

    // Delete the image from Cloudinary
    const imageURL = course.courseImage;
    const publicID = imageURL.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicID);

    // Delete the course from the database
    await courseModel.findByIdAndDelete(req.params.id);

    // Set flash message
    req.flash('success', 'Course deleted successfully');

    res.redirect('/manageCourse');
} catch (error) {
    console.error("Error deleting course:", error);
    req.flash('error', 'Failed to delete course');
    res.redirect('/manageCourse');
}
});
router.get("/createEvent", isLoggedIn, (req, res) => {
  res.render("admin/createEvent");
});
router.post("/createEvent", isLoggedIn, async (req, res) => {
  try {
    const eventImages = [];

    // Upload all images to Cloudinary
    for (const file of req.files.eventImages) {
      const result = await cloudinary.uploader.upload(file.tempFilePath);
      eventImages.push(result.secure_url);
    }
    // Create a new event with the uploaded image URLs
    const newEvent = new eventModel({
      eventName: req.body.eventName,
      eventDescription: req.body.eventDescription,
      eventDate: req.body.eventDate,
      eventImages: eventImages, // Array of image URLs
    });

    // Save the new event to the database
    await newEvent.save();

    req.flash("success", "Event created successfully");
    res.redirect('/manageEvent');
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render("error", { message: "Internal Server Error", error });
  }
});
router.get('/manageEvent', isLoggedIn, async function (req, res, next) {
  try {
    const events = await eventModel.find({});

    // Pass flash messages to the template
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');

    res.render('admin/manageEvent', { events, successMessage, errorMessage });
  } catch (error) {
    console.error("Error fetching event:", error);
    req.flash('error', 'Failed to fetch event data');
    res.redirect('/dashboard'); // Redirect to a suitable page in case of error
  }
});
router.get('/editEvent/:id', isLoggedIn, async function (req, res, next) {
  const event = await eventModel.findById(req.params.id);
  res.render('admin/editEvent', { event });
});
router.post('/editEvent/:id', isLoggedIn, async function (req, res, next) {
  try {
    const event = await eventModel.findByIdAndUpdate(req.params.id, {
      eventName: req.body.eventName,
      eventDescription: req.body.eventDescription,
      eventDate: req.body.eventDate,
     
    }, { new: true });
    await event.save();

    // Set flash message
    req.flash('success', 'Event details updated successfully');

    res.redirect('/manageEvent');
  } catch (error) {
    // Handle error appropriately
    console.error("Error updating product:", error);
    req.flash('error', 'Failed to update product details');
    res.redirect('/manageProducts');
  }
});
router.get('/deleteEvent/:id', isLoggedIn, async function (req, res, next) {
  try {
    const event = await eventModel.findById(req.params.id);

    // Delete the image from Cloudinary
    for (const imageUrl of event.eventImages) {
      const publicID = imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicID);
  }
    // Delete the event from the database
    await eventModel.findByIdAndDelete(req.params.id);

    // Set flash message
    req.flash('success', 'Event deleted successfully');

    res.redirect('/manageEvent');
} catch (error) {
    console.error("Error deleting event:", error);
    req.flash('error', 'Failed to delete event');
    res.redirect('/manageEvent');
}
});
router.get("/manageContactDetails", async function (req, res, next) {
  const admin = await userModel.findOne({ role: "admin" });
  res.render("admin/manageContactDetails", { admin });
});

router.post("/manageContactDetails", isLoggedIn, async function (req, res) {
  const admin = await userModel.findOneAndUpdate(
    { role: "admin" },
    {
      location1: req.body.location1,
      location2: req.body.location2,
      email: req.body.email,
      contact1: req.body.contact1,
      contact2: req.body.contact2,
    },
    { new: true }
  );

  await admin.save();
  res.redirect("/dashboard");
});

router.post("/login", async function (req, res, next) {
  try {
    const { email, password } = req.body;
    const userExist = await userModel.findOne({ email });
    if (!userExist) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/login");
    }

    const user = await userExist.comparePassword(password);

    if (user) {
      // Check if the user's role is 'admin'
      if (userExist.role === "admin") {
        const token = await userExist.generateToken();
        res.cookie("token", token, { httpOnly: true }); // Set token as a cookie
        res.redirect("/dashboard");
      } else {
        // If the user's role is not 'admin', redirect to the '/' page
        res.redirect("/");
      }
    } else {
      req.flash("error", "Invalid credentials");
      return res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while login" });
  }
});

router.get("/login", async function (req, res, next) {
  try {
    res.render("login", { error: req.flash("error") });
  } catch (error) {
    console.error("Error occurred while fetching data:", error);
    next(error);
  }
});
router.get("/logout", (req, res) => {
  try {
    res.clearCookie("token");
    res.redirect("/login");
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).send("Internal Server Error");
  }
});

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;

  if (token == null) return res.redirect("/login");

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, user) => {
    if (err) {
      return res.redirect("/login");
    }
    const userRole = await userModel.findById(user._id);
    if (userRole.role != "admin") {
      return res.redirect("/");
    } else {
      req.user = user;
      next();
    }
  });
}

module.exports = router;
