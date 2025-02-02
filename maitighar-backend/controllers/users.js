const bcrypt = require("bcrypt");
const userRouter = require("express").Router();
const nodemailer = require("nodemailer");
const User = require("../models/user");
const WardOfficer = require("../models/wardOfficer");
const PromotionRequest = require("../models/promotionRequest");

const { addNotification } = require("../utils/notification"); // Adjust the path as needed

// In-memory storage for OTP
const otpStore = {};

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

  // Check if the email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return response.status(400).json({ error: "Email already exists" });
  }

  // Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // A 4-digit OTP
  const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // OTP valid for 2 minutes

  // Store OTP temporarily in-memory
  otpStore[email] = { otp, otpExpiresAt, username, password };

  // Send OTP to the user's email
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    debug: true, // This enables debugging logs
    logger: true, // This enables the logging of emails being sent
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verify your account",
    text: `Your OTP code is ${otp}. It will expire in 2 minutes.`,
  };

  console.log("Sending mail to:", email);
  console.log(mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return response.status(500).json({ error: "Failed to send OTP email" });
    }
    return response.status(201).json({
      message: "OTP sent to email. Please verify OTP to complete registration",
    });
  });
});

// OTP verification route
userRouter.post("/verify-otp", async (request, response) => {
  const { email, otp } = request.body;

  if (!email || !otp) {
    return response.status(400).json({ error: "Email and OTP are required" });
  }

  const otpEntry = otpStore[email];

  if (!otpEntry) {
    return response.status(400).json({ error: "No OTP found for this email" });
  }

  if (otpEntry.otp !== otp) {
    return response.status(400).json({ error: "Invalid OTP" });
  }

  if (otpEntry.otpExpiresAt < Date.now()) {
    return response.status(400).json({ error: "OTP expired" });
  }

  // OTP is valid, proceed with user registration
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(otpEntry.password, saltRounds);

    const user = new User({
      username: otpEntry.username,
      passwordHash,
      email,
      role: "User",
    });

    await user.save();

    // Clear OTP from in-memory store after successful registration
    delete otpStore[email];

    return response.status(200).json({ message: "OTP verified and user registered successfully" });
  } catch (error) {
    return response.status(500).json({ error: "Something went wrong" });
  }
});

// Resend OTP route
userRouter.post("/resend-otp", async (request, response) => {
  const { email } = request.body;

  // Check if the email exists in OTP store
  if (!otpStore[email]) {
    return response.status(400).json({ error: "No OTP request found for this email" });
  }

  // Generate a new OTP
  const newOtp = Math.floor(1000 + Math.random() * 9000).toString(); // A 4-digit OTP
  const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // OTP valid for 4 minutes

  // Update the stored OTP
  otpStore[email].otp = newOtp;
  otpStore[email].otpExpiresAt = otpExpiresAt;

  // Send the new OTP to the user's email
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Resend OTP",
    text: `Your new OTP code is ${newOtp}. It will expire in 2 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return response.status(500).json({ error: "Failed to send OTP email" });
    }
    return response.status(200).json({
      message: "New OTP sent to email. Please verify it to complete registration.",
    });
  });
});

//Get user notifications
userRouter.get("/:id/notifications", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("notifications");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const sortedNotifications = user.notifications.sort((a, b) => b.timestamp - a.timestamp);
    res.json(sortedNotifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

//Mark notification as read
userRouter.patch("/:id/notifications/:notificationId", async (req, res) => {
  try {
    const { id, notificationId } = req.params;

    const user = await User.findOneAndUpdate(
      { _id: id, "notifications._id": notificationId },
      { $set: { "notifications.$.read": true } },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update notification status." });
  }
});

userRouter.post("/test-notification", async (req, res) => {
  const { userId, issueId, message } = req.body;

  try {
    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message are required" });
    }

    console.log("Received test-notification request:", { userId, message });

    const metadata = { issueId: "exampleIssueId" }; // Optional
    await addNotification(userId, issueId, message, metadata);

    res.status(200).json({ message: "Notification added successfully!" });
  } catch (error) {
    console.error("Error in /test-notification route:", error);
    res.status(500).json({ error: "Failed to add notification", details: error.message });
  }
});

module.exports = userRouter;
