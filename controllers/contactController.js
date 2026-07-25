const Contact = require("../models/Contact");
const Notification = require("../models/Notification");

const {
    sendContactReceivedEmail,
    sendAdminReplyEmail
} = require("../mail/contactMail");


/* =====================================================
   Send Contact Message
===================================================== */

exports.sendMessage = async (req, res) => {

    try {

        const {
            name,
            email,
            subject,
            message
        } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        // Create Notification
        await Notification.create({
            userEmail: email,
            title: "Contact Message Received",
            message:
                "We have successfully received your message. Our team will review it and reply shortly.",
            type: "contact"
        });

        // Send Email
        try {
            await sendContactReceivedEmail(contact);
        } catch (mailError) {
            console.log("Receive Email Error:", mailError.message);
        }

        res.status(201).json({
            success: true,
            message: "Message sent successfully.",
            contact
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};



/* =====================================================
   Get All Messages
===================================================== */

exports.getMessages = async (req, res) => {

    try {

        const messages = await Contact.find()
            .sort({
                createdAt: -1
            });

        res.json({
            success: true,
            total: messages.length,
            messages
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};



/* =====================================================
   Get Single Message
===================================================== */

exports.getMessage = async (req, res) => {

    try {

        const message = await Contact.findById(req.params.id);

        if (!message) {

            return res.status(404).json({
                success: false,
                message: "Message not found."
            });

        }

        res.json({
            success: true,
            message
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};



/* =====================================================
   Admin Reply
===================================================== */

exports.replyMessage = async (req, res) => {

    try {

        const { reply } = req.body;

        if (!reply) {

            return res.status(400).json({
                success: false,
                message: "Reply is required."
            });

        }

        const contact = await Contact.findById(req.params.id);

        if (!contact) {

            return res.status(404).json({
                success: false,
                message: "Message not found."
            });

        }

        contact.adminReply = reply;
        contact.status = "Replied";
        contact.notification = true;
        contact.repliedAt = new Date();

        await contact.save();

        // Notification
        await Notification.create({
            userEmail: contact.email,
            title: "Admin Replied",
            message:
                "Good news! Our support team has replied to your contact message.",
            type: "contact"
        });

        // Email
        try {
            await sendAdminReplyEmail(contact);
        } catch (mailError) {
            console.log("Reply Email Error:", mailError.message);
        }

        res.json({
            success: true,
            message: "Reply sent successfully.",
            contact
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};



/* =====================================================
   Delete Message
===================================================== */

exports.deleteMessage = async (req, res) => {

    try {

        const contact = await Contact.findById(req.params.id);

        if (!contact) {

            return res.status(404).json({
                success: false,
                message: "Message not found."
            });

        }

        await Contact.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Message deleted successfully."
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};



/* =====================================================
   Statistics
===================================================== */

exports.statistics = async (req, res) => {

    try {

        const total = await Contact.countDocuments();

        const pending = await Contact.countDocuments({
            status: "Pending"
        });

        const replied = await Contact.countDocuments({
            status: "Replied"
        });

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const todayMessages = await Contact.countDocuments({
            createdAt: {
                $gte: today
            }
        });

        res.json({
            success: true,
            statistics: {
                total,
                pending,
                replied,
                todayMessages
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};