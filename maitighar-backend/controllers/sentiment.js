const axios = require("axios");

const Issue = require("../models/issue");
const Comment = require("../models/comment");

async function analyzeSentiment(postId) {
  try {
    // Get post and comments from MongoDB
    const post = await Issue.findById(postId);
    const comments = await Comment.find({ issue: postId });
    console.log("Post:", post);
    console.log("Comments:", comments);
    // Call Flask API
    const response = await axios.post("http://localhost:5000/analyze", {
      post_description: post.description,
      comments: comments.map((c) => c.description),
    });

    // Update post with sentiment analysis results
    await Issue.findByIdAndUpdate(postId, {
      sentiment: response.data.overall_sentiment,
      sentimentScore: response.data.average_score,
    });

    return response.data;
  } catch (error) {
    console.error("Sentiment analysis failed:", error);
    throw error;
  }
}

module.exports = { analyzeSentiment };
