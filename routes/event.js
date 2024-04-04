const mongoose = require('mongoose');
require('dotenv').config({path:"./.env"})

const eventSchema = new mongoose.Schema({
    eventName:{
        type:String,
        trim:true,
        required:[true,"eventName is required"],
        minLength:[3,"eventName must be at least 3 characters long"],
    },
    eventDate:{
        type:Date,
        required:[true,"eventDate is required"],
    },
    eventImages: {
        type: [String], // Array of image paths
        trim: true,
        required: [true, "At least one image is required"],
    },
    eventDescription:{
        type:String,
        trim:true,
        required:[true,"eventDescription is required"],
        minLength:[3,"eventDescription must be at least 3 characters long"],
    }
},{timestamps:true})

module.exports = mongoose.model('Event',eventSchema);