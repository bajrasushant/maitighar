const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

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

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  // role: String,
  //   department: {
  //       type: String,
  //       enum: ['Local Government', 'Central Government'],
  //       default: 'Local Government',
  //     },
  department: {
    type: String,
    enum: departments,
    required: true,
    unique: true,
  },
});

adminSchema.plugin(uniqueValidator);

adminSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
    returnedObject.department = document.department;
  },
});

module.exports = mongoose.model("Admin", adminSchema);
