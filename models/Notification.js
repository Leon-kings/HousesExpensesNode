const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
{
    userEmail:{
        type:String,
        required:true
    },

    title:{
        type:String,
        required:true
    },

    message:{
        type:String,
        required:true
    },

    type:{
        type:String,
        enum:["contact","system","account"],
        default:"contact"
    },

    isRead:{
        type:Boolean,
        default:false
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("Notification",notificationSchema);