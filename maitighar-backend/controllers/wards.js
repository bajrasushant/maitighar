const wardRouter = require("express").Router();
const Wards = require("../models/department");

wardRouter.get("/", async (req, res) => {
  try {
    const wardss = await Wards.find();
    res.json(wardss);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

wardRouter.get("/unassigned", async (req, res) => {
  try {
    const unassignedWards = await Wards.find({ admin_registered: null });
    res.json(unassignedWards);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = wardRouter;
