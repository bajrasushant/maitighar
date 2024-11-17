const wardOfficerRouter = require("express").Router();
const WardOfficer = require("../models/wardOfficer");
const Comment = require("../models/comment");
const Issue = require("../models/issue");

// Middleware to check if user is a ward officer
const isWardOfficer = async (request, response, next) => {
  try {
    const wardOfficer = await WardOfficer.findOne({ user: request.user.id });
    if (!wardOfficer || !wardOfficer.is_active) {
      return response.status(403).json({
        error: "Active ward officer status required",
      });
    }
    request.wardOfficer = wardOfficer;
    next();
  } catch (error) {
    return response.status(500).json({
      error: "Error verifying ward officer status",
    });
  }
};

// Get comments pending verification in ward officer's jurisdiction
wardOfficerRouter.get("/pending-comments", isWardOfficer, async (request, response) => {
  try {
    const wardOfficer = request.wardOfficer;

    // Find comments by other ward officers in the same jurisdiction
    const pendingComments = await Comment.find({
      type: "wardOfficer",
      approvals: { $ne: wardOfficer._id },
      isCommunityNote: false,
      $or: [
        {
          issue: {
            $in: await getIssuesInJurisdiction(wardOfficer),
          },
        },
        {
          suggestion: {
            $in: await getSuggestionsInJurisdiction(wardOfficer),
          },
        },
      ],
    })
      .populate("createdBy", "username")
      .populate("issue", "title description assigned_ward")
      .populate("suggestion", "title description assigned_ward")
      .sort({ createdAt: -1 });

    response.json(pendingComments);
  } catch (error) {
    response.status(500).json({
      error: "Error fetching pending comments",
    });
  }
});

// Approve/verify another ward officer's comment
wardOfficerRouter.post("/verify-comment/:commentId", isWardOfficer, async (request, response) => {
  try {
    const { commentId } = request.params;
    const wardOfficer = request.wardOfficer;

    const comment = await Comment.findById(commentId)
      .populate({
        path: "createdBy",
        populate: {
          path: "user",
          model: "User",
        },
      })
      .populate("issue")
      .populate("suggestion");

    // Validation checks
    if (!comment) {
      return response.status(404).json({ error: "Comment not found" });
    }

    if (comment.type !== "wardOfficer") {
      return response.status(400).json({
        error: "Can only verify ward officer comments",
      });
    }

    if (comment.createdBy._id.toString() === wardOfficer._id.toString()) {
      return response.status(400).json({
        error: "Cannot verify your own comment",
      });
    }

    if (comment.approvals.includes(wardOfficer._id)) {
      return response.status(400).json({
        error: "Already verified this comment",
      });
    }

    // Check if comment is in ward officer's jurisdiction
    const isInJurisdiction = await checkJurisdiction(comment, wardOfficer);
    if (!isInJurisdiction) {
      return response.status(403).json({
        error: "Cannot verify comments outside your jurisdiction",
      });
    }

    // Add approval
    comment.approvals.push(wardOfficer._id);

    // Check if approval threshold reached (5 ward officers)
    if (comment.approvals.length >= 5) {
      comment.isCommunityNote = true;
    }

    await comment.save();

    // Update ward officer's stats
    wardOfficer.approved_comments.push(comment._id);
    wardOfficer.last_active = new Date();
    await wardOfficer.save();

    response.json({
      message: "Comment verified successfully",
      isCommunityNote: comment.isCommunityNote,
      approvalsCount: comment.approvals.length,
    });
  } catch (error) {
    response.status(500).json({
      error: "Error verifying comment",
    });
  }
});

// Get verification statistics for current ward officer
wardOfficerRouter.get("/verification-stats", isWardOfficer, async (request, response) => {
  try {
    const wardOfficer = request.wardOfficer;

    const stats = {
      totalVerifications: wardOfficer.approved_comments.length,
      verifiedCommentsToday: await Comment.countDocuments({
        approvals: wardOfficer._id,
        "approvals.addedAt": {
          $gte: new Date().setHours(0, 0, 0, 0),
        },
      }),
      contributedCommunityNotes: await Comment.countDocuments({
        approvals: wardOfficer._id,
        isCommunityNote: true,
      }),
      pendingVerifications: await Comment.countDocuments({
        type: "wardOfficer",
        approvals: { $ne: wardOfficer._id },
        isCommunityNote: false,
        $or: [
          {
            issue: {
              $in: await getIssuesInJurisdiction(wardOfficer),
            },
          },
          {
            suggestion: {
              $in: await getSuggestionsInJurisdiction(wardOfficer),
            },
          },
        ],
      }),
    };

    response.json(stats);
  } catch (error) {
    response.status(500).json({
      error: "Error fetching verification statistics",
    });
  }
});

const getIssuesInJurisdiction = async (wardOfficer) => {
  return await Issue.find({
    assigned_province: wardOfficer.assigned_province,
    assigned_district: wardOfficer.assigned_district,
    assigned_local_gov: wardOfficer.assigned_local_gov,
    assigned_ward: wardOfficer.assigned_ward,
  }).select("_id");
};

// Helper function to get suggestions in ward officer's jurisdiction
const getSuggestionsInJurisdiction = async (wardOfficer) => {
  return await Issue.find({
    type: "suggestion",
    assigned_province: wardOfficer.assigned_province,
    assigned_district: wardOfficer.assigned_district,
    assigned_local_gov: wardOfficer.assigned_local_gov,
    assigned_ward: wardOfficer.assigned_ward,
  }).select("_id");
};

// Helper function to check if comment is in ward officer's jurisdiction
const checkJurisdiction = async (comment, wardOfficer) => {
  const issue = comment.issue;
  const suggestion = comment.suggestion;

  if (issue) {
    return (
      issue.assigned_province.equals(wardOfficer.assigned_province) &&
      issue.assigned_district.equals(wardOfficer.assigned_district) &&
      issue.assigned_local_gov.equals(wardOfficer.assigned_local_gov) &&
      issue.assigned_ward === wardOfficer.assigned_ward
    );
  }

  if (suggestion) {
    return (
      suggestion.assigned_province.equals(wardOfficer.assigned_province) &&
      suggestion.assigned_district.equals(wardOfficer.assigned_district) &&
      suggestion.assigned_local_gov.equals(wardOfficer.assigned_local_gov) &&
      suggestion.assigned_ward === wardOfficer.assigned_ward
    );
  }

  return false;
};

module.exports = wardOfficerRouter;
