const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const issueSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // department: {
  //   type: String,
  //   enum: departments,
  //   required: true,
  // },
  assigned_province: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Province",
    required: true,
  },
  assigned_district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    required: true,
  },
  assigned_local_gov: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LocalGov",
    required: false,
  },
  assigned_ward: {
    type: Number,
    required: function () {
      return this.assigned_local_gov !== null;
    },
    validate: {
      validator: async function (value) {
        if (!this.assigned_local_gov) {
          return true;
        }
        if (value <= 0) {
          return false;
        }
        const localGov = await mongoose.model("LocalGov").findById(this.assigned_local_gov);
        return value <= localGov.number_of_wards;
      },
      message: "Assigned ward must be within the range of the local government's number of wards.",
    },
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
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
  sentiment: {
    type: String,
    enum: ["Positive", "Negative", "Neutral"],
    default: "Neutral",
  },
  sentimentScore: {
    type: Number,
    default: 0,
  },
});

issueSchema.index({ location: "2dsphere" });

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
