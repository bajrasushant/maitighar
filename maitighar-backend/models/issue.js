const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const departments = [
  "Ward No.1",
  "Ward No.2",
  "Ward No.3",
  "Ward No.4",
  "Ward No.5",
  "Ward No.6",
  "Ward No.7",
  "Ward No.8",
  "Ward No.9",
  "Ward No.10",
  "Ward No.11",
  "Ward No.12",
  "Ward No.13",
  "Ward No.14",
  "Ward No.15",
  "Ward No.16",
  "Ward No.17",
  "Ward No.18",
  "Ward No.19",
  "Ward No.20",
  "Ward No.21",
  "Ward No.22",
  "Ward No.23",
  "Ward No.24",
  "Ward No.25",
  "Ward No.26",
  "Ward No.27",
  "Ward No.28",
  "Ward No.29",
  "Ward No.30",
  "Ward No.31",
  "Ward No.32",
];

const categories = ["Water", "Road", "Education", "Others"];

const issueSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    enum: departments,
    required: true,
  },
  category: {
    type: String,
    enum: categories,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    enum: ["open", "received", "resolved"],
    default: "open",
  },
  type: {
    type: String,
    enum: ["issue", "suggestion"],
    required: true,
  },
  imagePaths: [
    {
      type: String,
      default: [],
    },
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

// Pre-save hook to update the `upvotes` field
issueSchema.pre("save", function (next) {
  this.upvotes = this.upvotedBy.length;
  next();
});

issueSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Issue", issueSchema);
