const express = require("express");

const multer = require("multer");
const path = require("path");
const Issue = require("../models/issue");
const User = require("../models/user");

const issueRouter = express.Router();

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/issues/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 50 }, // Limit file size to 50MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  }
});

// Create a new issue with image upload
issueRouter.post("/", upload.array("images", 5), async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const { title, description, department, latitude, longitude, status, type, category } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    const issue = new Issue({
      title,
      type,
      description,
      department,
      latitude,
      longitude,
      status,
      createdBy: user.id,
      comments: [],
      imagePaths,
      category
    });

    await issue.save();
    res.status(201).json(issue);

  } catch (error) {
    console.error("Error creating issue:",error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all issues
issueRouter.get("/", async (req, res) => {
  try {
    const issues = await Issue.find({}).populate("comments");
    const issuesWithCommentLength = issues.map((issue) => ({
      ...issue.toJSON(),
      commentCount: issue.comments.length,
    }));
    res.json(issuesWithCommentLength);
  } catch (error) {
    console.error("Error fetchin issues:",error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a issue by ID
issueRouter.get("/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("createdBy", {
        username: 1,
      });

    if (!issue) {
      return res.status(404).json({ error: "issue not found" });
    }

    res.status(201).json(issue);
  } catch (error) {
    console.error("Error fetching issue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a issue
issueRouter.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    issue.status = status;
    await issue.save();
    res.json(issue);
  } catch (error) {
    console.error("Error updating issue status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update an issue with image upload
issueRouter.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updates = req.body;

    if (req.file) {
      updates.imagePath = req.file.path;
    }

    const issue = await Issue.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.json(issue);
  } catch (error) {
    console.error("Error updating issue", error);
    res.status(400).json({ error: "Bad request" });
  }
});

// Delete an issue
issueRouter.delete("/:id", async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: "issue not found" });
    }

    //Check if user can delete the issue
    if (issue.createdBy.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this issue" });
    }
    res.json({ message: "Issue deleted" });
  } catch (error) {
    console.error("Error deleting issue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Upvote an issue
issueRouter.put("/:id/upvote", async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    const hasUpvoted = issue.upvotedBy.some(userId => userId.toString() === req.user.id.toString());

    if (hasUpvoted) {
      issue.upvotes -= 1;
      issue.upvotedBy = issue.upvotedBy.filter(userId => userId.toString() !== req.user.id.toString());
    } else {
      issue.upvotes += 1;
      issue.upvotedBy.push(req.user.id);
    }

    await issue.save();
    res.json(issue);
  } catch (error) {
    console.error("Upvote error:", error);  // Log the error for more insight
    res.status(500).json({ error: "Internal server error" });
  }
});


// Get issue by department for admin
issueRouter.get("/admin/:department", async (req, res) => {
  try {
    // Find issues by department
    console.log(req.params.department);
    const issues = await Issue.find({ department: req.params.department })
      .populate("createdBy", { username: 1 })
      .populate("comments"); // Populating comments if needed

    // If no issues are found, return 404
    if (issues.length === 0) {
      return res
        .status(404)
        .json({ error: "No issues found for this department" });
    }

    // Return the found issues
    res.json(issues);
  } catch (error) {
    console.error("Error fetching issues by department:", error);
    // Handle errors and return 500
    res.status(500).json({ error:  "Internal server error" });
  }
});

module.exports = issueRouter;
