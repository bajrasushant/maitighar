const bcrypt = require("bcrypt");
const adminRouter = require("express").Router();
const Admin = require("../models/admin");

const departments = ["roads", "water", "education", "garbage", "health"];

adminRouter.get("/", async (request, response) => {
    const users = await Admin.find({});
    response.json(users);
});

adminRouter.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const admin = await Admin.findById(id).select('username email department');
    
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
    console.error('Error fetching admin info:', error);
    return response.status(500).json({ error: "Internal server error" });
  }
});

adminRouter.post("/", async (request, response) => {
    const { username, password, repassword, email, department } = request.body;
    
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

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const admin = new Admin({
        username,
        passwordHash,
        email,
        department,
    });

    try {
        const savedAdmin = await admin.save();
        return response.status(201).json(savedAdmin);
    } catch (error) {
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