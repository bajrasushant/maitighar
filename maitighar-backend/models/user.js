const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    trim: true,
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
  upvotedIssues: [
    {
      type: Schema.Types.ObjectId,
      ref: "Issue",
    },
  ],
  upvotedSuggestions: [
    {
      type: Schema.Types.ObjectId,
      ref: "suggestion",
    },
  ],
  role: {
    type: String,
    enum: ["User", "Ward Officer", "Admin"],
    default: "User",
  },
});

userSchema.plugin(uniqueValidator);

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

module.exports = mongoose.model("User", userSchema);
