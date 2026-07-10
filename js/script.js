function formatNumber(value, decimals = 2) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

function formatCurrency(value) {
  return Number(value).toLocaleString(undefined, {
    style: "currency",
    currency: "USD"
  });
}

function value(id) {
  return parseFloat(document.getElementById(id).value);
}

function intValue(id) {
  return parseInt(document.getElementById(id).value, 10);
}

function isInvalid(values) {
  return values.some(value => Number.isNaN(value) || value < 0);
}

function resultRow(label, value) {
  return `
    <div class="result-item">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function renderResults(element, rows) {
  element.classList.remove("results-empty");
  element.innerHTML = `<div class="result-list">${rows.join("")}</div>`;
}

function showError(element) {
  element.innerHTML = `<p class="results-empty">Please enter valid positive numbers.</p>`;
}

function circleArea(diameterFeet) {
  const radius = diameterFeet / 2;
  return Math.PI * radius * radius;
}

/* Mulch Calculator */
const mulchForm = document.getElementById("mulch-form");
const mulchResults = document.getElementById("mulchResults");

mulchForm?.addEventListener("submit", function (event) {
  event.preventDefault();
  const length = value("mulchLength");
  const width = value("mulchWidth");
  const depth = value("mulchDepth");
  const bagSize = value("mulchBagSize");
  const bagPrice = value("mulchBagPrice");

  if (isInvalid([length, width, depth, bagSize, bagPrice]) || bagSize === 0) return showError(mulchResults);

  const squareFeet = length * width;
  const cubicFeet = squareFeet * (depth / 12);
  const cubicYards = cubicFeet / 27;
  const bagsNeeded = Math.ceil(cubicFeet / bagSize);
  const estimatedCost = bagsNeeded * bagPrice;

  renderResults(mulchResults, [
    resultRow("Area", `${formatNumber(squareFeet)} sq ft`),
    resultRow("Mulch needed", `${formatNumber(cubicFeet)} cu ft`),
    resultRow("Cubic yards", `${formatNumber(cubicYards)} cu yd`),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated cost", `${formatCurrency(estimatedCost)}`)
  ]);
});

/* Gravel Calculator */
const gravelForm = document.getElementById("gravel-form");
const gravelResults = document.getElementById("gravelResults");

gravelForm?.addEventListener("submit", function (event) {
  event.preventDefault();
  const length = value("gravelLength");
  const width = value("gravelWidth");
  const depth = value("gravelDepth");
  const density = value("gravelDensity");
  const bagWeight = value("gravelBagWeight");
  const bagPrice = value("gravelBagPrice");
  const overage = value("gravelOverage");

  if (isInvalid([length, width, depth, density, bagWeight, bagPrice, overage]) || density === 0 || bagWeight === 0) return showError(gravelResults);

  const multiplier = 1 + (overage / 100);
  const squareFeet = length * width;
  const cubicFeet = squareFeet * (depth / 12) * multiplier;
  const cubicYards = cubicFeet / 27;
  const pounds = cubicFeet * density;
  const tons = pounds / 2000;
  const bagsNeeded = Math.ceil(pounds / bagWeight);
  const estimatedCost = bagsNeeded * bagPrice;

  renderResults(gravelResults, [
    resultRow("Area", `${formatNumber(squareFeet)} sq ft`),
    resultRow("Volume with overage", `${formatNumber(cubicFeet)} cu ft`),
    resultRow("Cubic yards", `${formatNumber(cubicYards)} cu yd`),
    resultRow("Estimated weight", `${formatNumber(pounds, 0)} lb`),
    resultRow("Estimated tons", `${formatNumber(tons)} tons`),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated bag cost", `${formatCurrency(estimatedCost)}`)
  ]);
});

/* Raised Bed Soil Calculator */
const soilForm = document.getElementById("soil-form");
const soilResults = document.getElementById("soilResults");

soilForm?.addEventListener("submit", function (event) {
  event.preventDefault();
  const length = value("soilLength");
  const width = value("soilWidth");
  const depth = value("soilDepth");
  const beds = intValue("soilBeds");
  const bagSize = value("soilBagSize");
  const bagPrice = value("soilBagPrice");
  const overage = value("soilOverage");

  if (isInvalid([length, width, depth, beds, bagSize, bagPrice, overage]) || beds < 1 || bagSize === 0) return showError(soilResults);

  const cubicFeetRaw = length * width * (depth / 12) * beds;
  const cubicFeet = cubicFeetRaw * (1 + overage / 100);
  const cubicYards = cubicFeet / 27;
  const bagsNeeded = Math.ceil(cubicFeet / bagSize);

  renderResults(soilResults, [
    resultRow("Number of beds", `${beds}`),
    resultRow("Soil before overage", `${formatNumber(cubicFeetRaw)} cu ft`),
    resultRow("Soil with overage", `${formatNumber(cubicFeet)} cu ft`),
    resultRow("Cubic yards", `${formatNumber(cubicYards)} cu yd`),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated cost", `${formatCurrency(bagsNeeded * bagPrice)}`)
  ]);
});

/* Paver Calculator */
const paverForm = document.getElementById("paver-form");
const paverResults = document.getElementById("paverResults");

paverForm?.addEventListener("submit", function (event) {
  event.preventDefault();
  const patioLength = value("patioLength");
  const patioWidth = value("patioWidth");
  const paverLength = value("paverLength");
  const paverWidth = value("paverWidth");
  const paverPrice = value("paverPrice");
  const baseDepth = value("baseDepth");
  const sandDepth = value("sandDepth");
  const overage = value("paverOverage");

  if (isInvalid([patioLength, patioWidth, paverLength, paverWidth, paverPrice, baseDepth, sandDepth, overage]) || paverLength === 0 || paverWidth === 0) return showError(paverResults);

  const patioArea = patioLength * patioWidth;
  const paverArea = (paverLength * paverWidth) / 144;
  const paversRaw = patioArea / paverArea;
  const paversNeeded = Math.ceil(paversRaw * (1 + overage / 100));
  const baseCubicFeet = patioArea * (baseDepth / 12);
  const sandCubicFeet = patioArea * (sandDepth / 12);

  renderResults(paverResults, [
    resultRow("Patio area", `${formatNumber(patioArea)} sq ft`),
    resultRow("Paver area", `${formatNumber(paverArea)} sq ft each`),
    resultRow("Pavers before overage", `${formatNumber(paversRaw, 1)}`),
    resultRow("Pavers to buy", `${paversNeeded}`),
    resultRow("Estimated paver cost", `${formatCurrency(paversNeeded * paverPrice)}`),
    resultRow("Base gravel", `${formatNumber(baseCubicFeet)} cu ft / ${formatNumber(baseCubicFeet / 27)} cu yd`),
    resultRow("Leveling sand", `${formatNumber(sandCubicFeet)} cu ft / ${formatNumber(sandCubicFeet / 27)} cu yd`)
  ]);
});

/* Concrete Calculator */
const concreteForm = document.getElementById("concrete-form");
const concreteResults = document.getElementById("concreteResults");

concreteForm?.addEventListener("submit", function (event) {
  event.preventDefault();

  const projectType = document.getElementById("concreteType").value;
  const bagSize = value("concreteBagYield");
  const bagPrice = value("concreteBagPrice");
  const overage = value("concreteOverage");
  let cubicFeet = 0;
  let label = "";

  if (projectType === "slab") {
    const length = value("slabLength");
    const width = value("slabWidth");
    const thickness = value("slabThickness");
    if (isInvalid([length, width, thickness])) return showError(concreteResults);
    cubicFeet = length * width * (thickness / 12);
    label = `${formatNumber(length)} ft × ${formatNumber(width)} ft slab`;
  }

  if (projectType === "footing") {
    const length = value("footingLength");
    const width = value("footingWidth");
    const depth = value("footingDepth");
    if (isInvalid([length, width, depth])) return showError(concreteResults);
    cubicFeet = length * width * (depth / 12);
    label = `${formatNumber(length)} ft continuous footing`;
  }

  if (projectType === "posthole") {
    const diameter = value("holeDiameter");
    const depth = value("holeDepth");
    const holes = intValue("holeCount");
    if (isInvalid([diameter, depth, holes]) || holes < 1) return showError(concreteResults);
    const radiusFeet = (diameter / 12) / 2;
    cubicFeet = Math.PI * radiusFeet * radiusFeet * (depth / 12) * holes;
    label = `${holes} round post holes`;
  }

  if (isInvalid([cubicFeet, bagSize, bagPrice, overage]) || bagSize === 0) return showError(concreteResults);

  const cubicFeetWithOverage = cubicFeet * (1 + overage / 100);
  const cubicYards = cubicFeetWithOverage / 27;
  const bagsNeeded = Math.ceil(cubicFeetWithOverage / bagSize);

  renderResults(concreteResults, [
    resultRow("Project", label),
    resultRow("Concrete before overage", `${formatNumber(cubicFeet)} cu ft`),
    resultRow("Concrete with overage", `${formatNumber(cubicFeetWithOverage)} cu ft`),
    resultRow("Cubic yards", `${formatNumber(cubicYards)} cu yd`),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated bag cost", `${formatCurrency(bagsNeeded * bagPrice)}`)
  ]);
});

document.getElementById("concreteType")?.addEventListener("change", function () {
  document.querySelectorAll("[data-concrete-section]").forEach(section => {
    section.style.display = section.dataset.concreteSection === this.value ? "block" : "none";
  });
});

/* Topsoil Calculator */
const topsoilForm = document.getElementById("topsoil-form");
const topsoilResults = document.getElementById("topsoilResults");

topsoilForm?.addEventListener("submit", function (event) {
  event.preventDefault();

  const length = value("topsoilLength");
  const width = value("topsoilWidth");
  const depth = value("topsoilDepth");
  const bagSize = value("topsoilBagSize");
  const bagPrice = value("topsoilBagPrice");
  const overage = value("topsoilOverage");

  if (isInvalid([length, width, depth, bagSize, bagPrice, overage]) || bagSize === 0) return showError(topsoilResults);

  const area = length * width;
  const cubicFeetRaw = area * (depth / 12);
  const cubicFeet = cubicFeetRaw * (1 + overage / 100);
  const cubicYards = cubicFeet / 27;
  const bagsNeeded = Math.ceil(cubicFeet / bagSize);

  renderResults(topsoilResults, [
    resultRow("Area", `${formatNumber(area)} sq ft`),
    resultRow("Topsoil before overage", `${formatNumber(cubicFeetRaw)} cu ft`),
    resultRow("Topsoil with overage", `${formatNumber(cubicFeet)} cu ft`),
    resultRow("Cubic yards", `${formatNumber(cubicYards)} cu yd`),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated bag cost", `${formatCurrency(bagsNeeded * bagPrice)}`)
  ]);
});

/* Retaining Wall Calculator */
const wallForm = document.getElementById("wall-form");
const wallResults = document.getElementById("wallResults");

wallForm?.addEventListener("submit", function (event) {
  event.preventDefault();

  const wallLength = value("wallLength");
  const wallHeight = value("wallHeight");
  const blockLength = value("blockLength");
  const blockHeight = value("blockHeight");
  const blockPrice = value("blockPrice");
  const capLength = value("capLength");
  const capPrice = value("capPrice");
  const gravelWidth = value("wallGravelWidth");
  const gravelDepth = value("wallGravelDepth");
  const gravelHeight = value("wallGravelHeight");
  const overage = value("wallOverage");

  if (isInvalid([wallLength, wallHeight, blockLength, blockHeight, blockPrice, capLength, capPrice, gravelWidth, gravelDepth, gravelHeight, overage]) || blockLength === 0 || blockHeight === 0 || capLength === 0) return showError(wallResults);

  const blocksPerCourse = Math.ceil((wallLength * 12) / blockLength);
  const courses = Math.ceil((wallHeight * 12) / blockHeight);
  const rawBlocks = blocksPerCourse * courses;
  const blocksNeeded = Math.ceil(rawBlocks * (1 + overage / 100));
  const capsNeeded = Math.ceil(((wallLength * 12) / capLength) * (1 + overage / 100));

  const gravelCubicFeet = wallLength * gravelWidth * gravelHeight;
  const baseCubicFeet = wallLength * gravelWidth * (gravelDepth / 12);
  const totalGravelCubicFeet = gravelCubicFeet + baseCubicFeet;

  renderResults(wallResults, [
    resultRow("Blocks per course", `${blocksPerCourse}`),
    resultRow("Courses high", `${courses}`),
    resultRow("Wall blocks to buy", `${blocksNeeded}`),
    resultRow("Cap blocks to buy", `${capsNeeded}`),
    resultRow("Estimated block cost", `${formatCurrency((blocksNeeded * blockPrice) + (capsNeeded * capPrice))}`),
    resultRow("Drainage/backfill gravel", `${formatNumber(totalGravelCubicFeet)} cu ft / ${formatNumber(totalGravelCubicFeet / 27)} cu yd`)
  ]);
});

/* Fire Pit Gravel Calculator */
const firePitForm = document.getElementById("firepit-form");
const firePitResults = document.getElementById("firePitResults");

firePitForm?.addEventListener("submit", function (event) {
  event.preventDefault();

  const outerDiameter = value("fireOuterDiameter");
  const innerDiameter = value("fireInnerDiameter");
  const depth = value("fireGravelDepth");
  const density = value("fireGravelDensity");
  const bagWeight = value("fireBagWeight");
  const bagPrice = value("fireBagPrice");
  const overage = value("fireOverage");

  if (isInvalid([outerDiameter, innerDiameter, depth, density, bagWeight, bagPrice, overage]) || density === 0 || bagWeight === 0 || innerDiameter >= outerDiameter) return showError(firePitResults);

  const area = circleArea(outerDiameter) - circleArea(innerDiameter);
  const cubicFeet = area * (depth / 12) * (1 + overage / 100);
  const cubicYards = cubicFeet / 27;
  const pounds = cubicFeet * density;
  const tons = pounds / 2000;
  const bagsNeeded = Math.ceil(pounds / bagWeight);

  renderResults(firePitResults, [
    resultRow("Gravel area", `${formatNumber(area)} sq ft`),
    resultRow("Gravel volume", `${formatNumber(cubicFeet)} cu ft`),
    resultRow("Cubic yards", `${formatNumber(cubicYards)} cu yd`),
    resultRow("Estimated weight", `${formatNumber(pounds, 0)} lb`),
    resultRow("Estimated tons", `${formatNumber(tons)} tons`),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated bag cost", `${formatCurrency(bagsNeeded * bagPrice)}`)
  ]);
});


/* Fence Cost Calculator */
const fenceForm = document.getElementById("fence-form");
const fenceResults = document.getElementById("fenceResults");

fenceForm?.addEventListener("submit", function (event) {
  event.preventDefault();

  const fenceLength = value("fenceLength");
  const postSpacing = value("postSpacing");
  const panelWidth = value("panelWidth");
  const panelPrice = value("panelPrice");
  const postPrice = value("postPrice");
  const gateCount = intValue("gateCount");
  const gatePrice = value("gatePrice");
  const railCount = value("railCount");
  const railLength = value("railLength");
  const railPrice = value("railPrice");
  const picketsPerFoot = value("picketsPerFoot");
  const picketPrice = value("picketPrice");
  const concreteBagsPerPost = value("concreteBagsPerPost");
  const concreteBagPrice = value("concreteBagPrice");
  const hardwareCost = value("hardwareCost");
  const overage = value("fenceOverage");

  if (
    isInvalid([
      fenceLength, postSpacing, panelWidth, panelPrice, postPrice, gateCount, gatePrice,
      railCount, railLength, railPrice, picketsPerFoot, picketPrice,
      concreteBagsPerPost, concreteBagPrice, hardwareCost, overage
    ]) ||
    fenceLength === 0 ||
    postSpacing === 0 ||
    panelWidth === 0 ||
    railLength === 0
  ) {
    return showError(fenceResults);
  }

  const multiplier = 1 + (overage / 100);

  const postCount = Math.ceil(fenceLength / postSpacing) + 1;
  const panelCount = Math.ceil((fenceLength / panelWidth) * multiplier);

  const railPiecesRaw = (fenceLength * railCount) / railLength;
  const railPieces = Math.ceil(railPiecesRaw * multiplier);

  const picketCount = Math.ceil((fenceLength * picketsPerFoot) * multiplier);
  const concreteBags = Math.ceil(postCount * concreteBagsPerPost);

  const panelCost = panelCount * panelPrice;
  const postCost = postCount * postPrice;
  const gateCost = gateCount * gatePrice;
  const railCost = railPieces * railPrice;
  const picketCost = picketCount * picketPrice;
  const concreteCost = concreteBags * concreteBagPrice;

  const materialCost = panelCost + postCost + gateCost + railCost + picketCost + concreteCost + hardwareCost;

  renderResults(fenceResults, [
    resultRow("Fence length", `${formatNumber(fenceLength)} linear ft`),
    resultRow("Posts needed", `${postCount}`),
    resultRow("Panels needed", `${panelCount}`),
    resultRow("Rail pieces needed", `${railPieces}`),
    resultRow("Pickets needed", `${picketCount}`),
    resultRow("Concrete bags", `${concreteBags}`),
    resultRow("Gate cost", `${formatCurrency(gateCost)}`),
    resultRow("Estimated material cost", `${formatCurrency(materialCost)}`)
  ]);
});


/* Calculator Rating Tracking */
document.querySelectorAll(".rating-box").forEach((box) => {
  const calculatorName = box.dataset.calculator || "unknown";
  const buttons = Array.from(box.querySelectorAll(".star-rating button"));
  const message = box.querySelector(".rating-message");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const rating = Number(button.dataset.rating);

      buttons.forEach((starButton) => {
        const starValue = Number(starButton.dataset.rating);
        const isSelected = starValue <= rating;
        starButton.classList.toggle("selected", isSelected);
        starButton.textContent = isSelected ? "★" : "☆";
        starButton.setAttribute("aria-pressed", isSelected ? "true" : "false");
      });

      if (message) {
        message.textContent = "Thanks for your feedback!";
      }

      if (typeof gtag === "function") {
        gtag("event", "calculator_rating", {
          calculator_name: calculatorName,
          rating: rating,
          page_path: window.location.pathname
        });
      }
    });
  });
});
