const calculators = require("./calculators.js");

const CATEGORY_ORDER = ["Landscaping", "Garden", "Hardscaping", "Fire Pits", "Fencing"];

module.exports = CATEGORY_ORDER.map((category) => ({
  category,
  items: calculators.filter((c) => c.category === category),
}));
