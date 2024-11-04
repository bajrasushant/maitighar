const express = require("express");
const multer = require("multer");
const path = require("path");
const Issue = require("../models/issue");
const User = require("../models/user");
const Admin = require("../models/admin");
const Category = require("../models/category");
const Department = require("../models/department");
const Province = require("../models/province");
const District = require("../models/district");
const LocalGov = require("../models/localgov");

const issueRouter = express.Router();

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/issues/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 200 }, // Limit file size to 200MB
  fileFilter: (req, file, cb) => {
    // Regular expression to match allowed file extensions
    const fileTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    // Allow files with correct MIME type and extension
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg, .gif, .jpeg, .mp4, .avi, .mkv formats are allowed!"));
    }
  },
});

// Create a new issue with image upload
issueRouter.post("/", upload.array("images", 5), async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const {
      title,
      description,
      department,
      assigned_province,
      assigned_district,
      assigned_localGov,
      assigned_ward,
      latitude,
      longitude,
      status,
      type,
      category,
    } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const imagePaths = req.files ? req.files.map((file) => file.path) : [];

    // Validate the province
    const province = await Province.findById(assigned_province);
    if (!province) {
      return res.status(400).json({ error: "Invalid province selected" });
    }

    // Validate the district
    const district = await District.findOne({ _id: assigned_district, province: province._id });
    if (!district) {
      return res.status(400).json({ error: "Invalid district selected for the given province" });
    }

    // Validate the local government (if provided)
    let localGov = null;
    if (assigned_localGov) {
      localGov = await LocalGov.findOne({ _id: assigned_localGov, district: district._id });
      if (!localGov) {
        return res
          .status(400)
          .json({ error: "Invalid local government selected for the district" });
      }

      // Validate the ward number (if local government is provided)
      if (!assigned_ward || assigned_ward <= 0 || assigned_ward > localGov.number_of_wards) {
        return res
          .status(400)
          .json({ error: "Assigned ward must be within the local government's range" });
      }
    }

    const issue = new Issue({
      title,
      type,
      description,
      department,
      assigned_province,
      assigned_district,
      assigned_local_gov: localGov ? localGov.id : null,
      assigned_ward: localGov ? assigned_ward : null,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      latitude,
      longitude,
      status,
      createdBy: user.id,
      comments: [],
      imagePaths,
      category,
    });

    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get nearby issues
issueRouter.get("/nearby", async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query;

    const lat = parseFloat(latitude);
    const long = parseFloat(longitude);
    const maxDist = parseInt(maxDistance);

    if (isNaN(lat) || isNaN(long)) {
      return res.status(400).json({ error: "Latitude and longitude must be valid numbers." });
    }

    if (isNaN(maxDist) || maxDist < 0) {
      return res.status(400).json({ error: "maxDistance must be a valid positive number." });
    }

    const issues = await Issue.find({
      $and: [
        {
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [long, lat],
              },
              $maxDistance: maxDist,
            },
          },
        },
        {
          location: {
            $exists: true,
            $ne: null,
          },
        },
      ],
    }).populate("comments");
    res.json(issues);
  } catch (error) {
    console.error("Error fetching nearby issues:", error);
    res.status(500).json({ message: "Error fetching nearby issues", error: error.message });
  }
});

// Get issue by department for admin
issueRouter.get("/admin/", async (req, res) => {
  try {
    // Find issues by department
    const adminData = await Admin.findById(req.query.adminId);
    let issues;
    if (adminData.responsible === "ward") {
      issues = await Issue.find({
        assigned_local_gov: adminData.assigned_local_gov,
        assigned_ward: adminData.assigned_ward,
      })
        .populate("createdBy", { username: 1 })
        .populate("comments");
    } else if (adminData.responsible === "department") {
      const department = await Department.find({ _id: adminData.assigned_department });
      issues = await Issue.find({ cateogyr: department.category })
        .populate("createdBy", { username: 1 })
        .populate("comments");
    }

    // If no issues are found, return 404
    if (issues.length === 0) {
      return res.status(404).json({ error: "No issues found for this department" });
    }

    // Return the found issues
    res.json(issues);
  } catch (error) {
    console.error("Error fetching issues by department:", error);
    // Handle errors and return 500
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
    console.error("Error fetchin issues:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a issue by ID
issueRouter.get("/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate("createdBy", {
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
// // Combined update route
// issueRouter.put("/:id", upload.single("image"), async (req, res) => {
//   try {
//     const updates = req.body;
//
//     // Handle image upload if present
//     if (req.file) {
//       updates.imagePath = req.file.path;
//     }
//
//     // Handle status update if present
//     if (updates.status) {
//       const issue = await Issue.findById(req.params.id);
//       if (!issue) {
//         return res.status(404).json({ error: "Issue not found" });
//       }
//       issue.status = updates.status;
//       const updatedIssue = await issue.save();
//       return res.json(updatedIssue);
//     }
//
//     // Handle other updates
//     const issue = await Issue.findByIdAndUpdate(req.params.id, updates, {
//       new: true,
//       runValidators: true,
//     });
//
//     if (!issue) {
//       return res.status(404).json({ error: "Issue not found" });
//     }
//
//     res.json(issue);
//   } catch (error) {
//     console.error("Error updating issue:", error);
//     res.status(400).json({ error: "Bad request" });
//   }
// });

//Get issues created by the logged-in user
issueRouter.get("/user/user-posts", async (req,res) => {
  try {
    // Check if the user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated"});
    }

    const userIssues = await Issue.find({ createdBy: req.user.id});

    res.json(userIssues);
  }catch (error) {
    console.error("Error fetchong user issues:", error);
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

    const issue = await Issue.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

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
      return res.status(403).json({ error: "You do not have permission to delete this issue" });
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

    const hasUpvoted = issue.upvotedBy.some(
      (userId) => userId.toString() === req.user.id.toString(),
    );

    if (hasUpvoted) {
      issue.upvotes -= 1;
      issue.upvotedBy = issue.upvotedBy.filter(
        (userId) => userId.toString() !== req.user.id.toString(),
      );
    } else {
      issue.upvotes += 1;
      issue.upvotedBy.push(req.user.id);
    }

    await issue.save();
    res.json(issue);
  } catch (error) {
    console.error("Upvote error:", error); // Log the error for more insight
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = issueRouter;
