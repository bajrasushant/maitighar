const mongoose = require("mongoose");

const wardOfficerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  ward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ward",
    required: true,
  },
  localGov: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LocalGov",
    required: true,
  },
  role: {
    type: String,
    enum: ["Chief", "Assistant", "Coordinator"],
    required: true,
  },
});

wardOfficerSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("WardOfficer", wardOfficerSchema);
