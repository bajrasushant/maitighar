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
});

commentSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Comment", commentSchema);
