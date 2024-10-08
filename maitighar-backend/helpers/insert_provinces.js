require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const fs = require("fs");
const mongoose = require("mongoose");
const Province = require("../models/province.js");
const District = require("../models/district.js");
const LocalGov = require("../models/localgov.js");
const config = require("../utils/config");

mongoose
  .connect(config.MONGO_URI)
  .then(() => console.log("connected to Mongo"))
  .catch((err) => console.log("error connecting", err.message));

const jsonData = JSON.parse(fs.readFileSync("../../wards_parsing/province_ward.json", "utf8"));

async function insertData() {
  try {
    for (const provinceData of jsonData) {
      let province = await Province.findOne({ name: provinceData.province });

      if (!province) {
        province = await Province.create([{ name: provinceData.province }]);
        province = province[0];
      }

      for (const districtData of provinceData.districts) {
        let district = await District.findOne({
          name: districtData.name,
          province: province._id,
        });

        if (!district) {
          district = await District.create([
            {
              name: districtData.name,
              ddc_contact_email: districtData.ddc_contact_email,
              ddc_contact_number: districtData.ddc_contact_number,
              province: province._id,
            },
          ]);

          district = district[0];
        }

        for (const localGovData of districtData.local_govs) {
          const localGov = await LocalGov.findOne({
            name: localGovData.name,
            district: district._id,
          });

          if (!localGov) {
            await LocalGov.create([
              {
                name: localGovData.name,
                number_of_wards: Number(localGovData.number_of_wards),
                type: localGovData.type,
                district: district._id,
              },
            ]);
          }
        }
      }
    }

    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data, transaction aborted:", error);
  } finally {
    mongoose.connection.close(); // Close MongoDB connection
  }
}

insertData();
