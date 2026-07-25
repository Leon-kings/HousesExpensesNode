const Notification = require("../models/Notification");

/* ===========================================
   Get User Notifications
=========================================== */

exports.getNotifications = async (req,res)=>{

try{

const notifications = await Notification.find({
    userEmail:req.params.email
})
.sort({createdAt:-1});

res.json({
success:true,
notifications
});

}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};


/* ===========================================
   Get Notification By ID
=========================================== */

exports.getNotification = async(req,res)=>{

try{

const notification = await Notification.findById(req.params.id);

if(!notification){

return res.status(404).json({
success:false,
message:"Notification not found"
});

}

res.json(notification);

}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};


/* ===========================================
   Mark As Read
=========================================== */

exports.markAsRead = async(req,res)=>{

try{

const notification = await Notification.findById(req.params.id);

if(!notification){

return res.status(404).json({
success:false,
message:"Notification not found"
});

}

notification.isRead=true;

await notification.save();

res.json({

success:true,
message:"Notification marked as read."

});

}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};


/* ===========================================
   Delete Notification
=========================================== */

exports.deleteNotification = async(req,res)=>{

try{

await Notification.findByIdAndDelete(req.params.id);

res.json({

success:true,
message:"Notification deleted."

});

}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};


/* ===========================================
   Statistics
=========================================== */

exports.statistics = async(req,res)=>{

try{

const total = await Notification.countDocuments();

const unread = await Notification.countDocuments({
isRead:false
});

const read = await Notification.countDocuments({
isRead:true
});

res.json({

total,
read,
unread

});

}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};