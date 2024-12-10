const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  issue: {
    type: Schema.Types.ObjectId,
    ref: "Issue",
  },
  suggestion: {
    type: Schema.Types.ObjectId,
    ref: "Suggestion",
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  type: {
    type: String,
    enum: ["general", "wardOfficer"],
    default: "general",
  },
  approvals: [
    {
      type: Schema.Types.ObjectId,
      ref: "WardOfficer",
    },
  ],
  isCommunityNote: {
    type: Boolean,
    default: false,
  },
});

commentSchema.methods.checkApprovalThreshold = function (threshold = 1) {
  if (this.approvals.length >= threshold) {
    this.isCommunityNote = true;
    return true;
  }
  return false;
};

commentSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

commentSchema.index({ description: "text" });

module.exports = mongoose.model("Comment", commentSchema);
