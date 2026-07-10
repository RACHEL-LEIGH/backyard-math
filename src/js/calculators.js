/* ---- Unit system ---- */
const UNIT_KEY = "bm-units";
const FT_TO_M = 0.3048;
const IN_TO_CM = 2.54;
const LB_TO_KG = 0.45359237;
const CUFT_TO_CUM = 0.0283168;
const SQFT_TO_SQM = 0.0929030;

function getUnitSystem() {
  return localStorage.getItem(UNIT_KEY) === "metric" ? "metric" : "imperial";
}

function isMetric() {
  return getUnitSystem() === "metric";
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/* Reads a length input (authored in feet) and returns feet, regardless of the displayed unit system */
function lengthValue(id) {
  const raw = parseFloat(document.getElementById(id).value);
  return isMetric() ? raw / FT_TO_M : raw;
}

/* Reads a small-dimension input (authored in inches) and returns inches */
function depthValue(id) {
  const raw = parseFloat(document.getElementById(id).value);
  return isMetric() ? raw / IN_TO_CM : raw;
}

function formatLength(feet, decimals = 2) {
  return isMetric()
    ? `${formatNumber(feet * FT_TO_M, decimals)} m`
    : `${formatNumber(feet, decimals)} ft`;
}

function formatLinearLength(feet, decimals = 2) {
  return isMetric()
    ? `${formatNumber(feet * FT_TO_M, decimals)} linear m`
    : `${formatNumber(feet, decimals)} linear ft`;
}

function formatArea(sqft, decimals = 2) {
  return isMetric()
    ? `${formatNumber(sqft * SQFT_TO_SQM, decimals)} m²`
    : `${formatNumber(sqft, decimals)} sq ft`;
}

function formatVolume(cuft, decimals = 2) {
  return isMetric()
    ? `${formatNumber(cuft * CUFT_TO_CUM, 3)} m³`
    : `${formatNumber(cuft, decimals)} cu ft`;
}

/* For rows that originally combined "X cu ft / Y cu yd" into one line */
function formatVolumeCombined(cuft) {
  return isMetric()
    ? formatVolume(cuft)
    : `${formatNumber(cuft)} cu ft / ${formatNumber(cuft / 27)} cu yd`;
}

/* Cubic yards only makes sense as a standalone row in imperial; omit it in metric */
function cubicYardsRow(cuft) {
  return isMetric() ? null : resultRow("Cubic yards", `${formatNumber(cuft / 27)} cu yd`);
}

function formatWeight(lb, decimals = 0) {
  return isMetric()
    ? `${formatNumber(lb * LB_TO_KG, decimals)} kg`
    : `${formatNumber(lb, decimals)} lb`;
}

function largeWeightRow(lb) {
  return isMetric()
    ? resultRow("Estimated tonnes", `${formatNumber((lb * LB_TO_KG) / 1000)} t`)
    : resultRow("Estimated tons", `${formatNumber(lb / 2000)} tons`);
}

/*
 * Converted values (e.g. 10 ft -> 3.05 m) rarely land on the original
 * imperial step (often step="0.1"), which makes the browser silently
 * refuse to submit the form via native constraint validation — no error,
 * just nothing happens. Relax step to "any" in metric mode and restore
 * each field's original step (captured once on load) back in imperial.
 */
function setUnitAwareStep(el, toSystem) {
  if (toSystem === "metric") {
    if (el.dataset.origStep === undefined) el.dataset.origStep = el.step || "any";
    el.step = "any";
  } else if (el.dataset.origStep !== undefined) {
    el.step = el.dataset.origStep;
  }
}

function convertAllInputs(fromSystem, toSystem) {
  if (fromSystem === toSystem) return;

  const convert = (raw, factor, decimals) =>
    toSystem === "metric" ? round(raw * factor, decimals) : round(raw / factor, decimals);

  document.querySelectorAll('input[data-conv="length"]').forEach((el) => {
    setUnitAwareStep(el, toSystem);
    const raw = parseFloat(el.value);
    if (!Number.isNaN(raw)) el.value = convert(raw, FT_TO_M, 2);
    const placeholder = parseFloat(el.placeholder);
    if (!Number.isNaN(placeholder)) el.placeholder = convert(placeholder, FT_TO_M, 2);
  });

  document.querySelectorAll('input[data-conv="depth"]').forEach((el) => {
    setUnitAwareStep(el, toSystem);
    const raw = parseFloat(el.value);
    if (!Number.isNaN(raw)) el.value = convert(raw, IN_TO_CM, 1);
    const placeholder = parseFloat(el.placeholder);
    if (!Number.isNaN(placeholder)) el.placeholder = convert(placeholder, IN_TO_CM, 1);
  });
}

function updateUnitLabels() {
  const system = getUnitSystem();

  document.querySelectorAll("[data-imperial]").forEach((span) => {
    span.textContent = system === "metric" ? span.dataset.metric : span.dataset.imperial;
  });

  document.querySelectorAll(".unit-toggle-btn").forEach((btn) => {
    const active = btn.dataset.units === system;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function initUnitToggle() {
  if (getUnitSystem() === "metric") convertAllInputs("imperial", "metric");
  updateUnitLabels();

  document.querySelectorAll(".unit-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const newSystem = btn.dataset.units;
      const oldSystem = getUnitSystem();
      if (newSystem === oldSystem) return;
      convertAllInputs(oldSystem, newSystem);
      localStorage.setItem(UNIT_KEY, newSystem);
      updateUnitLabels();
    });
  });
}

initUnitToggle();

/* ---- Shared calculator helpers ---- */
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
  element.innerHTML = `<div class="result-list">${rows.filter(Boolean).join("")}</div>`;
}

function showError(element) {
  element.innerHTML = `<p class="results-empty">Please enter valid positive numbers.</p>`;
}

function circleArea(diameterFeet) {
  const radius = diameterFeet / 2;
  return Math.PI * radius * radius;
}

/**
 * Wires a calculator form's submit handler to a compute function.
 * `compute` returns an array of result rows on success, or a falsy
 * value (e.g. from an early `return` on invalid input) to show the
 * generic validation error instead.
 */
function bindCalculator(formId, resultsId, compute) {
  const form = document.getElementById(formId);
  const results = document.getElementById(resultsId);
  if (!form || !results) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const rows = compute();
    if (!rows) return showError(results);
    renderResults(results, rows);
  });
}

/* Mulch Calculator */
bindCalculator("mulch-form", "mulchResults", () => {
  const length = lengthValue("mulchLength");
  const width = lengthValue("mulchWidth");
  const depth = depthValue("mulchDepth");
  const bagSize = value("mulchBagSize");
  const bagPrice = value("mulchBagPrice");

  if (isInvalid([length, width, depth, bagSize, bagPrice]) || bagSize === 0) return null;

  const squareFeet = length * width;
  const cubicFeet = squareFeet * (depth / 12);
  const bagsNeeded = Math.ceil(cubicFeet / bagSize);
  const estimatedCost = bagsNeeded * bagPrice;

  return [
    resultRow("Area", formatArea(squareFeet)),
    resultRow("Mulch needed", formatVolume(cubicFeet)),
    cubicYardsRow(cubicFeet),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated cost", `${formatCurrency(estimatedCost)}`)
  ];
});

/* Gravel Calculator */
bindCalculator("gravel-form", "gravelResults", () => {
  const length = lengthValue("gravelLength");
  const width = lengthValue("gravelWidth");
  const depth = depthValue("gravelDepth");
  const density = value("gravelDensity");
  const bagWeight = value("gravelBagWeight");
  const bagPrice = value("gravelBagPrice");
  const overage = value("gravelOverage");

  if (isInvalid([length, width, depth, density, bagWeight, bagPrice, overage]) || density === 0 || bagWeight === 0) return null;

  const multiplier = 1 + (overage / 100);
  const squareFeet = length * width;
  const cubicFeet = squareFeet * (depth / 12) * multiplier;
  const pounds = cubicFeet * density;
  const bagsNeeded = Math.ceil(pounds / bagWeight);
  const estimatedCost = bagsNeeded * bagPrice;

  return [
    resultRow("Area", formatArea(squareFeet)),
    resultRow("Volume with overage", formatVolume(cubicFeet)),
    cubicYardsRow(cubicFeet),
    resultRow("Estimated weight", formatWeight(pounds)),
    largeWeightRow(pounds),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated bag cost", `${formatCurrency(estimatedCost)}`)
  ];
});

/* Raised Bed Soil Calculator */
bindCalculator("soil-form", "soilResults", () => {
  const length = lengthValue("soilLength");
  const width = lengthValue("soilWidth");
  const depth = depthValue("soilDepth");
  const beds = intValue("soilBeds");
  const bagSize = value("soilBagSize");
  const bagPrice = value("soilBagPrice");
  const overage = value("soilOverage");

  if (isInvalid([length, width, depth, beds, bagSize, bagPrice, overage]) || beds < 1 || bagSize === 0) return null;

  const cubicFeetRaw = length * width * (depth / 12) * beds;
  const cubicFeet = cubicFeetRaw * (1 + overage / 100);
  const bagsNeeded = Math.ceil(cubicFeet / bagSize);

  return [
    resultRow("Number of beds", `${beds}`),
    resultRow("Soil before overage", formatVolume(cubicFeetRaw)),
    resultRow("Soil with overage", formatVolume(cubicFeet)),
    cubicYardsRow(cubicFeet),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated cost", `${formatCurrency(bagsNeeded * bagPrice)}`)
  ];
});

/* Paver Calculator */
bindCalculator("paver-form", "paverResults", () => {
  const patioLength = lengthValue("patioLength");
  const patioWidth = lengthValue("patioWidth");
  const paverLength = depthValue("paverLength");
  const paverWidth = depthValue("paverWidth");
  const paverPrice = value("paverPrice");
  const baseDepth = depthValue("baseDepth");
  const sandDepth = depthValue("sandDepth");
  const overage = value("paverOverage");

  if (isInvalid([patioLength, patioWidth, paverLength, paverWidth, paverPrice, baseDepth, sandDepth, overage]) || paverLength === 0 || paverWidth === 0) return null;

  const patioArea = patioLength * patioWidth;
  const paverArea = (paverLength * paverWidth) / 144;
  const paversRaw = patioArea / paverArea;
  const paversNeeded = Math.ceil(paversRaw * (1 + overage / 100));
  const baseCubicFeet = patioArea * (baseDepth / 12);
  const sandCubicFeet = patioArea * (sandDepth / 12);

  return [
    resultRow("Patio area", formatArea(patioArea)),
    resultRow("Paver area", `${formatArea(paverArea, 3)} each`),
    resultRow("Pavers before overage", `${formatNumber(paversRaw, 1)}`),
    resultRow("Pavers to buy", `${paversNeeded}`),
    resultRow("Estimated paver cost", `${formatCurrency(paversNeeded * paverPrice)}`),
    resultRow("Base gravel", formatVolumeCombined(baseCubicFeet)),
    resultRow("Leveling sand", formatVolumeCombined(sandCubicFeet))
  ];
});

/* Concrete Calculator */
document.getElementById("concreteType")?.addEventListener("change", function () {
  document.querySelectorAll("[data-concrete-section]").forEach(section => {
    section.classList.toggle("is-hidden", section.dataset.concreteSection !== this.value);
  });
});

bindCalculator("concrete-form", "concreteResults", () => {
  const projectType = document.getElementById("concreteType").value;
  const bagSize = value("concreteBagYield");
  const bagPrice = value("concreteBagPrice");
  const overage = value("concreteOverage");
  let cubicFeet = 0;
  let label = "";

  if (projectType === "slab") {
    const length = lengthValue("slabLength");
    const width = lengthValue("slabWidth");
    const thickness = depthValue("slabThickness");
    if (isInvalid([length, width, thickness])) return null;
    cubicFeet = length * width * (thickness / 12);
    label = `${formatLength(length)} × ${formatLength(width)} slab`;
  }

  if (projectType === "footing") {
    const length = lengthValue("footingLength");
    const width = lengthValue("footingWidth");
    const depth = depthValue("footingDepth");
    if (isInvalid([length, width, depth])) return null;
    cubicFeet = length * width * (depth / 12);
    label = `${formatLength(length)} continuous footing`;
  }

  if (projectType === "posthole") {
    const diameter = depthValue("holeDiameter");
    const depth = depthValue("holeDepth");
    const holes = intValue("holeCount");
    if (isInvalid([diameter, depth, holes]) || holes < 1) return null;
    const radiusFeet = (diameter / 12) / 2;
    cubicFeet = Math.PI * radiusFeet * radiusFeet * (depth / 12) * holes;
    label = `${holes} round post holes`;
  }

  if (isInvalid([cubicFeet, bagSize, bagPrice, overage]) || bagSize === 0) return null;

  const cubicFeetWithOverage = cubicFeet * (1 + overage / 100);
  const bagsNeeded = Math.ceil(cubicFeetWithOverage / bagSize);

  return [
    resultRow("Project", label),
    resultRow("Concrete before overage", formatVolume(cubicFeet)),
    resultRow("Concrete with overage", formatVolume(cubicFeetWithOverage)),
    cubicYardsRow(cubicFeetWithOverage),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated bag cost", `${formatCurrency(bagsNeeded * bagPrice)}`)
  ];
});

/* Topsoil Calculator */
bindCalculator("topsoil-form", "topsoilResults", () => {
  const length = lengthValue("topsoilLength");
  const width = lengthValue("topsoilWidth");
  const depth = depthValue("topsoilDepth");
  const bagSize = value("topsoilBagSize");
  const bagPrice = value("topsoilBagPrice");
  const overage = value("topsoilOverage");

  if (isInvalid([length, width, depth, bagSize, bagPrice, overage]) || bagSize === 0) return null;

  const area = length * width;
  const cubicFeetRaw = area * (depth / 12);
  const cubicFeet = cubicFeetRaw * (1 + overage / 100);
  const bagsNeeded = Math.ceil(cubicFeet / bagSize);

  return [
    resultRow("Area", formatArea(area)),
    resultRow("Topsoil before overage", formatVolume(cubicFeetRaw)),
    resultRow("Topsoil with overage", formatVolume(cubicFeet)),
    cubicYardsRow(cubicFeet),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated bag cost", `${formatCurrency(bagsNeeded * bagPrice)}`)
  ];
});

/* Retaining Wall Calculator */
bindCalculator("wall-form", "wallResults", () => {
  const wallLength = lengthValue("wallLength");
  const wallHeight = lengthValue("wallHeight");
  const blockLength = depthValue("blockLength");
  const blockHeight = depthValue("blockHeight");
  const blockPrice = value("blockPrice");
  const capLength = depthValue("capLength");
  const capPrice = value("capPrice");
  const gravelWidth = lengthValue("wallGravelWidth");
  const gravelDepth = depthValue("wallGravelDepth");
  const gravelHeight = lengthValue("wallGravelHeight");
  const overage = value("wallOverage");

  if (isInvalid([wallLength, wallHeight, blockLength, blockHeight, blockPrice, capLength, capPrice, gravelWidth, gravelDepth, gravelHeight, overage]) || blockLength === 0 || blockHeight === 0 || capLength === 0) return null;

  const blocksPerCourse = Math.ceil((wallLength * 12) / blockLength);
  const courses = Math.ceil((wallHeight * 12) / blockHeight);
  const rawBlocks = blocksPerCourse * courses;
  const blocksNeeded = Math.ceil(rawBlocks * (1 + overage / 100));
  const capsNeeded = Math.ceil(((wallLength * 12) / capLength) * (1 + overage / 100));

  const gravelCubicFeet = wallLength * gravelWidth * gravelHeight;
  const baseCubicFeet = wallLength * gravelWidth * (gravelDepth / 12);
  const totalGravelCubicFeet = gravelCubicFeet + baseCubicFeet;

  return [
    resultRow("Blocks per course", `${blocksPerCourse}`),
    resultRow("Courses high", `${courses}`),
    resultRow("Wall blocks to buy", `${blocksNeeded}`),
    resultRow("Cap blocks to buy", `${capsNeeded}`),
    resultRow("Estimated block cost", `${formatCurrency((blocksNeeded * blockPrice) + (capsNeeded * capPrice))}`),
    resultRow("Drainage/backfill gravel", formatVolumeCombined(totalGravelCubicFeet))
  ];
});

/* Fire Pit Gravel Calculator */
bindCalculator("firepit-form", "firePitResults", () => {
  const outerDiameter = lengthValue("fireOuterDiameter");
  const innerDiameter = lengthValue("fireInnerDiameter");
  const depth = depthValue("fireGravelDepth");
  const density = value("fireGravelDensity");
  const bagWeight = value("fireBagWeight");
  const bagPrice = value("fireBagPrice");
  const overage = value("fireOverage");

  if (isInvalid([outerDiameter, innerDiameter, depth, density, bagWeight, bagPrice, overage]) || density === 0 || bagWeight === 0 || innerDiameter >= outerDiameter) return null;

  const area = circleArea(outerDiameter) - circleArea(innerDiameter);
  const cubicFeet = area * (depth / 12) * (1 + overage / 100);
  const pounds = cubicFeet * density;
  const bagsNeeded = Math.ceil(pounds / bagWeight);

  return [
    resultRow("Gravel area", formatArea(area)),
    resultRow("Gravel volume", formatVolume(cubicFeet)),
    cubicYardsRow(cubicFeet),
    resultRow("Estimated weight", formatWeight(pounds)),
    largeWeightRow(pounds),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated bag cost", `${formatCurrency(bagsNeeded * bagPrice)}`)
  ];
});

/* Fence Cost Calculator */
bindCalculator("fence-form", "fenceResults", () => {
  const fenceLength = lengthValue("fenceLength");
  const postSpacing = lengthValue("postSpacing");
  const panelWidth = lengthValue("panelWidth");
  const panelPrice = value("panelPrice");
  const postPrice = value("postPrice");
  const gateCount = intValue("gateCount");
  const gatePrice = value("gatePrice");
  const railCount = value("railCount");
  const railLength = lengthValue("railLength");
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
    return null;
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

  return [
    resultRow("Fence length", formatLinearLength(fenceLength)),
    resultRow("Posts needed", `${postCount}`),
    resultRow("Panels needed", `${panelCount}`),
    resultRow("Rail pieces needed", `${railPieces}`),
    resultRow("Pickets needed", `${picketCount}`),
    resultRow("Concrete bags", `${concreteBags}`),
    resultRow("Gate cost", `${formatCurrency(gateCost)}`),
    resultRow("Estimated material cost", `${formatCurrency(materialCost)}`)
  ];
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
