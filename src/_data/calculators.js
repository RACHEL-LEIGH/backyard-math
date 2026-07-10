// Single source of truth for every calculator's catalog metadata.
// Used to render the homepage grid and each calculator's "related calculators" cards
// so category/title/description never has to be hand-duplicated across pages again.
module.exports = [
  {
    slug: "mulch",
    title: "Mulch Calculator",
    description: "Estimate bags, cubic yards, and project cost.",
    category: "Landscaping",
  },
  {
    slug: "gravel",
    title: "Gravel Calculator",
    description: "Estimate tons, cubic yards, bags, and cost.",
    category: "Landscaping",
  },
  {
    slug: "topsoil",
    title: "Topsoil Calculator",
    description: "Estimate topsoil for lawns, gardens, and grading.",
    category: "Landscaping",
  },
  {
    slug: "raised-bed-soil",
    title: "Raised Bed Soil Calculator",
    description: "Estimate soil volume for raised garden beds.",
    category: "Garden",
  },
  {
    slug: "paver",
    title: "Paver Calculator",
    description: "Estimate pavers, base gravel, sand, and cost.",
    category: "Hardscaping",
  },
  {
    slug: "concrete",
    title: "Concrete Calculator",
    description: "Estimate concrete for slabs, footings, and post holes.",
    category: "Hardscaping",
  },
  {
    slug: "retaining-wall",
    title: "Retaining Wall Calculator",
    description: "Estimate blocks, caps, backfill gravel, and cost.",
    category: "Hardscaping",
  },
  {
    slug: "fire-pit-gravel",
    title: "Fire Pit Gravel Calculator",
    description: "Estimate gravel for round fire pit seating areas.",
    category: "Fire Pits",
  },
  {
    slug: "fence-cost",
    title: "Fence Cost Calculator",
    description: "Estimate posts, panels, gates, concrete, and material cost.",
    category: "Fencing",
  },
].map((calc) => ({ ...calc, href: `/calculators/${calc.slug}.html` }));
