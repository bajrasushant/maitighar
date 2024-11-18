const axios = require("axios");

const Issue = require("../models/issue");

async function summarizeText(postId) {
  try {
    // Get post from MongoDB
    const post = await Issue.findById(postId);
    console.log("Post:", post);
    // Call Flask API
    const response = await axios.post("http://localhost:5000/summarize", {
      post_description: post.description,
    });

    // Update post with summarization results
    await Issue.findByIdAndUpdate(postId, {
      summary: response.data.summary,
    });

    return response.data;
  } catch (error) {
    console.error("Text Summarization failed:", error);
    throw error;
  }
}

module.exports = { summarizeText };
