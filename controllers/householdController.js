const Household = require("../models/Household");
const User = require("../models/User");

/*
================================================
GET MY HOUSEHOLD
Automatically creates household if missing
================================================
*/

exports.getMyHousehold = async (req, res) => {
  try {
    // From logged user authentication
    const email = req.user.email;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let household = await Household.findOne({
      ownerEmail: email,
    });

    // First time accessing household
    if (!household) {
      household = await Household.create({
        ownerEmail: user.email,

        householdName: `${user.name} Household`,

        members: [
          {
            userEmail: user.email,

            name: user.name,

            role: "Head of Household",

            phone: user.phone || "",
          },
        ],
      });
    }

    res.json({
      success: true,

      household,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/*
================================================
ADD FAMILY MEMBER
================================================
*/

exports.addMember = async (req, res) => {
  try {
    const emailOwner = req.user.email;

    const { memberEmail, role, phone } = req.body;

    const household = await Household.findOne({
      ownerEmail: emailOwner,
    });

    if (!household) {
      return res.status(404).json({
        success: false,

        message: "Household not found",
      });
    }

    const user = await User.findOne({
      email: memberEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,

        message: "Member account does not exist",
      });
    }

    const exists = household.members.some(
      (member) => member.userEmail === memberEmail,
    );

    if (exists) {
      return res.status(400).json({
        success: false,

        message: "Member already exists",
      });
    }

    household.members.push({
      userEmail: user.email,

      name: user.name,

      role: role || "Member",

      phone: phone || user.phone || "",
    });

    await household.save();

    res.json({
      success: true,

      message: "Family member added successfully",

      household,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/*
================================================
UPDATE MEMBER
================================================
*/

exports.updateMember = async (req, res) => {
  try {
    const ownerEmail = req.user.email;

    const { memberId } = req.params;

    const { name, role, phone } = req.body;

    const household = await Household.findOne({
      ownerEmail,
    });

    const member = household.members.id(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,

        message: "Member not found",
      });
    }

    if (name) member.name = name;

    if (role) member.role = role;

    if (phone) member.phone = phone;

    await household.save();

    res.json({
      success: true,

      message: "Member updated",

      household,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/*
================================================
DELETE MEMBER
================================================
*/

exports.deleteMember = async (req, res) => {
  try {
    const ownerEmail = req.user.email;

    const { memberId } = req.params;

    const household = await Household.findOne({
      ownerEmail,
    });

    const member = household.members.id(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,

        message: "Member not found",
      });
    }

    if (member.role === "Head of Household") {
      return res.status(400).json({
        success: false,

        message: "Owner cannot be removed",
      });
    }

    member.deleteOne();

    await household.save();

    res.json({
      success: true,

      message: "Member removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
