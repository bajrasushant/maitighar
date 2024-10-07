const Province = require("../models/province");
const District = require("../models/district");
const LocalGov = require("../models/localgov");
const nepalDetailsRouter = require("express").Router();

nepalDetailsRouter.get("/provinces", async (req, res) => {
  try {
    const provinces = await Province.find({});
    res.json(provinces);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch provinces." });
  }
});

nepalDetailsRouter.get("/districts", async (req, res) => {
  const { provinceId } = req.query;
  if (!provinceId) {
    return res.status(400).json({ error: "Province ID is required" });
  }
  try {
    const districts = await District.find({ province: provinceId });
    res.status(200).json(districts);
  } catch (error) {
    console.error("Error fetching districts: ", error);
    res.status(500).json({ error: "Oops, something went wrong." });
  }
});

nepalDetailsRouter.get("/localgovs", async (req, res) => {
  const { districtId } = req.query;

  if (!districtId) {
    return res.status(400).json({ error: "District ID is required." });
  }

  try {
    const localGovs = await LocalGov.find({ district: districtId });
    res.status(200).json(localGovs);
  } catch (error) {
    console.error("Error fetching local governments:", error);
    res.status(500).json({ error: "Oops, something went wrong." });
  }
});

module.exports = nepalDetailsRouter;
