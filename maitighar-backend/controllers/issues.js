const issueRouter = require("express").Router();
const express = require("express");
const Issue = require("../models/issue"); // Adjust the path as needed
// const Upvote = require("../models/upvote");
const User = require("../models/user");

// Create a new issue
issueRouter.post("/", async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    console.log(req.user.id);
    const user = await User.findById(req.user.id);
    console.log(user);
    const issue = new Issue({ ...req.body, createdBy: user.id, comments: [] });
    await issue.save();
    // console.log("bakend",issue);
    res.status(201).json(issue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// issueRouter.post('/:id/upvote', async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const issue = await Issue.findById(req.params.id);
//     if (!issue) {
//       return res.status(404).json({ error: 'Issue not found' });
//     }
//     if (issue.upvotedBy.includes(userId)) {
//       return res.status(400).json({ error: 'User has already upvoted' });
//     }
//     issue.upvotes += 1;
//     issue.upvotedBy.push(userId);
//     await issue.save();
//     res.json(issue);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Get all issues
issueRouter.get("/", async (req, res) => {
  try {
    const issues = await Issue.find({}).populate("comments");
    // const issuesWithUpvotes = await Promise.all(
    // 	issues.map(async (issue) => {
    // 		const upvoteCount = await Upvote.countDocuments({ issue: issue._id });
    // 		return { ...issue.toObject(), upvotes: upvoteCount };
    // 	}),
    // );
    const issuesWithCommentLength = issues.map((issue) => ({
      ...issue.toJSON(),
      commentCount: issue.comments.length,
    }));
    res.json(issuesWithCommentLength);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a issue by ID
issueRouter.get("/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("createdBy", {
        username: 1,
      })
      .populate({
        path: "comments",
        populate: {
          path: "createdBy",
          select: "username",
        },
      });
    console.log(issue);
    if (!issue) {
      return res.status(404).json({ error: "issue not found" });
    }
    // const upvoteCount = await Upvote.countDocuments({ issue: issue.id });
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a issue
issueRouter.put("/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: "issue not found" });
    }
    if (issue.createdBy.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: "You do not have permission to update this issue" });
    }
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    res.json(updatedIssue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a issue
issueRouter.delete("/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: "issue not found" });
    }
    if (issue.createdBy.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this issue" });
    }
    await Issue.findByIdAndDelete(req.params.id);
    res.json({ message: "Issue deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

issueRouter.put("/:id/upvote", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    console.log(issue);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    if (issue.upvotedBy.includes(req.user.id)) {
      issue.upvotes -= 1;
      issue.upvotedBy = issue.upvotedBy.filter(
        (userId) => userId.toString() !== req.user.id.toString(),
      );
    } else {
      issue.upvotes += 1;
      const user = await User.findById(req.user.id);
      issue.upvotedBy.push(user.id);
    }
    console.log(issue);
    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    // Handle errors and return 500
    res.status(500).json({ error: error.message });
  }
});

module.exports = issueRouter;
