const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  nepaliName: {
    type: String,
    required: true,
    trim: true,
  },
  pointOfContact: {
    name: {
      type: String,
      required: true,
    },
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  website: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  level: {
    type: String,
    enum: ["federal", "provincial"],
    required: true,
  },
  admin_registered: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  province: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Province",
    required: function () {
      return this.level === "provincial";
    },
  },
});

DepartmentSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Department = mongoose.model("Department", DepartmentSchema);

module.exports = Department;
