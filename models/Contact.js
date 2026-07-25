const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        trim:true
    },

    email:{
        type:String,
        required:true,
        lowercase:true
    },

    subject:{
        type:String,
        required:true
    },

    message:{
        type:String,
        required:true
    },

    status:{
        type:String,
        enum:["Pending","Replied"],
        default:"Pending"
    },

    adminReply:{
        type:String,
        default:""
    },

    notification:{
        type:Boolean,
        default:false
    },

    repliedAt:{
        type:Date
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("Contact",contactSchema);