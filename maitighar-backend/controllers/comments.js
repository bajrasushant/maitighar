const commentRouter = require("express").Router();
const express = require("express");
const Comment = require("../models/comment"); 

// Create a new comment
commentRouter.post('/', async (req, res) => {
    try {
        const { user, issue, suggestion } = req.body;

        // Ensure either issue or suggestion is present
        if (!issue && !suggestion) {
            return res.status(400).json({ error: 'Either issue or suggestion must be provided.' });
        }

      const comment = new Comment(req.body);
      await comment.save();
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

// Get comments by issue ID
commentRouter.get('/:id', async (req, res) => {
    try {
      const comments = await Comment.find({ issue: req.params.id })
  
      if (comments.length === 0) {
        return res.status(404).json({ error: 'No comments found for this issue' });
      }
  
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  //Delete comments by comment ID
  commentRouter.delete('/:id', async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      if (comment.createdBy.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: "You do not have permission to delete this comment" });
      }
      await Comment.findByIdAndDelete(req.params.id);
      res.json({ message: "Comment deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = commentRouter;
