const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

/* ===========================================================
   JWT TOKEN GENERATOR
=========================================================== */

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

/* ===========================================================
   NODEMAILER CONFIGURATION
=========================================================== */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ===========================================================
   SEND WELCOME EMAIL
=========================================================== */

const sendWelcomeEmail = async (user) => {
  try {
    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Welcome to Our Platform",

      html: `
      <div style="font-family:Arial;padding:30px;background:#f5f5f5">

        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px">

          <h2 style="color:#2563eb">
            Welcome ${user.name} 👋
          </h2>

          <p>
            Your account has been created successfully.
          </p>

          <table style="margin-top:20px">

            <tr>
              <td><b>Name</b></td>
              <td>${user.name}</td>
            </tr>

            <tr>
              <td><b>Email</b></td>
              <td>${user.email}</td>
            </tr>

            <tr>
              <td><b>Phone</b></td>
              <td>${user.phone}</td>
            </tr>

          </table>

          <br>

          <p>
            Thank you for joining us.
          </p>

        </div>

      </div>
      `,
    });
  } catch (error) {
    console.log("Email Error:", error.message);
  }
};

/* ===========================================================
   REGISTER USER
=========================================================== */

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await sendWelcomeEmail(user);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token: generateToken(user._id),
     
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ===========================================================
   LOGIN USER
=========================================================== */

exports.login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password.",
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   GET ALL USERS
=========================================================== */

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({
        createdAt: -1,
      });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ===========================================================
   GET USER BY ID
=========================================================== */

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ===========================================================
   UPDATE USER
=========================================================== */

exports.updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ===========================================================
   DELETE USER
=========================================================== */

// exports.deleteUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found.",
//       });
//     }

//     await user.deleteOne();

//     res.json({
//       success: true,
//       message: "User deleted successfully.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Prevent deletion of the protected account
    if (user.email && user.email.toLowerCase() === "john.smith@gmail.com") {
      return res.status(403).json({
        success: false,
        message: "This user account cannot be deleted.",
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ===========================================================
   USER STATISTICS
=========================================================== */

exports.statistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const admins = await User.countDocuments({
      role: "admin",
    });

    const users = await User.countDocuments({
      role: "user",
    });

    const verifiedUsers = await User.countDocuments({
      isVerified: true,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday = await User.countDocuments({
      createdAt: {
        $gte: today,
      },
    });

    res.json({
      totalUsers,
      admins,
      users,
      verifiedUsers,
      newUsersToday,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};