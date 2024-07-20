const issueRouter = require("express").Router();
const express = require("express");
const Issue = require("../models/issue"); // Adjust the path as needed

// Create a new issue
issueRouter.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const issue = new Issue({ ...req.body, createdBy: req.user.id });
    console.log(issue);
    await issue.save();
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
		const count = await Issue.countDocuments({});
    const issues = await Issue.find({});
    console.log(issues);
		console.log(count);
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a issue by ID
issueRouter.get("/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: "issue not found" });
    }
    res.json(issue);
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

module.exports = issueRouter;
