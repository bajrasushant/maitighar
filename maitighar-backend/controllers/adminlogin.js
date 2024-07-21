const jwt = require("jsonwebtoken");
const config = require("../utils/config");
const bcrypt = require("bcrypt");
const adminloginRouter = require("express").Router();
const Admin = require("../models/admin");

adminloginRouter.post("/", async (request, response) => {
	const { username, password } = request.body;
	const admin = await Admin.findOne({ username });

	const passwordCorrect =
		admin === null ? false : await bcrypt.compare(password, admin.passwordHash);
	if (!(admin && passwordCorrect)) {
		return response.status(401).json({
			error: "invalid username or password",
		});
	}

	const adminToken = {
		username: admin.username,
		id: admin._id,
	};
	const token = jwt.sign(adminToken, config.SECRET);

	response
		.status(200)
		.send({ token, username: admin.username, email: admin.email, id: admin._id });
});

module.exports = adminloginRouter;
