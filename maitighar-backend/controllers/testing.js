const testingRouter = require("express").Router();
const Issue = require("../models/issue");
// const Suggestion = require("../models/suggestion");
const User = require("../models/user");

testingRouter.post("/reset", async (request, response) => {
  await Issue.deleteMany({});
  // await Suggestion.deleteMany({});
  await User.deleteMany({});

  response.status(204).end();
});

module.exports = testingRouter;
