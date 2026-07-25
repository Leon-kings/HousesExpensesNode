const nodemailer = require("nodemailer");

/* ============================================
   Mail Transporter
============================================ */

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ============================================
   Contact Received Email
============================================ */

exports.sendContactReceivedEmail = async (contact) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: contact.email,
    subject: "We've Received Your Message",
    html: `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<style>

body{
font-family:Arial,Helvetica,sans-serif;
background:#f4f6f9;
padding:30px;
}

.container{
max-width:700px;
margin:auto;
background:#fff;
padding:30px;
border-radius:10px;
box-shadow:0 0 10px rgba(0,0,0,.1);
}

.header{
background:#2563eb;
color:white;
padding:20px;
text-align:center;
font-size:24px;
font-weight:bold;
border-radius:8px;
}

.content{
margin-top:25px;
font-size:16px;
color:#444;
line-height:1.8;
}

.box{
margin-top:20px;
padding:18px;
background:#f9fafb;
border-left:5px solid #2563eb;
}

.footer{
margin-top:30px;
text-align:center;
font-size:13px;
color:#777;
}

</style>
</head>

<body>

<div class="container">

<div class="header">
Thank You For Contacting Us
</div>

<div class="content">

<p>Hello <strong>${contact.name}</strong>,</p>

<p>
We have successfully received your message.
Thank you for taking the time to contact us.
</p>

<div class="box">

<p><strong>Subject</strong></p>
<p>${contact.subject}</p>

<p><strong>Your Message</strong></p>
<p>${contact.message}</p>

</div>

<p>
Our support team will review your request and respond as soon as possible.
</p>

<p>
Thank you for choosing us.
</p>

</div>

<div class="footer">

This is an automatic email. Please do not reply.

</div>

</div>

</body>
</html>
`,
  };

  return transporter.sendMail(mailOptions);
};

/* ============================================
   Admin Reply Email
============================================ */

exports.sendAdminReplyEmail = async (contact) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,

    to: contact.email,

    subject: "Response to Your Contact Message",

    html: `
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<style>

body{
font-family:Arial,Helvetica,sans-serif;
background:#f3f4f6;
padding:30px;
}

.container{
max-width:700px;
margin:auto;
background:white;
padding:30px;
border-radius:10px;
box-shadow:0 0 10px rgba(0,0,0,.08);
}

.header{
background:#16a34a;
color:white;
padding:20px;
text-align:center;
font-size:24px;
font-weight:bold;
border-radius:8px;
}

.section{
margin-top:25px;
color:#444;
font-size:16px;
line-height:1.8;
}

.message{
margin-top:20px;
background:#f9fafb;
padding:18px;
border-left:5px solid #16a34a;
}

.reply{
margin-top:20px;
background:#ecfdf5;
padding:20px;
border-radius:8px;
border:1px solid #16a34a;
}

.footer{
margin-top:35px;
font-size:13px;
text-align:center;
color:#777;
}

</style>

</head>

<body>

<div class="container">

<div class="header">
Support Team Reply
</div>

<div class="section">

<p>Hello <strong>${contact.name}</strong>,</p>

<p>
Thank you for contacting us.
Our support team has reviewed your message and provided the following response.
</p>

<div class="message">

<p><strong>Your Subject</strong></p>

<p>${contact.subject}</p>

<p><strong>Your Message</strong></p>

<p>${contact.message}</p>

</div>

<div class="reply">

<h3>Our Reply</h3>

<p>${contact.adminReply}</p>

</div>

<p>
If you have additional questions, simply send us another message and we'll be happy to assist you.
</p>

</div>

<div class="footer">

Thank you for choosing our services.

</div>

</div>

</body>

</html>
`,
  };

  return transporter.sendMail(mailOptions);
};

/* ============================================
   Test Connection
============================================ */

exports.verifyConnection = async () => {
  return transporter.verify();
};
