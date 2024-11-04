require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const fs = require("fs").promises;
const mongoose = require("mongoose");
const Department = require("../models/department");
const config = require("../utils/config");

async function connectDB() {
  mongoose
    .connect(config.MONGO_URI)
    .then(() => console.log("connected to Mongo"))
    .catch((err) => console.log("error connecting", err.message));
}

async function importMinistries() {
  try {
    // Read the JSON file
    const rawData = await fs.readFile("ministries.json", "utf8");
    const ministriesData = JSON.parse(rawData);

    console.log(`Starting import of ${ministriesData.ministries.length} ministries...`);

    let successful = 0;
    let failed = 0;
    const errors = [];

    // Process each ministry
    for (const [index, ministry] of ministriesData.ministries.entries()) {
      try {
        const ministryWithTimestamps = {
          ...ministry,
          created_at: ministry.created_at || new Date(),
          updated_at: new Date(),
        };

        await Department.findOneAndUpdate({ name: ministry.name }, ministryWithTimestamps, {
          upsert: true,
          new: true,
          runValidators: true, // Run validation for updates
        });

        successful++;

        if ((index + 1) % 5 === 0) {
          console.log(
            `Progress: ${index + 1}/${ministriesData.ministries.length} ministries processed`,
          );
        }
      } catch (err) {
        failed++;
        errors.push({
          ministry: ministry.name,
          error: err.message,
        });
        console.error(`Error processing ministry "${ministry.name}":`, err.message);
      }
    }

    // Print summary
    console.log("\nImport Summary:");
    console.log("----------------");
    console.log(`Total ministries processed: ${ministriesData.ministries.length}`);
    console.log(`Successfully imported: ${successful}`);
    console.log(`Failed: ${failed}`);

    // If there were any errors, save them to a log file
    if (errors.length > 0) {
      const errorLog = {
        timestamp: new Date().toISOString(),
        errors: errors,
      };
      await fs.writeFile("ministry-import-errors.json", JSON.stringify(errorLog, null, 2));
      console.log("\nErrors have been saved to ministry-import-errors.json");
    }
  } catch (error) {
    console.error("Import failed:", error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await importMinistries();
    console.log("Import completed successfully");
  } catch (error) {
    console.error("Import failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script if it's called directly
if (require.main === module) {
  main();
}

module.exports = { importMinistries };
