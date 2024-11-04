require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Category = require("../models/category");
const config = require("../utils/config");

mongoose
  .connect(config.MONGO_URI)
  .then(() => console.log("connected to Mongo"))
  .catch((err) => console.log("error connecting", err.message));

const CATEGORIES = [
  {
    name: "Administration",
    description: "Executive offices, internal affairs, and general administration departments",
  },
  {
    name: "Infrastructure",
    description: "Physical infrastructure, energy, water supply, and development",
  },
  {
    name: "Economy",
    description: "Financial affairs, planning, and economic development",
  },
  {
    name: "Social",
    description: "Social development, education, sports, and cultural affairs",
  },
  {
    name: "Natural Resources",
    description: "Forests, environment, and natural resource management",
  },
  {
    name: "Health",
    description: "Healthcare, public health, and medical services",
  },
  {
    name: "Law",
    description: "Legal affairs, justice, and legislative matters",
  },
  {
    name: "Agriculture",
    description: "Agriculture, livestock, and cooperative development",
  },
  {
    name: "Industry",
    description: "Industry, commerce, tourism, and business development",
  },
];

async function setupCategories() {
  try {
    console.log("Setting up categories...");
    const categoryMap = {};

    for (const category of CATEGORIES) {
      const existingCategory = await Category.findOne({ name: category.name });
      if (existingCategory) {
        categoryMap[category.name.toLowerCase()] = existingCategory._id;
        console.log(`Category exists: ${category.name}`);
      } else {
        const newCategory = await Category.create(category);
        categoryMap[category.name.toLowerCase()] = newCategory._id;
        console.log(`Created category: ${category.name}`);
      }
    }

    return categoryMap;
  } catch (error) {
    console.error("Error setting up categories:", error);
    throw error;
  }
}

setupCategories();
