require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Department = require("../models/department"); // Adjust path as necessary
const Province = require("../models/province"); // Adjust path as necessary
const config = require("../utils/config");

// Connect to the database
mongoose
  .connect(config.MONGO_URI)
  .then(() => console.log("connected to Mongo"))
  .catch((err) => console.log("error connecting", err.message));

async function updateDepartmentsWithProvince() {
  try {
    // Step 1: Fetch all provinces
    const provinces = await Province.find();
    const provinceMap = new Map();

    // Step 2: Create a mapping of province names to IDs for easy lookup
    provinces.forEach((province) => {
      provinceMap.set(province.name.toLowerCase(), province._id);
    });

    // Step 3: Fetch all departments with level "provincial"
    const departments = await Department.find({ level: "provincial" });

    for (const department of departments) {
      let foundProvinceId = null;

      provinceMap.forEach((provinceId, provinceName) => {
        if (department.address.toLowerCase().includes(provinceName)) {
          foundProvinceId = provinceId;
        }
      });

      // Step 4: Update the department's province field if a province was found in the address
      if (foundProvinceId) {
        department.province = foundProvinceId;
        await department.save();
        console.log(`Updated department ${department.name} with province ${foundProvinceId}`);
      }
    }

    console.log("Department update process complete.");
  } catch (error) {
    console.error("Error updating departments:", error);
  } finally {
    // Disconnect from the database
    mongoose.connection.close();
  }
}

updateDepartmentsWithProvince();
