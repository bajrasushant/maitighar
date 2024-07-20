const express = require("express");
const cors = require("cors");
const config = require("./utils/config");
const app = express();
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const uri = "mongodb+srv://bajrasushant:3RiHt10neDtkw2G3@maitighar.8hcenvt.mongodb.net/maitighar?retryWrites=true&w=majority&appName=maitighar"
mongoose
	.connect(uri)
	.then(() => console.log("connected to Mongo"))
	.catch((err) => console.log("error connecting", err.message));

app.use(cors());

app.use(express.json());

app.get("/", (request, response) => {
	response.send("<h1>Hello World!</h1>");
});

module.exports = app;
