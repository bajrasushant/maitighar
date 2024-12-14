const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./utils/config");
const app = express();
const mongoose = require("mongoose");

const issueRouter = require("./controllers/issues");
// const suggestionRouter = require("./controllers/suggestions")
const userRouter = require("./controllers/users");
const departmentRouter = require("./controllers/departments");
const wardRouter = require("./controllers/wards");
const upvoteRouter = require("./controllers/upvotes");
const loginRouter = require("./controllers/login");
const adminloginRouter = require("./controllers/adminlogin");
const adminRouter = require("./controllers/admins");
const commentRouter = require("./controllers/comments");
const nepalRouter = require("./controllers/nepalDetails");
const categoryRouter = require("./controllers/categories");
const wardOfficerRouter = require("./controllers/wardOfficers");
const landingPageRouter = require("./controllers/landingpage");

const userProfileRouter = require("./controllers/userProfile");

const middleware = require("./utils/middleware");

mongoose.set("strictQuery", false);
mongoose
  .connect(config.MONGO_URI)
  .then(() => console.log("connected to Mongo"))
  .catch((err) => console.log("error connecting", err.message));

app.use("/uploads/issues", express.static(path.join(__dirname, "uploads/issues")));

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

// Routes without middleware
app.use("/api/landingpage", landingPageRouter);
app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/adminlogin", adminloginRouter);
app.use("/api/admins", middleware.userExtractor, adminRouter);
app.use("/api/userProfile", middleware.userExtractor, userProfileRouter);
app.use("/api/nepal", nepalRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/wards", wardRouter);
app.use("/api/categories", categoryRouter);

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.use("/api/issues", middleware.userExtractor, issueRouter);
app.use("/api/ward-officers", middleware.userExtractor, wardOfficerRouter);
// app.use("/api/suggestions", suggestionRouter);
// app.use("/api/upvotes",  upvoteRouter);
app.use("/api/comments", middleware.userExtractor, commentRouter);

if (process.env.NODE_ENV === "test") {
  app.get("/test", (request, response) => {
    response.send("<h1>Hello test!</h1>");
  });

  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
}

app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);

module.exports = app;
