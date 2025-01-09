require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const config = require("../utils/config");

const Issue = require("../models/issue"); // Adjust the path as needed

mongoose
  .connect(config.MONGO_URI)
  .then(() => console.log("connected to Mongo"))
  .catch((err) => console.log("error connecting", err.message));

async function updateIssuesActiveStatus() {
  try {
    const result = await Issue.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } },
    );

    console.log(`Updated ${result.modifiedCount} issues`);
    mongoose.connection.close();
  } catch (error) {
    console.error("Error updating issues:", error);
    mongoose.connection.close();
  }
}

updateIssuesActiveStatus();
