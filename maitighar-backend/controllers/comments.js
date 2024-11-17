const commentRouter = require("express").Router();
const Comment = require("../models/comment");
const Issue = require("../models/issue");
const WardOfficer = require("../models/wardOfficer");

const checkWardOfficerJurisdiction = async (userId, issue) => {
  const wardOfficer = await WardOfficer.findOne({
    user: userId,
    assigned_province: issue.assigned_province,
    assigned_district: issue.assigned_district,
    assigned_local_gov: issue.assigned_local_gov,
    assigned_ward: issue.assigned_ward,
    is_active: true,
  });
  return wardOfficer;
};

// Create a new comment
commentRouter.post("/", async (req, res) => {
  try {
    const { issue, parentComment } = req.body;

    const issueDoc = await Issue.findById(issue);
    if (!issueDoc) {
      return res.status(404).json({ error: "Issue not found" });
    }

    const isWardOfficer = await checkWardOfficerJurisdiction(req.user.id, issueDoc);

    //Create new comment
    const comment = new Comment({
      ...req.body,
      createdBy: req.user.id,
      type: isWardOfficer ? "wardOfficer" : "general",
    });
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

    const populatedCommentUser = await Comment.findById(comment.id)
      .populate("createdBy", {
        username: 1,
      })
      .populate({
        path: "issue",
        select: "assigned_ward assigned_local_gov",
      });
    res.status(201).json(populatedCommentUser);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get comments by issue ID
commentRouter.get("/issue/:id", async (req, res) => {
  try {
    const comments = await Comment.find({ issue: req.params.id, parentComment: null })
      .populate("createdBy", { username: 1 })
      .populate({
        path: "approvals",
        select: "user",
        populate: {
          path: "user",
          select: "username",
        },
      })
      .sort({ createdAt: -1 });
    const issue = await Issue.findById(req.params.id);
    const isWardOfficer = await checkWardOfficerJurisdiction(req.user.id, issue);

    const enrichedComments = comments.map((comment) => ({
      ...comment.toJSON(),
      canApprove:
        isWardOfficer &&
        comment.type === "wardOfficer" &&
        comment.createdBy._id.toString() !== req.user.id.toString() &&
        !comment.approvals.some((a) => a.user._id.toString() === req.user.id.toString()),
    }));

    res.json(enrichedComments);
  } catch (error) {
    console.error("Error fetching comments by issue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

commentRouter.post("/:id/approve", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const issue = await Issue.findById(comment.issue);
    if (!issue) {
      return res.status(404).json({ error: "Associated issue not found" });
    }

    // Check if the approving user is a ward officer for this ward
    const approvingOfficer = await checkWardOfficerJurisdiction(req.user.id, issue);
    if (!approvingOfficer) {
      return res.status(403).json({
        error: "Only ward officers of this ward can approve comments",
      });
    }

    // Validation checks
    if (comment.type !== "wardOfficer") {
      return res.status(400).json({
        error: "Only ward officer comments can be approved",
      });
    }

    if (comment.createdBy.toString() === req.user.id.toString()) {
      return res.status(400).json({
        error: "You cannot approve your own comment",
      });
    }

    if (comment.approvals.includes(approvingOfficer._id)) {
      return res.status(400).json({
        error: "You have already approved this comment",
      });
    }

    // Add approval
    comment.approvals.push(approvingOfficer._id);

    // Check if threshold reached (2 approvals makes it a community note)
    if (comment.approvals.length >= 2) {
      comment.isCommunityNote = true;
    }

    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate("createdBy", { username: 1 })
      .populate({
        path: "approvals",
        select: "user",
        populate: {
          path: "user",
          select: "username",
        },
      });

    res.json({
      message: comment.isCommunityNote
        ? "Comment approved and marked as a community note"
        : "Comment approved",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Error approving comment:", error);
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
      return res.status(200).json([]);
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

// Approve a ward officer comment
commentRouter.post("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.type !== "wardOfficer") {
      return res.status(400).json({ error: "Only ward officer comments can be approved" });
    }

    if (comment.approvals.includes(req.user.id)) {
      return res.status(400).json({ error: "You have already approved this comment" });
    }

    comment.approvals.push(req.user.id);

    const issue = await Issue.findById(comment.issue).populate({
      path: "assigned_local_gov",
      populate: { path: "wardOfficers" },
    });
    const wardOfficers = issue?.assigned_local_gov?.wardOfficers || [];
    const approvalThreshold = Math.ceil(wardOfficers.length / 2);

    // Check if the approval threshold is met
    if (comment.approvals.length >= approvalThreshold) {
      comment.isCommunityNote = true;
    }

    await comment.save();
    res.status(200).json({
      message: comment.isCommunityNote
        ? "Comment approved and marked as a community note"
        : "Comment approved",
      comment,
    });
  } catch (error) {
    console.error("Error approving comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = commentRouter;
