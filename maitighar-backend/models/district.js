const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  ddc_contact_email: {
    type: String,
  },
  ddc_contact_number: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: false,
  },
  longitude: {
    type: Number,
    required: false,
  },
  province: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Province",
    required: true,
  },
});

districtSchema.plugin(uniqueValidator);

districtSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("District", districtSchema);
