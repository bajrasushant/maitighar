const wardOfficerRouter = require("express").Router();
const WardOfficer = require("../models/wardOfficer");
const PromotionRequest = require("../models/promotionRequest");
const Comment = require("../models/comment");
const Issue = require("../models/issue");
const mongoose = require("mongoose");

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

wardOfficerRouter.post("/apply-ward-officer", async (request, response) => {
  try {
    const {
      requestedRole,
      reason,
      assigned_province,
      assigned_district,
      assigned_local_gov,
      assigned_ward,
    } = request.body;
    console.log(request.user);
    const userId = request.user;
    const alreadyWardOfficer = await WardOfficer.findOne({
      user: userId,
    });

    if (alreadyWardOfficer) {
      return response.status(400).json({ error: "You're already a ward officer." });
    }

    // Ensure no duplicate requests
    const existingRequest = await PromotionRequest.findOne({
      user: userId,
      requestedRole,
      status: "Pending",
    });

    if (existingRequest) {
      return response.status(400).json({ error: "You already have a pending request." });
    }

    // Create a new promotion request
    const newRequest = new PromotionRequest({
      user: userId,
      requestedRole,
      reason,
      assigned_local_gov,
      assigned_district,
      assigned_province,
      assigned_ward,
    });
    await newRequest.save();

    response.status(201).json({ message: "Request submitted successfully!" });
  } catch (error) {
    console.error("Error creating promotion request:", error);
    response.status(500).json({ error: "Internal server error." });
  }
});

wardOfficerRouter.get("/promotion-requests/:promotionRequestId", async (req, res) => {
  try {
    const { promotionRequestId } = req.params;

    // Find the promotion request
    const promotionRequest = await PromotionRequest.findById(promotionRequestId).populate("user");
    if (!promotionRequest) {
      return res.status(404).json({ error: "Promotion request not found" });
    }

    const { user, assigned_province, assigned_district, assigned_local_gov, assigned_ward } =
      promotionRequest;

    const userStats = await Issue.aggregate([
      {
        $match: {
          assigned_province: new mongoose.Types.ObjectId(assigned_province),
          assigned_district: new mongoose.Types.ObjectId(assigned_district),
          assigned_local_gov: new mongoose.Types.ObjectId(assigned_local_gov),
          assigned_ward: assigned_ward,
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "issueComments",
        },
      },
      {
        $unwind: {
          path: "$upvotedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$issueComments",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$upvotedBy",
          activityScore: { $sum: 1 },
          commentsScore: {
            $sum: { $cond: [{ $ifNull: ["$issueComments.createdBy", false] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          totalActivityScore: { $add: ["$activityScore", "$commentsScore"] },
        },
      },
      {
        $match: {
          _id: user._id, // Match the promotion request's user
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          userId: "$userDetails._id",
          username: "$userDetails.username",
          email: "$userDetails.email",
          activityScore: "$totalActivityScore",
        },
      },
    ]);

    // Check if the user is already a ward officer
    const isWardOfficer = await WardOfficer.findOne({ user: user._id });

    const response = {
      promotionRequest: {
        id: promotionRequest._id,
        requestedRole: promotionRequest.requestedRole,
        status: promotionRequest.status,
        reason: promotionRequest.reason,
        createdAt: promotionRequest.createdAt,
      },
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isWardOfficer: !!isWardOfficer,
      },
      stats: userStats[0] || {
        activityScore: 0,
        commentsScore: 0,
        totalActivityScore: 0,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching promotion review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = wardOfficerRouter;
