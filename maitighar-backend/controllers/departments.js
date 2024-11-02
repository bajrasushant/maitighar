const departmentRouter = require("express").Router();
const Department = require("../models/department");

departmentRouter.get("/", async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

departmentRouter.get("/unassigned", async (req, res) => {
  try {
    const unassignedDepartments = await Department.find({ admin_registered: null });
    res.json(unassignedDepartments);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = departmentRouter;
