const wardRouter = require("express").Router();
const Ward = require("../models/ward");

// Fetch all wards
wardRouter.get("/", async (req, res) => {
  try {
    const { localGovId, unassigned } = req.query;
    const filter = {};

    if (localGovId) {
      filter.localGov = localGovId;
    }

    if (unassigned === "true") {
      filter.admin_registered = null;
    } else if (unassigned === "false") {
      filter.admin_registered = { $ne: null };
    }

    const wards = await Ward.find(filter).populate("localGov");
    res.json(wards);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = wardRouter;
