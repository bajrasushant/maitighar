const jwt = require("jsonwebtoken");
const config = require("../utils/config");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");
const WardOfficer = require("../models/wardOfficer");

loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body;
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  const user = await User.findOne({ username: trimmedUsername });

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(trimmedPassword, user.passwordHash);
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }

  const wardOfficer = await WardOfficer.findOne({ user: user._id });

  const userToken = {
    username: user.username,
    id: user._id,
    isWardOfficer: !!wardOfficer,
  };
  const token = jwt.sign(userToken, config.SECRET);

  response
    .status(200)
    .send({
      token,
      username: user.username,
      email: user.email,
      id: user._id,
      isWardOfficer: !!wardOfficer,
    });
});

module.exports = loginRouter;
