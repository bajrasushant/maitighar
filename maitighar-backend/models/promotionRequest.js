const mongoose = require("mongoose");

const promotionRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requestedRole: {
    type: String,
    enum: ["Ward Officer"], // Add more roles if needed
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Declined"],
    default: "Pending",
  },
  reason: {
    type: String, // Optional: reason for applying
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
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
  is_active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("PromotionRequest", promotionRequestSchema);
