const commentRouter = require("express").Router();
const express = require("express");
const Comment = require("../models/comment");
const Issue = require("../models/issue");

// Create a new comment
commentRouter.post("/", async (req, res) => {
  try {
    const { user, issue, parentComment } = req.body;

    console.log(req.body);
    //Create new comment
    const comment = new Comment({ ...req.body, createdBy: req.user.id });
    await comment.save();

    //If the comment is related to an issue, push the comment to the issue
    if (issue) {
      await Issue.findByIdAndUpdate(
        issue,
        { $push: { comments: comment.id } },
        { new: true, useFindAndModify: false },
      );
    }

    //If the comment is a reply, push it to the parent comment's replies
    if (parentComment) {
      await Comment.findByIdAndUpdate(
        parentComment,
        { $push: { replies: comment.id } },
        { new: true, useFindAndModify: false },
      );
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get comments by issue ID
commentRouter.get("/issue/:id", async (req, res) => {
  try {
    const comments = await Comment.find({ issue: req.params.id, parentComment: null }).populate(
      "createdBy",
      { username: 1 },
    ); //

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments by issue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get replies by parent comment ID
commentRouter.get("/replies/:id", async (req, res) => {
  try {
    const replies = await Comment.find({ parentComment: req.params.id }).populate("createdBy", {
      username: 1,
    });

    if (replies.length === 0) {
      return res.status(404).json({ error: "No replies found for this comment" });
    }

    res.json(replies);
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Delete comments by comment ID
commentRouter.delete("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    //Check if the user has permission to delete the comment
    if (comment.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "You do not have permission to delete this comment" });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = commentRouter;
