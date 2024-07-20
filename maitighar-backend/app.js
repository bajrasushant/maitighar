const express = require("express");
const cors = require("cors");
const config = require("./utils/config");
const app = express();
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose
	.connect(config.MONGO_URI)
	.then(() => console.log("connected to Mongo"))
	.catch((err) => console.log("error connecting", err.message));

app.use(cors());

app.use(express.json());

app.get("/", (request, response) => {
	response.send("<h1>Hello World!</h1>");
});

module.exports = app;
