const categoryRouter = require("express").Router();
const Category = require("../models/category");

categoryRouter.get("/", async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = categoryRouter;
