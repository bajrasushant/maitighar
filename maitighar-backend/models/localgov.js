const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const localGovSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  number_of_wards: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["Municipality", "Gaunpalika", "Sub-Metropolitan City", "Metropolitan City"],
    required: true,
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures that each local government has a unique email
    match: [/.+@.+\..+/, "Please enter a valid email address"], // Validates email format
  },
});

localGovSchema.plugin(uniqueValidator);

localGovSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("LocalGov", localGovSchema);
