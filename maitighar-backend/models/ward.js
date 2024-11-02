const mongoose = require("mongoose");

const wardSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
  },
  localGov: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LocalGov",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  admin_registered: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
});

wardSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Ward", wardSchema);
