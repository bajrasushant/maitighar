const upvoteRouter = require("express").Router();
const Upvote = require("../models/upvote");
const User = require("../models/user");
const Issue = require("../models/issue");
const { addNotification } = require("../utils/notification");

// Create a new upvote
upvoteRouter.post("/", async (req, res) => {
  try {
    const { user, issue, suggestion } = req.body;

    // Ensure either issue or suggestion is present
    if (!issue && !suggestion) {
      return res.status(400).json({ error: "Either issue or suggestion must be provided." });
    }

    // Check for an existing upvote for the same user and issue
    const existingUpvote = await Upvote.findOne({ user, issue });

    if (existingUpvote) {
      // Delete the existing upvote
      await Upvote.findByIdAndDelete(existingUpvote._id);
      return res.json({ message: "Existing upvote deleted" });
    } else {
      // Create a new upvote if none exists
      const upvote = new Upvote({ user, issue, suggestion });
      await upvote.save();

      // Fetch the issue and the upvoter for notification
      const issueDocument = await Issue.findById(issue).populate("user", "username");
      const upvoter = await User.findById(user);

      // Send a notification to the issue's creator
      if (issueDocument && upvoter) {
        const notificationMessage = `${upvoter.username} upvoted your issue: "${issueDocument.title}".`;
        await addNotification(issueDocument.user._id, issue, notificationMessage, {
          type: "upvote",
          issueId: issue,
        });
      }

      return res.status(201).json(upvote);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all upvotes
upvoteRouter.get("/", async (req, res) => {
  try {
    const upvotes = await Upvote.find()
      .populate("user", "name") // Populate user reference, only get the name field
      .populate("issue", "title") // Populate issue reference, only get the title field
      .populate("suggestion", "description"); // Populate suggestion reference, only get the description field

    res.json(upvotes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get an upvote by ID
upvoteRouter.get("/:id", async (req, res) => {
  try {
    const upvote = await Upvote.findById(req.params.id)
      .populate("user")
      .populate("issue")
      .populate("suggestion");
    if (!upvote) {
      return res.status(404).json({ error: "Upvote not found" });
    }
    res.json(upvote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an upvote
upvoteRouter.put("/:id", async (req, res) => {
  try {
    const upvote = await Upvote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!upvote) {
      return res.status(404).json({ error: "Upvote not found" });
    }
    res.json(upvote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an upvote
upvoteRouter.delete("/:id", async (req, res) => {
  try {
    const upvote = await Upvote.findByIdAndDelete(req.params.id);
    if (!upvote) {
      return res.status(404).json({ error: "Upvote not found" });
    }
    res.json({ message: "Upvote deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = upvoteRouter;
