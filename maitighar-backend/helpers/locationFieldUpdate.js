require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Issue = require("../models/issue");

const config = require("../utils/config");

mongoose
  .connect(config.MONGO_URI)
  .then(() => console.log("connected to Mongo"))
  .catch((err) => console.log("error connecting", err.message));

async function updateIssuesWithLocation() {
  try {
    const issues = await Issue.find();
    for (const issue of issues) {
      const { latitude, longitude, assigned_province, assigned_district, assigned_ward } = issue;
      // Skip issues that do not have required fields.
      if (
        !assigned_province ||
        !assigned_district ||
        (issue.assigned_local_gov && !assigned_ward)
      ) {
        console.warn(`Skipping issue ${issue._id} due to missing required fields.`);
        continue;
      }
      if (latitude && longitude) {
        issue.location = {
          type: "Point",
          coordinates: [longitude, latitude],
        };
        await issue.save();
        console.log(`Updated issue ${issue._id} with location.`);
      }
    }

    console.log("All issues updated successfully.");
  } catch (error) {
    console.error("Error updating issues:", error);
  } finally {
    mongoose.connection.close();
  }
}

updateIssuesWithLocation();
