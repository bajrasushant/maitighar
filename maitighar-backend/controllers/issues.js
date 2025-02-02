const express = require("express");
const multer = require("multer");
const path = require("path");
const Issue = require("../models/issue");
const User = require("../models/user");
const Admin = require("../models/admin");
const WardOfficer = require("../models/wardOfficer");
const Department = require("../models/department");
const Province = require("../models/province");
const District = require("../models/district");
const LocalGov = require("../models/localgov");
const Comment = require("../models/comment");
const { addNotification } = require("../utils/notification");
const nodemailer = require("nodemailer");

const NepaliProfanityFilter = require("../utils/profanityfilter");
const profanityFilter = new NepaliProfanityFilter();

profanityFilter
  .loadProfaneWords()
  .then(() => {
    console.log("Profanity filter ready for use.");
  })
  .catch((error) => {
    console.error("Failed to initialize profanity filter:", error);
  });

const issueRouter = express.Router();
const { analyzeSentiment } = require("../controllers/sentiment");
const { summarizeText } = require("../controllers/summarization");

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

    // Check profanity only if the filter is ready
    if (!profanityFilter.isReady) {
      return res.status(503).json({
        error: "Profanity filter is not initialized. Please try again later.",
      });
    }

    //     if (
    //   profanityFilter.containsProfaneWord(sanitizedTitle) ||
    //   profanityFilter.containsProfaneWord(sanitizedDescription)
    // ) {
    //   return res.status(400).json({
    //     error: "Profane language is not allowed in title or description.",
    //   });
    // }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

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

    // Sanitize profane words in title and description
    const sanitizedTitle = profanityFilter.censorText(title);
    const sanitizedDescription = profanityFilter.censorText(description);

    const issue = new Issue({
      title: sanitizedTitle,
      type,
      description: sanitizedDescription,
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

    // Then analyze sentiment & summarize text and update the issue
    const sentimentResult = await analyzeSentiment(issue._id);
    const summarizedText = await summarizeText(issue._id);

    // Update the issue with sentiment data
    const updatedIssue = await Issue.findByIdAndUpdate(
      issue._id,
      {
        sentiment: sentimentResult.overall_sentiment,
        sentimentScore: sentimentResult.average_score,
        summary: summarizedText.summary,
      },
      { new: true },
    );

    // Find the admin for the assigned local government and ward
    const admin = await Admin.findOne({
      responsible: "ward",
      assigned_local_gov: assigned_localGov,
      assigned_ward,
    });

    if (admin) {
      // Send email to the admin
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
        from: '"Grievance Redressal System" <your-email@gmail.com>',
        to: admin.email,
        subject: `New Issue Assigned to Ward ${assigned_ward}`,
        text: `Hello ${admin.username},
    
    A new issue has been posted in your ward:
    Title: ${title}
    Description: ${description}
    
    Please log in to the system to view more details.
    
    Thank you,
    Grievance Redressal System`,
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(201).json(updatedIssue);
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Get issue by date for users
issueRouter.get("/user", async (req, res) => {
  try {
    const { limit = 5, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const issues = await Issue.find({})
      .sort(sortOptions)
      .limit(Number(limit))
      .populate("createdBy", { username: 1 });

    if (!issues.length) {
      return res.status(404).json({ error: "No recent issues found." });
    }
    res.json(issues);
  } catch (error) {
    console.error("Error fetching recent issues:", error);
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

issueRouter.get("/ward", async (req, res) => {
  try {
    const wardOfficer = await WardOfficer.findOne({ user: req.user.id });

    if (!wardOfficer) {
      return res.status(403).json({ error: "Not a ward officer" });
    }

    const issues = await Issue.find({
      assigned_local_gov: wardOfficer.assigned_local_gov,
      assigned_ward: wardOfficer.assigned_ward,
    });
    res.status(200).json(issues);
  } catch (error) {
    console.error("Error fetching ward issues:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get issue by department for admin
issueRouter.get("/admin", async (req, res) => {
  try {
    const { adminId, category, dateRange, sortBy = "date", sortOrder = "desc" } = req.query;

    if (!adminId) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    const adminData = await Admin.findById(adminId);
    if (!adminData) {
      return res.status(404).json({ error: "Admin not found" });
    }
    let issuesQuery = {};
    if (adminData.responsible === "ward") {
      issuesQuery = {
        assigned_local_gov: adminData.assigned_local_gov,
        assigned_ward: adminData.assigned_ward,
      };
    } else if (adminData.responsible === "department") {
      const department = await Department.findOne({ _id: adminData.assigned_department });
      if (!department) {
        return res.status(404).json({ error: "Department not found" });
      }
      issuesQuery = { category: department.category };
    }

    // Apply additional filters
    if (category) {
      issuesQuery.category = category;
    }
    if (dateRange) {
      const [start, end] = dateRange.split(",");
      issuesQuery.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }

    // Sort by the selected field and order
    const sortOptions = {};
    if (sortBy === "upvotes") {
      sortOptions.upvotes = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "sentimentScore") {
      sortOptions.sentimentScore = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = sortOrder === "asc" ? 1 : -1;
    }

    const issues = await Issue.find(issuesQuery)
      .sort(sortOptions)
      .populate("createdBy", { username: 1 })
      .populate("comments");

    // if (!issues.length) {
    //   return res.status(200).json(issues);
    // }
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
    const issues = await Issue.find({}).populate("comments").populate("createdBy");
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

issueRouter.get("/search", async (req, res) => {
  try {
    const { query, mode } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    let results = [];

    if (mode === ":all" || !mode) {
      const issueResults = await Issue.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } },
      )
        .sort({ score: { $meta: "textScore" } })
        .populate("createdBy category comments");

      let commentResults = await Comment.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } },
      ).sort({ score: { $meta: "textScore" } });

      if (commentResults.length === 0) {
        commentResults = await Comment.find({
          description: { $regex: query, $options: "i" },
        });
      }

      results = {
        issues: issueResults,
        comments: commentResults,
      };
    } else if (mode === ":issue") {
      results = await Issue.find({ $text: { $search: query } }, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .populate("createdBy category");
    } else if (mode === ":comment") {
      results = await Comment.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } },
      ).sort({ score: { $meta: "textScore" } });
    }

    res.json(results);
  } catch (error) {
    console.error("Error in search:", error);
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

    const admin = await Admin.findById(req.user.id);
    if (admin) {
      const issuesWithSentiment = await analyzeSentiment(issue.id);
      console.log(issuesWithSentiment);

      const summarizedText = await summarizeText(issue.id);
      console.log(summarizedText);
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
issueRouter.get("/user/user-posts", async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userIssues = await Issue.find({ createdBy: req.user.id });

    res.json(userIssues);
  } catch (error) {
    console.error("Error fetchong user issues:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Update a issue
issueRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Allowed fields for update
    const allowedUpdates = [
      "title",
      "description",
      "status",
      "category",
      "location",
      "latitude",
      "longitude",
      "assigned_province",
      "assigned_district",
      "assigned_local_gov",
      "assigned_ward",
      "type",
      "isActive",
    ];

    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidOperation) {
      return res.status(400).json({
        error: "Invalid updates!",
        allowedFields: allowedUpdates,
      });
    }

    const issue = await Issue.findById(id).populate("createdBy").populate("assigned_district");
    const userEmail = issue.createdBy.email;
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    if (!issue.isActive) {
      return res.status(403).json({ error: "Cannot update a deleted issue" });
    }

    if (updates.status) {
      if (!["open", "received", "resolved"].includes(updates.status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      if (updates.status === "received") {

        console.log("User email:", userEmail);
        console.log("district:", issue.assigned_district);
        // Configure Nodemailer transporter
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
          from: '"Grievance Redressal System" <your-email@gmail.com>',
          to: userEmail,
          subject: `Your Issue Has Been Received`,
          text: `Hello ${issue.createdBy.username},

The status of your issue titled "${issue.title}" has been updated to "${updates.status}" by the admin of Ward ${issue.assigned_ward} of ${issue.assigned_district.name} district.

Thank you,
Grievance Redressal System`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
      }

      if (updates.status === "resolved") {
        updates.resolvedAt = new Date();
        console.log("User email:", userEmail);
        console.log("district:", issue.assigned_district);
        // Configure Nodemailer transporter
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
          from: '"Grievance Redressal System" <your-email@gmail.com>',
          to: userEmail,
          subject: `Your Issue Has Been Marked Resolved`,
          text: `Hello ${issue.createdBy.username},

The status of your issue titled "${issue.title}" has been updated to "${updates.status}" by the admin of Ward ${issue.assigned_ward} of ${issue.assigned_district.name} district.
If you think that the issue has not been resolved you can reopen your issue.

Thank you,
Grievance Redressal System`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
      }
    }

    // Validate location if updating
    if (updates.location) {
      if (
        updates.location.type !== "Point" ||
        !Array.isArray(updates.location.coordinates) ||
        updates.location.coordinates.length !== 2
      ) {
        return res.status(400).json({ error: "Invalid location format" });
      }
    }

    const updateFields = [
      "title",
      "description",
      "status",
      "category",
      "location",
      "latitude",
      "longitude",
      "assigned_province",
      "assigned_district",
      "assigned_local_gov",
      "assigned_ward",
      "type",
      "isActive",
      "resolvedAt",
    ];

    updateFields.forEach((field) => {
      if (updates[field] !== undefined) {
        issue[field] = updates[field];
      }
    });

    // Special handling for ward validation
    if (updates.assigned_ward !== undefined) {
      if (issue.assigned_local_gov) {
        const localGov = await LocalGov.findById(issue.assigned_local_gov);
        if (
          !localGov ||
          updates.assigned_ward <= 0 ||
          updates.assigned_ward > localGov.number_of_wards
        ) {
          return res.status(400).json({
            error: "Invalid ward number for the selected local government",
          });
        }
      } else if (updates.assigned_ward) {
        return res.status(400).json({
          error: "Ward can only be set when a local government is assigned",
        });
      }
    }

    // Save the updated issue
    await issue.save();

    const populated = await issue.populate("createdBy");
    res.json(populated);
  } catch (error) {
    console.error("Error updating issue:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation Error",
        details: error.errors,
      });
    }

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
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: "issue not found" });
    }

    //Check if user can delete the issue
    if (issue.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "You do not have permission to delete this issue" });
    }

    // await issue.remove();
    issue.isActive = false;
    await issue.save();
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
    const userId = req.user.id;
    const upvoter = await User.findById(userId);
    const hasUpvoted = issue.upvotedBy.some((id) => id.toString() === userId.toString());

    if (hasUpvoted) {
      issue.upvotes -= 1;
      issue.upvotedBy = issue.upvotedBy.filter((id) => id.toString() !== userId.toString());
      // Remove the notification
      if (issue.createdBy && issue.createdBy._id.toString() !== userId) {
        const upvoter = await User.findById(userId); // Fetch upvoter details
        if (upvoter) {
          const notificationMessage = `${upvoter.username} upvoted your issue: "${issue.title}".`;

          await User.findByIdAndUpdate(
            issue.createdBy._id,
            {
              $pull: { notifications: { message: notificationMessage } },
            },
            { new: true }, // To return the updated user document
          );
        }
      }
    } else {
      issue.upvotes += 1;
      issue.upvotedBy.push(req.user.id);

      // Notify the issue creator
      if (issue.createdBy && issue.createdBy._id.toString() !== userId) {
        const upvoter = await User.findById(userId); // Fetch upvoter details
        if (upvoter) {
          const notificationMessage = `${upvoter.username} upvoted your issue: "${issue.title}".`;

          console.log("Notification message:", notificationMessage);
          await addNotification(issue.createdBy._id, issue.id, notificationMessage, {
            type: "upvote",
            issueId: issue._id,
          });
        }
      }
    }
    await issue.save();
    const populatedIssue = await issue.populate("createdBy");
    res.json(populatedIssue);
  } catch (error) {
    console.error("Upvote error:", error); // Log the error for more insight
    res.status(500).json({ error: "Internal server error" });
  }
});

//reopen issue
issueRouter.put("/:id/reopen", async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have middleware to get logged-in user info
    const user = await User.findById(req.user.id).select("username");

    const issue = await Issue.findById(req.params.id).populate("assigned_local_gov")
      .populate("assigned_ward");

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    if (issue.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "You can only reopen your own issues." });
    }

    if (issue.status !== "resolved") {
      return res.status(400).json({ error: "Only resolved issues can be reopened." });
    }

    issue.status = "open";
    issue.reopened = true;
    issue.resolvedAt = null;
    issue.reopenedAt = new Date();

    let admin;
    if (issue.assigned_local_gov) {
      // If the issue is assigned to a local government, check the local government and ward
      admin = await Admin.findOne({
        assigned_local_gov: issue.assigned_local_gov,
        assigned_ward: issue.assigned_ward,
      });
    }

    if (!admin) {
      return res.status(404).json({ error: "Admin not found for this issue." });
    }


    // Configure Nodemailer transporter
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
      from: '"Grievance Redressal System" <your-email@gmail.com>',
      to: admin.email,
      subject: `A Issue has been Reopened`,
      text: `Hello admin,

    A issue titled "${issue.title}" has been reopened by the user ${user.username}.  
    
    Thank you,
    Grievance Redressal System`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    await issue.save();



    res.json(issue);
  } catch (error) {
    console.error("Error reopening issue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = issueRouter;
