const mongoose = require("mongoose");


const memberSchema = new mongoose.Schema({

    userEmail:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },


    name:{
        type:String,
        required:true
    },


    role:{
        type:String,
        enum:[
            "Head of Household",
            "Co-Head",
            "Member"
        ],
        default:"Member"
    },


    phone:{
        type:String,
        default:""
    },


    joinedAt:{
        type:Date,
        default:Date.now
    }

});



const householdSchema = new mongoose.Schema({

    ownerEmail:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },


    householdName:{
        type:String,
        required:true
    },


    members:[
        memberSchema
    ],


    address:{
        type:String,
        default:""
    }

},
{
    timestamps:true
});


module.exports = mongoose.model(
    "Household",
    householdSchema
);