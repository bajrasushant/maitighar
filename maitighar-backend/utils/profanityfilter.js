const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// Add a ready flag
class NepaliProfanityFilter {
  constructor() {
    this.profaneWords = [];
    this.isReady = false;
    this.loadProfaneWords();
  }

  // Load the profane words from the CSV file
  loadProfaneWords() {
    const filePath = path.resolve(__dirname, "../datas/nepaliProfaneWords.csv");

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          this.profaneWords.push(row.profane_word.trim());
        })
        .on("end", () => {
          this.isReady = true; // Set ready flag
          // console.log("Profane words loaded:", this.profaneWords);
          resolve(); // Resolve the promise
        })
        .on("error", (error) => {
          console.error("Error loading profane words:", error);
          reject(error); // Reject the promise
        });
    });
  }

  containsProfaneWord(text) {
    if (!this.isReady) {
      console.warn("Profanity filter not ready yet. Skipping check.");
      return false;
    }

    console.log("Checking text:", text);
    const lowercasedText = text.toLowerCase();
    const result = this.profaneWords.some((word) => lowercasedText.includes(word));
    console.log("Profanity check result for:", text, "=>", result);
    return result;
  }

  censorText(text) {
    if (!this.isReady) {
      console.warn("Profanity filter is not ready yet.");
      return text; // Return the original text if the filter is not ready
    }

    let censoredText = text;

    this.profaneWords.forEach((word) => {
      // Create a regex to match:
      // - Allow extra characters before/after the profane word
      // - Allow spaces between characters
      const regex = new RegExp(`\\b${word}\\b`, "gi");

      censoredText = censoredText.replace(regex, (matched) => {
        // Replace the profane word with a censored version
        const visibleLength = matched.replace(/\s+/g, "").length; // Remove spaces to calculate length
        const firstLetter = matched.trim()[0]; // First visible character
        const lastLetter = matched.trim()[matched.trim().length - 1]; // Last visible character
        const middleStars = "*".repeat(visibleLength - 2); // Stars for the middle characters
        return `${firstLetter}${middleStars}${lastLetter} `;
      });
    });

    return censoredText;
  }
}

module.exports = NepaliProfanityFilter;
