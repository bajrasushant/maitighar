const bcrypt = require("bcrypt");
const adminRouter = require("express").Router();
const Admin = require("../models/admin");
const Department = require("../models/department");
const Ward = require("../models/ward");

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
      await Ward.findOneAndUpdate(
        { localGov: assigned_local_gov, number: assigned_ward },
        { admin_registered: savedAdmin._id },
      );
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
module.exports = adminRouter;
