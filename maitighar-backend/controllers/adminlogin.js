const jwt = require("jsonwebtoken");
const config = require("../utils/config");
const bcrypt = require("bcrypt");
const adminloginRouter = require("express").Router();
const Admin = require("../models/admin");

adminloginRouter.post("/", async (request, response) => {
  try {
    const { username, password } = request.body;
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const admin = await Admin.findOne({ username: trimmedUsername });

    const passwordCorrect =
      admin === null ? false : await bcrypt.compare(trimmedPassword, admin.passwordHash);
    console.log(admin);
    if (!(admin && passwordCorrect)) {
      return response.status(401).json({
        error: "invalid username or password",
      });
    }

    const adminToken = {
      username: admin.username,
      id: admin._id,
    };
    const token = jwt.sign(adminToken, config.SECRET);

    response.status(200).send({
      token,
      username: admin.username,
      email: admin.email,
      id: admin._id,
      department: admin.department,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return response.status(500).json({ error: "Internal sever error" });
  }
});

//Create new admin
adminloginRouter.post("/register", async (request, response) => {
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
}
);
module.exports = adminloginRouter;
