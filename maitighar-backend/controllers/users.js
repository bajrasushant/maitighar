const bcrypt = require("bcrypt");
const userRouter = require("express").Router();
const User = require("../models/user");

userRouter.get("/", async (request, response) => {
  const users = await User.find({});
  response.json(users);
});

userRouter.post("/", async (request, response) => {
  const { username, password, repassword, email } = request.body;
  if (
    !username ||
    !password ||
    !repassword ||
    username.trim() === "" ||
    password.trim() === "" ||
    repassword.trim() === ""
  ) {
    return response.status(400).json({ error: "username, password, and repassword are required" });
  }

  if (!(username.length >= 3 && password.length >= 3)) {
    return response.status(400).json({
      error: "username and password should contain at least 3 characters",
    });
  }

  if (password !== repassword) {
    return response.status(400).json({ error: "passwords do not match" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    passwordHash,
    email,
    role: "citizen",
  });

  try {
    const savedUser = await user.save();
    return response.status(201).json(savedUser);
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

module.exports = userRouter;
