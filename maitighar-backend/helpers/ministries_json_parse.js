require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Category = require("../models/category");
const config = require("../utils/config");
const fs = require("fs").promises; // Using promises version for better async handling

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
      // Try to find existing category or create new one
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

const cleanText = (text) => {
  if (!text) return "";
  return text
    .replace(/\[\[([^\]|]*?)(?:\|[^\]]*?)?\]\]/g, "$1")
    .replace(/'''|'''/g, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const extractUrl = (text) => {
  if (!text) return "";
  const urlMatch = text.match(/\[(https?:\/\/[^\s\]]+)/);
  return urlMatch ? urlMatch[1] : "";
};

// Function to get category ID based on ministry name
function getCategoryId(ministryName, categoryMap) {
  const name = ministryName.toLowerCase();

  const categoryMappings = {
    "chief minister": "administration",
    infrastructure: "infrastructure",
    econom: "economy",
    education: "social",
    social: "social",
    forest: "natural resources",
    environment: "natural resources",
    health: "health",
    law: "law",
    justice: "law",
    agriculture: "agriculture",
    industry: "industry",
    tourism: "industry",
  };

  for (const [key, value] of Object.entries(categoryMappings)) {
    if (name.includes(key)) {
      return categoryMap[value];
    }
  }

  return categoryMap["administration"]; // default category
}

function formatMinistryData(ministryData, provinceName, categoryMap) {
  return {
    name: ministryData.name,
    nepaliName: ministryData.nepaliName || "",
    pointOfContact: {
      name: ministryData.minister || "Not Assigned",
    },
    category: getCategoryId(ministryData.name, categoryMap),
    website: ministryData.website || "",
    address: provinceName ? `${provinceName} Province, Nepal` : "Singha Durbar, Kathmandu",
    active: true,
    level: provinceName ? "provincial" : "federal",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function parseFederalMinistries(wikiText, categoryMap) {
  const ministries = [];
  if (!wikiText) return ministries;

  const rows = wikiText.split("|-");

  rows.slice(1).forEach((row) => {
    const columns = row
      .split("|")
      .map((col) => col.trim())
      .filter(Boolean);

    if (columns.length >= 4) {
      const startIndex = columns[0].match(/^\d+$/) ? 1 : 0;

      const ministryData = {
        name: cleanText(columns[startIndex + 1]),
        nepaliName: cleanText(columns[startIndex + 2]),
        minister: cleanText(columns[startIndex + 3]),
        website: extractUrl(columns[startIndex + 4] || ""),
      };

      if (ministryData.name) {
        ministries.push(formatMinistryData(ministryData, null, categoryMap));
      }
    }
  });

  return ministries;
}

function parseProvincialMinistries(wikiText, categoryMap) {
  const ministries = [];
  if (!wikiText) return ministries;

  const provinces = wikiText.split(/===\s*(.*?)\s*===/).slice(1);

  for (let i = 0; i < provinces.length; i += 2) {
    const provinceName = provinces[i].trim();
    const provinceData = provinces[i + 1];

    if (!provinceData) continue;

    const rows = provinceData.split("|-");

    rows.slice(1).forEach((row) => {
      const columns = row
        .split("|")
        .map((col) => col.trim())
        .filter(Boolean);

      if (columns.length >= 4) {
        const startIndex = columns[0].match(/^\d+$/) ? 1 : 0;
        const ministryName = cleanText(columns[startIndex + 1]);

        if (!ministryName || ministryName.toLowerCase().includes("rowspan")) return;

        const ministryData = {
          name: `${ministryName} (${provinceName})`,
          nepaliName: cleanText(columns[startIndex + 2]),
          minister: cleanText(columns[startIndex + 3]),
          website: extractUrl(columns[startIndex + 4] || ""),
        };

        ministries.push(formatMinistryData(ministryData, provinceName, categoryMap));
      }
    });
  }

  return ministries;
}

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to MongoDB");

    // Setup categories
    const categoryMap = await setupCategories();

    // Read input files
    const federalData = await fs.readFile("federal_ministries.txt", "utf8");
    const provincialData = await fs.readFile("provincial_ministries.txt", "utf8");

    // Parse ministries
    const federalMinistries = parseFederalMinistries(federalData, categoryMap);
    const provincialMinistries = parseProvincialMinistries(provincialData, categoryMap);

    const allMinistries = [...federalMinistries, ...provincialMinistries];

    const result = {
      total: allMinistries.length,
      federalCount: federalMinistries.length,
      provincialCount: provincialMinistries.length,
      ministries: allMinistries,
    };

    // Write output
    await fs.writeFile("ministries.json", JSON.stringify(result, null, 2));

    console.log("Successfully processed ministry data");
    console.log(`Total ministries: ${result.total}`);
    console.log(`Federal ministries: ${result.federalCount}`);
    console.log(`Provincial ministries: ${result.provincialCount}`);
  } catch (error) {
    console.error("Error processing ministry data:", error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  cleanText,
  extractUrl,
  parseFederalMinistries,
  parseProvincialMinistries,
  formatMinistryData,
};
