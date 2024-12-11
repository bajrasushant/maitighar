const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wardSchema = new Schema({
  number: {
    type: Number,
    required: true,
  },
  localGov: {
    type: Schema.Types.ObjectId,
    ref: "LocalGov",
    required: true,
  },
  // Remove the name field since wards are just numbers
  officers: [
    {
      type: Schema.Types.ObjectId,
      ref: "WardOfficer",
    },
  ],
  // Add any ward-specific data you might need
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

// Compound index to ensure ward numbers are unique within a local government
wardSchema.index({ number: 1, localGov: 1 }, { unique: true });

// Validation to ensure ward number is within municipality's range
wardSchema.pre("save", async function (next) {
  if (this.isModified("number") || this.isModified("localGov")) {
    const LocalGov = mongoose.model("LocalGov");
    const municipality = await LocalGov.findById(this.localGov);

    if (!municipality) {
      return next(new Error("Local government not found"));
    }

    if (this.number < 1 || this.number > municipality.number_of_wards) {
      return next(new Error(`Ward number must be between 1 and ${municipality.number_of_wards}`));
    }
  }
  next();
});

module.exports = mongoose.model("Ward", wardSchema);
