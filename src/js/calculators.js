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
 * Bagged-vs-bulk cost comparison bar chart. `bulkCost` comes from an
 * optional "bulk price" field — if the user left it blank or at 0, skip
 * the comparison entirely rather than showing a misleading $0 bulk cost.
 */
function costComparisonBlock(baggedCost, bulkCost) {
  if (!(bulkCost > 0) || !(baggedCost > 0)) return null;

  const max = Math.max(baggedCost, bulkCost);
  const baggedPct = (baggedCost / max) * 100;
  const bulkPct = (bulkCost / max) * 100;
  const bulkCheaper = bulkCost < baggedCost;
  const diff = Math.abs(baggedCost - bulkCost);
  const note = diff < 0.01
    ? "Bagged and bulk cost about the same for this amount."
    : bulkCheaper
      ? `Buying in bulk saves about ${formatCurrency(diff)} for this amount.`
      : `Bagged costs about ${formatCurrency(diff)} less for this amount.`;

  return `
    <div class="cost-compare">
      <p class="cost-compare-title">Bagged vs. bulk</p>
      <div class="cost-compare-row">
        <span class="cost-compare-label">Bagged</span>
        <div class="cost-compare-track"><div class="cost-compare-bar${!bulkCheaper ? " is-best" : ""}" style="width:${baggedPct}%"></div></div>
        <span class="cost-compare-value">${formatCurrency(baggedCost)}</span>
      </div>
      <div class="cost-compare-row">
        <span class="cost-compare-label">Bulk</span>
        <div class="cost-compare-track"><div class="cost-compare-bar${bulkCheaper ? " is-best" : ""}" style="width:${bulkPct}%"></div></div>
        <span class="cost-compare-value">${formatCurrency(bulkCost)}</span>
      </div>
      <p class="cost-compare-note">${note}</p>
    </div>
  `;
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

/* ---- Live scaling diagrams ---- */
const DIAGRAM_W = 300;
const DIAGRAM_H = 170;
const DIAGRAM_PAD = 20;

function numOrPlaceholder(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  const raw = parseFloat(el.value);
  if (!Number.isNaN(raw)) return raw;
  return parseFloat(el.placeholder);
}

function lengthOrPlaceholder(id) {
  const raw = numOrPlaceholder(id);
  return Number.isNaN(raw) ? NaN : (isMetric() ? raw / FT_TO_M : raw);
}

function depthOrPlaceholder(id) {
  const raw = numOrPlaceholder(id);
  return Number.isNaN(raw) ? NaN : (isMetric() ? raw / IN_TO_CM : raw);
}

function clearDiagram(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = "";
}

function diagramSvg(inner) {
  return `<svg viewBox="0 0 ${DIAGRAM_W} ${DIAGRAM_H}" class="diagram-svg" role="img" aria-hidden="true">${inner}</svg>`;
}

/*
 * The height label sits to the left of the rect (text-anchor="end", so it
 * grows leftward from its anchor point). Reserve a fixed left margin wide
 * enough for that label regardless of aspect ratio — for a very elongated
 * shape (e.g. a long, short retaining wall) the rect's own left edge can
 * otherwise land close enough to x=0 that the label text runs off the
 * left of the SVG canvas.
 */
const DIAGRAM_PAD_LEFT = 54;

function fitRect(wReal, hReal) {
  const maxW = DIAGRAM_W - DIAGRAM_PAD_LEFT - DIAGRAM_PAD;
  const maxH = DIAGRAM_H - DIAGRAM_PAD * 2 - 16;
  const scale = Math.min(maxW / wReal, maxH / hReal);
  const w = wReal * scale;
  const h = hReal * scale;
  return { x: DIAGRAM_PAD_LEFT + (maxW - w) / 2, y: (DIAGRAM_H - h) / 2 + 10, w, h };
}

function drawRectDiagram(containerId, wReal, hReal, wLabel, hLabel, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!(wReal > 0) || !(hReal > 0)) return clearDiagram(containerId);

  const { x, y, w, h } = fitRect(wReal, hReal);
  let inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="var(--accent)" fill-opacity="0.16" stroke="var(--accent)" stroke-width="2"/>`;

  const cols = Math.min(Math.round(opts.cols) || 1, 14);
  const rows = Math.min(Math.round(opts.rows) || 1, 10);
  for (let c = 1; c < cols; c++) {
    const gx = x + (w / cols) * c;
    inner += `<line x1="${gx}" y1="${y}" x2="${gx}" y2="${y + h}" stroke="var(--accent)" stroke-opacity="0.35" stroke-width="1"/>`;
  }
  for (let r = 1; r < rows; r++) {
    const gy = y + (h / rows) * r;
    inner += `<line x1="${x}" y1="${gy}" x2="${x + w}" y2="${gy}" stroke="var(--accent)" stroke-opacity="0.35" stroke-width="1"/>`;
  }

  inner += `<text x="${x + w / 2}" y="${y - 8}" text-anchor="middle" class="diagram-label">${wLabel}</text>`;
  inner += `<text x="${x - 8}" y="${y + h / 2}" text-anchor="end" dominant-baseline="middle" class="diagram-label">${hLabel}</text>`;

  container.innerHTML = diagramSvg(inner);
}

function drawRingDiagram(containerId, outerDiameter, innerDiameter, label) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!(outerDiameter > 0)) return clearDiagram(containerId);

  const maxD = Math.min(DIAGRAM_W, DIAGRAM_H) - DIAGRAM_PAD * 2;
  const scale = maxD / outerDiameter;
  const outerR = (outerDiameter * scale) / 2;
  const innerR = Math.max(0, innerDiameter * scale) / 2;
  const cx = DIAGRAM_W / 2;
  const cy = DIAGRAM_H / 2 + 6;

  let inner = `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="var(--accent)" fill-opacity="0.16" stroke="var(--accent)" stroke-width="2"/>`;
  if (innerR > 0) {
    inner += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="var(--bg)" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  }
  inner += `<text x="${cx}" y="${cy - outerR - 8}" text-anchor="middle" class="diagram-label">${label}</text>`;

  container.innerHTML = diagramSvg(inner);
}

function drawCircleCountDiagram(containerId, diameter, count, label) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!(diameter > 0) || !(count > 0)) return clearDiagram(containerId);

  const shown = Math.min(count, 8);
  const gap = 14;
  const maxCircleD = (DIAGRAM_W - DIAGRAM_PAD * 2 - gap * (shown - 1)) / shown;
  const r = Math.min(maxCircleD, DIAGRAM_H - DIAGRAM_PAD * 2 - 24) / 2;
  const totalW = shown * (r * 2) + (shown - 1) * gap;
  const startX = (DIAGRAM_W - totalW) / 2 + r;
  const cy = DIAGRAM_H / 2 + 6;

  let inner = "";
  for (let i = 0; i < shown; i++) {
    const cx = startX + i * (r * 2 + gap);
    inner += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--accent)" fill-opacity="0.16" stroke="var(--accent)" stroke-width="2"/>`;
  }
  const suffix = count > shown ? ` (+${count - shown} more)` : "";
  inner += `<text x="${DIAGRAM_W / 2}" y="${cy - r - 10}" text-anchor="middle" class="diagram-label">${label}${suffix}</text>`;

  container.innerHTML = diagramSvg(inner);
}

function drawLineDiagram(containerId, length, spacing, label) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!(length > 0)) return clearDiagram(containerId);

  const x1 = DIAGRAM_PAD + 10;
  const x2 = DIAGRAM_W - DIAGRAM_PAD - 10;
  const y = DIAGRAM_H / 2 + 6;
  const w = x2 - x1;

  const postCount = Math.max(spacing > 0 ? Math.min(Math.floor(length / spacing) + 1, 16) : 2, 2);

  let inner = `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="var(--accent)" stroke-width="2"/>`;
  for (let i = 0; i < postCount; i++) {
    const px = x1 + (w / (postCount - 1)) * i;
    inner += `<line x1="${px}" y1="${y - 12}" x2="${px}" y2="${y + 12}" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>`;
  }
  inner += `<text x="${DIAGRAM_W / 2}" y="${y - 26}" text-anchor="middle" class="diagram-label">${label}</text>`;

  container.innerHTML = diagramSvg(inner);
}

function bindDiagram(formId, draw) {
  const form = document.getElementById(formId);
  if (!form) return;
  draw();
  form.addEventListener("input", draw);
  form.addEventListener("change", draw);
  document.querySelectorAll(".unit-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTimeout(draw, 0));
  });
}

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
  animateResultValues(element);
}

/*
 * Counts each result value up from 0 instead of just snapping into place.
 * Only animates values that are a single number plus a unit suffix (e.g.
 * "$27.86", "80 sq ft", "1,833 lb") — a row like "10 ft × 10 ft slab"
 * has a second number inside the suffix and is left alone rather than
 * animating in a way that would look broken.
 */
function animateResultValues(container) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  container.querySelectorAll(".result-item strong").forEach((el) => {
    const text = el.textContent;
    const match = text.match(/^(\$?)([\d,]+\.?\d*)(.*)$/s);
    if (!match) return;
    const [, prefix, numStr, suffix] = match;
    if (/\d/.test(suffix)) return;

    const target = parseFloat(numStr.replace(/,/g, ""));
    if (Number.isNaN(target)) return;
    const decimals = (numStr.split(".")[1] || "").length;

    const duration = 500;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${prefix}${formatNumber(target * eased, decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = text;
    }

    requestAnimationFrame(tick);
  });
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
  const bulkPrice = value("mulchBulkPrice");

  if (isInvalid([length, width, depth, bagSize, bagPrice]) || bagSize === 0) return null;

  const squareFeet = length * width;
  const cubicFeet = squareFeet * (depth / 12);
  const cubicYards = cubicFeet / 27;
  const bagsNeeded = Math.ceil(cubicFeet / bagSize);
  const estimatedCost = bagsNeeded * bagPrice;
  const bulkCost = bulkPrice > 0 ? cubicYards * bulkPrice : 0;

  return [
    resultRow("Area", formatArea(squareFeet)),
    resultRow("Mulch needed", formatVolume(cubicFeet)),
    cubicYardsRow(cubicFeet),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated cost", `${formatCurrency(estimatedCost)}`),
    costComparisonBlock(estimatedCost, bulkCost)
  ];
});

bindDiagram("mulch-form", () => {
  const length = lengthOrPlaceholder("mulchLength");
  const width = lengthOrPlaceholder("mulchWidth");
  drawRectDiagram("mulch-form-diagram", length, width, formatLength(length), formatLength(width));
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
  const bulkPrice = value("gravelBulkPrice");

  if (isInvalid([length, width, depth, density, bagWeight, bagPrice, overage]) || density === 0 || bagWeight === 0) return null;

  const multiplier = 1 + (overage / 100);
  const squareFeet = length * width;
  const cubicFeet = squareFeet * (depth / 12) * multiplier;
  const cubicYards = cubicFeet / 27;
  const pounds = cubicFeet * density;
  const bagsNeeded = Math.ceil(pounds / bagWeight);
  const estimatedCost = bagsNeeded * bagPrice;
  const bulkCost = bulkPrice > 0 ? cubicYards * bulkPrice : 0;

  return [
    resultRow("Area", formatArea(squareFeet)),
    resultRow("Volume with overage", formatVolume(cubicFeet)),
    cubicYardsRow(cubicFeet),
    resultRow("Estimated weight", formatWeight(pounds)),
    largeWeightRow(pounds),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated bag cost", `${formatCurrency(estimatedCost)}`),
    costComparisonBlock(estimatedCost, bulkCost)
  ];
});

bindDiagram("gravel-form", () => {
  const length = lengthOrPlaceholder("gravelLength");
  const width = lengthOrPlaceholder("gravelWidth");
  drawRectDiagram("gravel-form-diagram", length, width, formatLength(length), formatLength(width));
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

bindDiagram("soil-form", () => {
  const length = lengthOrPlaceholder("soilLength");
  const width = lengthOrPlaceholder("soilWidth");
  drawRectDiagram("soil-form-diagram", length, width, formatLength(length), formatLength(width));
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

bindDiagram("paver-form", () => {
  const patioLength = lengthOrPlaceholder("patioLength");
  const patioWidth = lengthOrPlaceholder("patioWidth");
  const paverLength = depthOrPlaceholder("paverLength");
  const paverWidth = depthOrPlaceholder("paverWidth");
  let cols = 1;
  let rows = 1;
  if (paverLength > 0 && paverWidth > 0 && patioLength > 0 && patioWidth > 0) {
    cols = Math.max(1, Math.round((patioLength * 12) / paverLength));
    rows = Math.max(1, Math.round((patioWidth * 12) / paverWidth));
  }
  drawRectDiagram("paver-form-diagram", patioLength, patioWidth, formatLength(patioLength), formatLength(patioWidth), { cols, rows });
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

function drawConcreteDiagram() {
  const type = document.getElementById("concreteType")?.value;
  if (type === "footing") {
    const length = lengthOrPlaceholder("footingLength");
    const width = lengthOrPlaceholder("footingWidth");
    drawRectDiagram("concrete-form-diagram", length, width, formatLength(length), formatLength(width));
  } else if (type === "posthole") {
    const diameter = depthOrPlaceholder("holeDiameter");
    const count = parseInt(document.getElementById("holeCount")?.value, 10) || 1;
    drawCircleCountDiagram("concrete-form-diagram", diameter, count, `${count} post hole${count === 1 ? "" : "s"}`);
  } else {
    const length = lengthOrPlaceholder("slabLength");
    const width = lengthOrPlaceholder("slabWidth");
    drawRectDiagram("concrete-form-diagram", length, width, formatLength(length), formatLength(width));
  }
}

bindDiagram("concrete-form", drawConcreteDiagram);
document.getElementById("concreteType")?.addEventListener("change", drawConcreteDiagram);

/* Topsoil Calculator */
bindCalculator("topsoil-form", "topsoilResults", () => {
  const length = lengthValue("topsoilLength");
  const width = lengthValue("topsoilWidth");
  const depth = depthValue("topsoilDepth");
  const bagSize = value("topsoilBagSize");
  const bagPrice = value("topsoilBagPrice");
  const overage = value("topsoilOverage");
  const bulkPrice = value("topsoilBulkPrice");

  if (isInvalid([length, width, depth, bagSize, bagPrice, overage]) || bagSize === 0) return null;

  const area = length * width;
  const cubicFeetRaw = area * (depth / 12);
  const cubicFeet = cubicFeetRaw * (1 + overage / 100);
  const cubicYards = cubicFeet / 27;
  const bagsNeeded = Math.ceil(cubicFeet / bagSize);
  const estimatedCost = bagsNeeded * bagPrice;
  const bulkCost = bulkPrice > 0 ? cubicYards * bulkPrice : 0;

  return [
    resultRow("Area", formatArea(area)),
    resultRow("Topsoil before overage", formatVolume(cubicFeetRaw)),
    resultRow("Topsoil with overage", formatVolume(cubicFeet)),
    cubicYardsRow(cubicFeet),
    resultRow("Bags needed", `${bagsNeeded}`),
    resultRow("Estimated bag cost", `${formatCurrency(estimatedCost)}`),
    costComparisonBlock(estimatedCost, bulkCost)
  ];
});

bindDiagram("topsoil-form", () => {
  const length = lengthOrPlaceholder("topsoilLength");
  const width = lengthOrPlaceholder("topsoilWidth");
  drawRectDiagram("topsoil-form-diagram", length, width, formatLength(length), formatLength(width));
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

bindDiagram("wall-form", () => {
  const wallLength = lengthOrPlaceholder("wallLength");
  const wallHeight = lengthOrPlaceholder("wallHeight");
  const blockLength = depthOrPlaceholder("blockLength");
  const blockHeight = depthOrPlaceholder("blockHeight");
  let cols = 1;
  let rows = 1;
  if (blockLength > 0 && blockHeight > 0 && wallLength > 0 && wallHeight > 0) {
    cols = Math.max(1, Math.round((wallLength * 12) / blockLength));
    rows = Math.max(1, Math.round((wallHeight * 12) / blockHeight));
  }
  drawRectDiagram("wall-form-diagram", wallLength, wallHeight, formatLength(wallLength), formatLength(wallHeight), { cols, rows });
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

bindDiagram("firepit-form", () => {
  const outer = lengthOrPlaceholder("fireOuterDiameter");
  const inner = lengthOrPlaceholder("fireInnerDiameter");
  drawRingDiagram("firepit-form-diagram", outer, inner, `${formatLength(outer)} diameter`);
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

bindDiagram("fence-form", () => {
  const length = lengthOrPlaceholder("fenceLength");
  const spacing = lengthOrPlaceholder("postSpacing");
  drawLineDiagram("fence-form-diagram", length, spacing, formatLinearLength(length));
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
