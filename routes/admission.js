const mongoose = require('mongoose');
require('dotenv').config({path:"./.env"})

const admissionSchema = new mongoose.Schema({
    studentName:{
        type:String,
        trim:true,
        required:[true,"courseName is required"],
        minLength:[3,"courseName must be at least 3 characters long"],
    },
    studentEmail:{
        type:String,
        trim:true,
        unique:true,
        lowercase:true,
        required:[true,"email is required"],
        match:[/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,"invalid email"]
    },
    studentNumber:{
        type:Number,
        required:[true,"studentNumber is required"],
        minLength:[10,"studentNumber must be at least 10 number long"],
    },
    state:{
        type:String,
        required:[true,"state is required"],
    },
    city:{
        type:String,
        required:[true,"city is required"],
    },
    courseName:{
        type:String,
        require:true,
    },
    
},{timestamps:true})

module.exports = mongoose.model('admission',admissionSchema);
