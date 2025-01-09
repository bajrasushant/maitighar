const express = require("express");
const issue = require("../models/issue");
const landingPageRouter = express.Router();

landingPageRouter.get("/landingpage-issues", async (req, res) => {
  try {
    const trendingIssues = await issue.aggregate([
      {
        $addFields: {
          totalEngagement: {
            $add: ["$upvotes", { $size: "$comments" }],
          },
        },
      },
      {
        $sort: { totalEngagement: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          upvotes: 1,
          comments: 1,
          createdAt: 1,
        },
      },
    ]);

    res.status(200).json(trendingIssues);
  } catch (error) {
    console.error("Error fetching trending issues:", error);
    res.status(500).json({ message: "Error fetching trending issues" });
  }
});

module.exports = landingPageRouter;
