const express = require("express");
const cors = require("cors");
const config = require("./utils/config");
const app = express();
const mongoose = require("mongoose");
const issueRouter = require("./controllers/issues")
const userRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");

mongoose.set("strictQuery", false);
mongoose
	.connect(config.MONGO_URI)
	.then(() => console.log("connected to Mongo"))
	.catch((err) => console.log("error connecting", err.message));

app.use(cors());

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);


app.get("/", (request, response) => {
	response.send("<h1>Hello World!</h1>");
});
app.use("/api/issues",  issueRouter);

module.exports = app;
