const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wardOfficerSchema = new Schema({
  // Extend from base user
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  // Ward assignment
  assigned_province: {
    type: Schema.Types.ObjectId,
    ref: "Province",
    required: true,
  },
  assigned_district: {
    type: Schema.Types.ObjectId,
    ref: "District",
    required: true,
  },
  assigned_local_gov: {
    type: Schema.Types.ObjectId,
    ref: "LocalGov",
    required: true,
  },
  assigned_ward: {
    type: Number,
    required: true,
    validate: {
      validator: async function (value) {
        if (value <= 0) return false;
        const localGov = await mongoose.model("LocalGov").findById(this.assigned_local_gov);
        return value <= localGov.number_of_wards;
      },
      message: "Assigned ward must be within the range of the local government's number of wards.",
    },
  },

  // Moderation stats
  approved_comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],

  // Active status
  is_active: {
    type: Boolean,
    default: true,
  },

  // Additional metadata
  appointed_date: {
    type: Date,
    default: Date.now,
  },
  last_active: {
    type: Date,
    default: Date.now,
  },
});

// Method to approve a comment
wardOfficerSchema.methods.approveComment = async function (commentId) {
  const Comment = mongoose.model("Comment");
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Check if officer is assigned to the same ward as the issue
  const Issue = mongoose.model("Issue");
  const issue = await Issue.findById(comment.issue);

  if (
    issue.assigned_ward !== this.assigned_ward ||
    issue.assigned_local_gov.toString() !== this.assigned_local_gov.toString()
  ) {
    throw new Error("Ward officer can only approve comments in their assigned ward");
  }

  // Check if already approved
  if (comment.approvals.includes(this._id)) {
    throw new Error("Already approved this comment");
  }

  // Add approval
  comment.approvals.push(this._id);
  this.approved_comments.push(comment._id);

  if (comment.checkApprovalThreshold(1)) {
    comment.isCommunityNote = true;
  }

  // Update last active timestamp
  this.last_active = new Date();

  // Save both documents
  await Promise.all([comment.save(), this.save()]);

  return comment;
};

// Index for efficient ward-based queries
wardOfficerSchema.index({
  assigned_province: 1,
  assigned_district: 1,
  assigned_local_gov: 1,
  assigned_ward: 1,
});

wardOfficerSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("WardOfficer", wardOfficerSchema);
