const User = require("../models/user");
const Issue = require("../models/issue");
const Comment = require("../models/comment");

const userProfileRouter = require("express").Router();

userProfileRouter.get("/me", async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("username email role")
      .populate("upvotedIssues", "title description status createdAt");

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const postedIssues = await Issue.find({ createdBy: userId })
      .select("title description status createdAt status resolvedAt")
      .sort({ createdAt: -1 });

    const postedComments = await Comment.find({ createdBy: userId })
      .select("description createdAt parentComment issue suggestion")
      .populate("issue", "title")
      .populate("suggestion", "title")
      .sort({ createdAt: -1 });

    const response = {
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      upvotedIssues: user.upvotedIssues,
      upvotedSuggestions: user.upvotedSuggestions,
      postedIssues,
      postedComments,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = userProfileRouter;
