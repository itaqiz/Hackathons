/*
 * Pehchaan risk engine.
 * Pure functions, no DOM access, so the same file runs in the browser and in Node tests.
 */
(function (root) {
  "use strict";

  function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  function isMissing(v) {
    return v === null || v === undefined || Number.isNaN(v);
  }

  /**
   * Reproduces the scikit-learn pipeline: median imputation -> standard scaling -> logistic regression.
   * Each feature's contribution is coef * standardized value, i.e. how far it pushes the
   * log-odds away from an average study participant.
   */
  function score(model, input) {
    let z = model.intercept;
    const contributions = {};
    const imputed = [];
    for (const f of model.features) {
      let v = input[f];
      if (isMissing(v)) {
        v = model.medians[f];
        imputed.push(f);
      }
      const standardized = (v - model.means[f]) / model.scales[f];
      const c = model.coefficients[f] * standardized;
      contributions[f] = c;
      z += c;
    }
    const probability = sigmoid(z);
    return {
      probability: probability,
      logit: z,
      contributions: contributions,
      imputed: imputed,
      aboveThreshold: probability >= model.threshold,
    };
  }

  /** Share (0-100) of training participants whose score is below this one. */
  function percentile(model, probability) {
    const q = model.train_score_quantiles;
    let i = 0;
    while (i < q.length - 1 && q[i + 1] <= probability) i++;
    return i;
  }

  function bmi(heightCm, weightKg) {
    const m = heightCm / 100;
    return weightKg / (m * m);
  }

  const MGDL_PER_MMOL = 18.0;

  /**
   * Classifies a lab reading using American Diabetes Association diagnostic cut-offs.
   * Rule-based on purpose: this is not part of the learned model.
   * Returns one of: normal, prediabetes, diabetes, random_low, random_high_symptoms, random_high.
   */
  function classifyReading(type, value, unit, hasSymptoms) {
    if (type === "hba1c") {
      if (value >= 6.5) return "diabetes";
      if (value >= 5.7) return "prediabetes";
      return "normal";
    }
    const mgdl = unit === "mmol" ? value * MGDL_PER_MMOL : value;
    if (type === "fasting") {
      if (mgdl >= 126) return "diabetes";
      if (mgdl >= 100) return "prediabetes";
      return "normal";
    }
    if (type === "ogtt") {
      if (mgdl >= 200) return "diabetes";
      if (mgdl >= 140) return "prediabetes";
      return "normal";
    }
    if (type === "random") {
      if (mgdl < 200) return "random_low";
      return hasSymptoms ? "random_high_symptoms" : "random_high";
    }
    throw new Error("Unknown reading type: " + type);
  }

  const api = { score: score, percentile: percentile, bmi: bmi, classifyReading: classifyReading };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PehchaanRisk = api;
})(this);
