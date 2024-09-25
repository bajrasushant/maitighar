const bcrypt = require("bcrypt");
const adminRouter = require("express").Router();
const Admin = require("../models/admin");

const departments = [
  "Ward No.1", "Ward No.2", "Ward No.3", "Ward No.4", "Ward No.5",
  "Ward No.6", "Ward No.7", "Ward No.8", "Ward No.9", "Ward No.10",
  "Ward No.11", "Ward No.12", "Ward No.13", "Ward No.14", "Ward No.15",
  "Ward No.16", "Ward No.17", "Ward No.18", "Ward No.19", "Ward No.20",
  "Ward No.21", "Ward No.22", "Ward No.23", "Ward No.24", "Ward No.25",
  "Ward No.26", "Ward No.27", "Ward No.28", "Ward No.29", "Ward No.30",
  "Ward No.31", "Ward No.32"
];

//Get all admins
adminRouter.get("/", async (request, response) => {
  try{
    const users = await Admin.find({});
    response.json(users);
  }catch(error){
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
        id: admin._id
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
  try{
    console.log(request.body);
    const { username, password, repassword, email, department } = request.body;

    //Input validation
    if (!username || !password || !repassword || !email || !department ||
        username.trim() === "" || password.trim() === "" || repassword.trim() === "" || email.trim() === "") {
      return response
        .status(400)
        .json({ error: "username, password, repassword, email, and department are required" });
    }
    if (username.length < 3 || password.length < 3) {
      return response.status(400).json({
        error: "username and password should contain at least 3 characters",
      });
    }
    if (password !== repassword) {
      return response.status(400).json({ error: "passwords do not match" });
    }
    if (!departments.includes(department)) {
      return response.status(400).json({ error: "Invalid department" });
    }

    // Check if admin already exists for the department
    const existingAdmin = await Admin.findOne({ department });
    if (existingAdmin) {
      return response.status(400).json({ error: "An admin for this department already exists" });
    }

    //Hash password and save the admin in database
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const admin = new Admin({
      username,
      passwordHash,
      email,
      department,
    });
    const savedAdmin = await admin.save();
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
