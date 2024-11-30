const adminRouter = require("express").Router();
const Admin = require("../models/admin");
const LocalGov = require("../models/localgov");
const PromotionRequest = require("../models/promotionRequest");
const WardOfficer = require("../models/wardOfficer");
const User = require("../models/user");
const Issue = require("../models/issue");
const mongoose = require("mongoose");

//Get all admins
adminRouter.get("/", async (request, response) => {
  try {
    const users = await Admin.find({});
    response.json(users);
  } catch (error) {
    console.error("Error fetching admins:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});
adminRouter.get("/active-users", async (req, res) => {
  try {
    console.log(req.query);
    const { province, district, localGovId, ward } = req.query;

    if (!province || !district || !localGovId || !ward) {
      return res.status(400).json({ error: "Missing required query parameters" });
    }

    // Validate the local government and ward
    const localGov = await LocalGov.findById(localGovId);
    if (!localGov || ward > localGov.number_of_wards) {
      return res.status(400).json({ error: "Invalid ward number or local government ID" });
    }

    // Aggregate activity scores
    const activeUsers = await Issue.aggregate([
      {
        $match: {
          assigned_province: new mongoose.Types.ObjectId(province),
          assigned_district: new mongoose.Types.ObjectId(district),
          assigned_local_gov: new mongoose.Types.ObjectId(localGovId),
          assigned_ward: parseInt(ward),
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "issueComments",
        },
      },
      {
        $unwind: {
          path: "$upvotedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$issueComments",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$upvotedBy",
          activityScore: { $sum: 1 },
          commentsScore: {
            $sum: { $cond: [{ $ifNull: ["$issueComments.createdBy", false] }, 1, 0] },
          }, // Count comments
        },
      },
      {
        $addFields: {
          totalActivityScore: { $add: ["$activityScore", "$commentsScore"] },
        },
      },
      {
        $sort: { totalActivityScore: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 0,
          userId: "$userDetails._id",
          username: "$userDetails.username",
          email: "$userDetails.email",
          activityScore: "$totalActivityScore",
        },
      },
    ]);

    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching active users", details: error.message });
  }
});

adminRouter.get("/me", async (request, response) => {
  try {
    const user = request.user;
    const userType = request.userType;

    if (!user) {
      return response.status(404).json({ error: "No user found in request" });
    }

    if (userType === "admin") {
      const adminData = {
        username: user.username,
        email: user.email,
        responsible: user.responsible,
        assigned_province: user.assigned_province,
        assigned_district: user.assigned_district,
        assigned_local_gov: user.assigned_local_gov,
        assigned_ward: user.assigned_ward,
        assigned_department: user.assigned_department,
      };
      return response.json(adminData);
    }

    if (userType === "user") {
      const userData = {
        username: user.username,
        email: user.email,
      };
      return response.json(userData);
    }

    return response.status(400).json({ error: "Unknown user type" });
  } catch (error) {
    console.error("Error fetching user/admin info:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
});

//Get admin by ID
adminRouter.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const admin = await Admin.findById(id).select("username email department");

    if (admin) {
      return response.json({
        username: admin.username,
        email: admin.email,
        department: admin.department,
        id: admin._id,
      });
    } else {
      return response.status(404).json({ error: "Admin not found" });
    }
  } catch (error) {
    console.error("Error fetching admin info:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
});

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Error verifying admin status" });
  }
};

// Promote user to ward officer
adminRouter.post("/promote-ward-officer", isAdmin, async (req, res) => {
  try {
    const { userId, assigned_province, assigned_district, assigned_local_gov, assigned_ward } =
      req.body;

    if (
      !userId ||
      !assigned_province ||
      !assigned_district ||
      !assigned_local_gov ||
      !assigned_ward
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingOfficer = await WardOfficer.findOne({ user: userId });
    if (existingOfficer) {
      return res.status(400).json({ error: "User is already a ward officer" });
    }
    const officerCount = await WardOfficer.countDocuments({
      assigned_local_gov,
      assigned_ward,
      is_active: true,
    });

    if (officerCount >= 5) {
      return res.status(400).json({
        error: "This ward already has the maximum number of ward officers (5)",
      });
    }

    const localGov = await LocalGov.findById(assigned_local_gov);
    if (!localGov || assigned_ward > localGov.number_of_wards) {
      return res
        .status(400)
        .json({ error: "Invalid ward number for the selected local government" });
    }

    // Create new ward officer
    const wardOfficer = new WardOfficer({
      user: userId,
      assigned_province,
      assigned_district,
      assigned_local_gov,
      assigned_ward,
      appointed_date: new Date(),
      is_active: true,
    });

    await wardOfficer.save();

    // Update user's role
    user.role = "wardOfficer";
    await user.save();

    res.status(201).json({
      message: "User successfully promoted to ward officer",
      wardOfficer,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error promoting user to ward officer",
      details: error.message,
    });
  }
});

// Deactivate ward officer
adminRouter.post("/deactivate-ward-officer/:id", isAdmin, async (req, res) => {
  try {
    const wardOfficer = await WardOfficer.findById(req.params.id);
    if (!wardOfficer) {
      return res.status(404).json({ error: "Ward officer not found" });
    }

    wardOfficer.is_active = false;
    await wardOfficer.save();

    // Update user's role back to regular user
    const user = await User.findById(wardOfficer.user);
    if (user) {
      user.role = "user";
      await user.save();
    }

    res.json({ message: "Ward officer successfully deactivated" });
  } catch (error) {
    res.status(500).json({
      error: "Error deactivating ward officer",
      details: error.message,
    });
  }
});

// Get all ward officers with filters
adminRouter.get("/ward-officers", isAdmin, async (req, res) => {
  try {
    const { province, district, local_gov, ward, active_only } = req.query;

    const filter = {};
    if (province) filter.assigned_province = province;
    if (district) filter.assigned_district = district;
    if (local_gov) filter.assigned_local_gov = local_gov;
    if (ward) filter.assigned_ward = parseInt(ward);
    if (active_only === "true") filter.is_active = true;

    const wardOfficers = await WardOfficer.find(filter)
      .populate("user", "username email")
      .populate("assigned_province", "name")
      .populate("assigned_district", "name")
      .populate("assigned_local_gov", "name");

    res.json(wardOfficers);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching ward officers",
      details: error.message,
    });
  }
});

adminRouter.get("/promotion-requests", async (request, response) => {
  try {
    if (admin.responsible !== "ward") {
      response.status(400).json({ error: "Not applicable for departments." });
    }
    const adminId = request.user.id;
    const admin = await Admin.findById(adminId).select(
      "username email responsible assigned_province assigned_district assigned_local_gov assigned_ward",
    );
    const requests = await PromotionRequest.find({
      status: "Pending",
      assigned_province: admin.assigned_province,
    })
      .populate("user", "username email")
      .exec();

    response.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching promotion requests:", error);
    response.status(500).json({ error: "Internal server error." });
  }
});

adminRouter.post("/promotion-review/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const { status } = request.body;

    if (!["Accepted", "Declined"].includes(status)) {
      return response.status(400).json({ error: "Invalid status." });
    }

    const promotionRequest = await PromotionRequest.findById(id);

    if (!promotionRequest) {
      return response.status(404).json({ error: "Promotion request not found." });
    }

    promotionRequest.status = status;
    await promotionRequest.save();

    if (status === "Accepted") {
      const user = await User.findById(promotionRequest.user);
      user.role = promotionRequest.requestedRole;
      const wardOfficer = await WardOfficer.save({
        user: user._id,
        assigned_province: promotionRequest.assigned_province,
        assigned_district: promotionRequest.assigned_district,
        assigned_local_gov: promotionRequest.assigned_local_gov,
        assigned_ward: promotionRequest.assigned_ward,
      });
      await user.save();
      await wardOfficer.save();
    }
    response.status(200).json({ message: `Request ${status.toLowerCase()} successfully.` });
  } catch (error) {
    console.error("Error reviewing promotion request:", error);
    response.status(500).json({ error: "Internal server error." });
  }
});
module.exports = adminRouter;
