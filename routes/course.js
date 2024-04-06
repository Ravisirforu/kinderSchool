const mongoose = require('mongoose');
require('dotenv').config({path:"./.env"})

const courseSchema = new mongoose.Schema({
    courseName:{
        type:String,
        trim:true,
        required:[true,"courseName is required"],
        minLength:[3,"courseName must be at least 3 characters long"],
    },
    courseDescription:{
        type:String,
        trim:true,
        required:[true,"courseDescription is required"],
        minLength:[3,"courseDescription must be at least 3 characters long"],
    },
    courseDuration:{
        type:String,
        trim:true,
        required:[true,"courseDuration is required"],
        minLength:[3,"courseDuration must be at least 3 characters long"],
    },
    coursePrice:{
        type:Number,
        required:[true,"coursePrice is required"],
    },
    courseImage:{
        type:String,
        trim:true,
    },
    seatsAvailable:{
        type:Number,
        required:[true,"seatsAvailable is required"],
    },
    
},{timestamps:true})

module.exports = mongoose.model('Course',courseSchema);
