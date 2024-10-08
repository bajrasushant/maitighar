const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const provinceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

provinceSchema.plugin(uniqueValidator);

provinceSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Province", provinceSchema);
