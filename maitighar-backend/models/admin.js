const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

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
	role: String,
    department: {
        type: String,
        enum: ['Local Government', 'Central Government'],
        default: 'Local Government',
      },
});

adminSchema.plugin(uniqueValidator);

adminSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
		delete returnedObject.passwordHash;
	},
});

module.exports = mongoose.model("Admin", adminSchema);