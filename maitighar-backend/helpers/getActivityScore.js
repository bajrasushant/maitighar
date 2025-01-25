const Issue = require("../models/issue");
const mongoose = require("mongoose");

const getUserActivityScore = async (userId) => {
  try {
    const userActivity = await Issue.aggregate([
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
          _id: new mongoose.Types.ObjectId(userId),
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
          _id: 0,
          userId: "$userDetails._id",
          username: "$userDetails.username",
          email: "$userDetails.email",
          activityScore: "$totalActivityScore",
        },
      },
    ]);

    return userActivity.length > 0 ? userActivity[0] : null;
  } catch (error) {
    console.error("Error fetching user activity score:", error);
    throw error;
  }
};

module.exports = getUserActivityScore;
