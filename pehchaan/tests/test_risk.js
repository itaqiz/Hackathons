// Run with: node --test tests/
// 1. The browser engine must reproduce scikit-learn's probabilities.
// 2. The rule-based lab check must follow ADA cut-offs at every boundary.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const risk = require(path.join(__dirname, "..", "app", "risk.js"));
const model = require(path.join(__dirname, "..", "app", "model.json"));
const vectors = require(path.join(__dirname, "parity_vectors.json"));

test("JS engine matches scikit-learn on held-out rows", () => {
  for (const v of vectors) {
    const got = risk.score(model, v.input).probability;
    assert.ok(Math.abs(got - v.expected) < 1e-9, `expected ${v.expected}, got ${got}`);
  }
});

test("missing blood pressure is imputed with the training median", () => {
  const base = { Pregnancies: 2, BMI: 30, DiabetesPedigreeFunction: 0.4, Age: 40 };
  const a = risk.score(model, { ...base, BloodPressure: null });
  const b = risk.score(model, { ...base, BloodPressure: model.medians.BloodPressure });
  assert.equal(a.probability, b.probability);
  assert.deepEqual(a.imputed, ["BloodPressure"]);
});

test("contributions sum to the logit", () => {
  const r = risk.score(model, { Pregnancies: 4, BloodPressure: 80, BMI: 35, DiabetesPedigreeFunction: 0.6, Age: 50 });
  const sum = Object.values(r.contributions).reduce((s, x) => s + x, model.intercept);
  assert.ok(Math.abs(sum - r.logit) < 1e-12);
});

test("higher BMI never lowers the score", () => {
  const base = { Pregnancies: 1, BloodPressure: 70, DiabetesPedigreeFunction: 0.3, Age: 35 };
  let prev = 0;
  for (let bmi = 18; bmi <= 60; bmi += 2) {
    const p = risk.score(model, { ...base, BMI: bmi }).probability;
    assert.ok(p >= prev);
    prev = p;
  }
});

test("percentile stays within 0..100", () => {
  assert.equal(risk.percentile(model, 0), 0);
  assert.equal(risk.percentile(model, 1), 100);
});

test("BMI formula", () => {
  assert.ok(Math.abs(risk.bmi(170, 72.25) - 25) < 1e-9);
});

test("ADA cut-offs at their boundaries", () => {
  const c = risk.classifyReading;
  assert.equal(c("fasting", 99, "mgdl"), "normal");
  assert.equal(c("fasting", 100, "mgdl"), "prediabetes");
  assert.equal(c("fasting", 125, "mgdl"), "prediabetes");
  assert.equal(c("fasting", 126, "mgdl"), "diabetes");
  assert.equal(c("fasting", 7.0, "mmol"), "diabetes");
  assert.equal(c("ogtt", 139, "mgdl"), "normal");
  assert.equal(c("ogtt", 140, "mgdl"), "prediabetes");
  assert.equal(c("ogtt", 200, "mgdl"), "diabetes");
  assert.equal(c("hba1c", 5.6), "normal");
  assert.equal(c("hba1c", 5.7), "prediabetes");
  assert.equal(c("hba1c", 6.5), "diabetes");
  assert.equal(c("random", 180, "mgdl", true), "random_low");
  assert.equal(c("random", 210, "mgdl", false), "random_high");
  assert.equal(c("random", 210, "mgdl", true), "random_high_symptoms");
});
