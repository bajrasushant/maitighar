const express = require("express");
const cors = require("cors");
const config = require("./utils/config");
const app = express();
const mongoose = require("mongoose");
const issueRouter = require("./controllers/issues")
const suggestionRouter = require("./controllers/suggestions")
const userRouter = require("./controllers/users");
const upvoteRouter = require("./controllers/upvotes");
const loginRouter = require("./controllers/login");
const adminloginRouter = require("./controllers/adminlogin");
const adminRouter = require("./controllers/admins");
const commentRouter = require("./controllers/comments");
const middleware = require("./utils/middleware");

mongoose.set("strictQuery", false);
mongoose
	.connect(config.MONGO_URI)
	.then(() => console.log("connected to Mongo"))
	.catch((err) => console.log("error connecting", err.message));

app.use(cors());

app.use(express.json());
app.use(middleware.requestLogger);

app.use(middleware.tokenExtractor);

app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/adminlogin", adminloginRouter);
app.use("/api/admins", adminRouter);

app.get("/", (request, response) => {
	response.send("<h1>Hello World!</h1>");
});

app.use("/api/issues", middleware.userExtractor,  issueRouter);
// app.use("/api/suggestions", suggestionRouter);
// app.use("/api/upvotes",  upvoteRouter);
app.use("/api/comments", middleware.userExtractor, commentRouter);

// app.use("/api/comments", middleware.userExtractor, commentRouter);

app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);


module.exports = app;
