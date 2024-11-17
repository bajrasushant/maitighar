const bcrypt = require("bcrypt");
const adminRouter = require("express").Router();
const Admin = require("../models/admin");
const Department = require("../models/department");
const Ward = require("../models/ward");
const LocalGov = require("../models/localgov");
const WardOfficer = require("../models/wardOfficer");
const User = require("../models/user");

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

//Create new admin
adminRouter.post("/", async (request, response) => {
  try {
    const {
      username,
      password,
      repassword,
      email,
      responsible,
      assigned_province,
      assigned_district,
      assigned_local_gov,
      assigned_ward,
      assigned_department,
    } = request.body;

    // Check if responsible field is valid
    if (!["ward", "department"].includes(responsible)) {
      return response.status(400).json({ error: "Invalid admin responsible specified" });
    }

    if (responsible === "ward" && (!assigned_local_gov || !assigned_ward)) {
      return response
        .status(400)
        .json({ error: "Local government and ward assignment are required for ward admins" });
    }
    if (
      responsible === "department" &&
      (!assigned_province || !assigned_district || !assigned_department)
    ) {
      return response
        .status(400)
        .json({ error: "Province, district and department are required for department admins" });
    }

    //Input validation
    if (
      !username ||
      !password ||
      !repassword ||
      !email ||
      username.trim() === "" ||
      password.trim() === "" ||
      repassword.trim() === "" ||
      email.trim() === ""
    ) {
      return response
        .status(400)
        .json({ error: "username, password, repassword, email are required" });
    }
    if (username.length < 3 || password.length < 3) {
      return response.status(400).json({
        error: "username and password should contain at least 3 characters",
      });
    }
    if (password !== repassword) {
      return response.status(400).json({ error: "passwords do not match" });
    }

    if (responsible === "ward") {
      const existingAdmin = await Admin.findOne({
        assigned_local_gov,
        assigned_ward,
      });
      if (existingAdmin) {
        return response
          .status(400)
          .json({ error: `Ward ${assigned_ward} is already assigned to an admin.` });
      }
    }

    if (responsible === "department") {
      const existingAdmin = await Admin.findOne({
        assigned_department,
      });
      if (existingAdmin) {
        return response
          .status(400)
          .json({ error: `Deparment ${assigned_department} is already assigned to an admin.` });
      }
    }

    //Hash password and save the admin in database
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const localgovdetails = await LocalGov.findById(assigned_local_gov);

    const admin = new Admin({
      username,
      passwordHash,
      email,
      responsible,
      assigned_province,
      assigned_district,
      assigned_local_gov: responsible === "ward" ? assigned_local_gov : undefined,
      assigned_ward: responsible === "ward" ? assigned_ward : undefined,
      assigned_department: responsible === "department" ? assigned_department : undefined,
    });
    const savedAdmin = await admin.save();

    if (responsible === "department" && assigned_department) {
      await Department.findByIdAndUpdate(assigned_department, { admin_registered: savedAdmin._id });
    }
    // Register admin to a ward
    else if (responsible === "ward" && assigned_local_gov && assigned_ward) {
      const ward = await Ward.findOne({ localGov: assigned_local_gov, number: assigned_ward });

      if (ward) {
        await Ward.findOneAndUpdate(
          { localGov: assigned_local_gov, number: assigned_ward },
          { admin_registered: savedAdmin._id },
        );
      } else {
        const localgovdetails = await LocalGov.findById(assigned_local_gov);
        const newWard = new Ward({
          number: assigned_ward,
          name: `${localgovdetails.name} Ward No. ${assigned_ward}`,
          localGov: assigned_local_gov,
          admin_registered: savedAdmin._id,
        });
        await newWard.save();
      }
    }
    return response.status(201).json(savedAdmin);
  } catch (error) {
    console.error("Error during admin creation:", error);

    if (error.name === "ValidationError") {
      return response.status(400).json({ error: error.message });
    }

    if (error.code === 11000) {
      // Duplicate key error
      return response.status(400).json({
        error: "Username or email already exists",
      });
    }
    return response.status(500).json({ error: "Something went wrong" });
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

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user is already a ward officer
    const existingOfficer = await WardOfficer.findOne({ user: userId });
    if (existingOfficer) {
      return res.status(400).json({ error: "User is already a ward officer" });
    }

    // Validate ward number against local government
    const LocalGov = require("../models/localGov");
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
module.exports = adminRouter;
