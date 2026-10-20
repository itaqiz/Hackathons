/* Pehchaan UI: reads the form, calls the risk engine, renders the result. */
(function () {
  "use strict";

  const MODEL = window.PEHCHAAN_MODEL;
  const RISK = window.PehchaanRisk;
  const I18N = window.PEHCHAAN_I18N;
  const $ = (id) => document.getElementById(id);

  let lang = "en";
  let lastInput = null; // last valid questionnaire answers, reused on language change

  // ---------- language ----------
  function t(key, vars) {
    let s = I18N[lang][key] ?? I18N.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split("{" + k + "}").join(v);
    return s;
  }

  function fmt(x, digits) {
    return Number(x).toFixed(digits);
  }

  function applyLanguage() {
    document.documentElement.lang = lang;
    document.documentElement.dir = I18N[lang].dir;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    renderModelCard();
    if (lastInput) renderResult(lastInput);
    const rv = $("readingOut");
    if (rv.dataset.cat) rv.textContent = t("cat_" + rv.dataset.cat);
  }

  // ---------- model card ----------
  function renderModelCard() {
    const m = MODEL.test_metrics;
    $("howBody").textContent = t("how_body", {
      n: MODEL.dataset.n_total,
      auc: fmt(m.auc, 2),
      auc_lo: fmt(m.ci95.auc[0], 2),
      auc_hi: fmt(m.ci95.auc[1], 2),
      sens: fmt(m.sensitivity, 2),
      spec: fmt(m.specificity, 2),
      ref: fmt(MODEL.reference_auc_with_glucose, 2),
    });
    $("lim1").textContent = t("limit_1");
    $("lim2").textContent = t("limit_2", { prev: Math.round(MODEL.dataset.prevalence * 100) });
    $("lim3").textContent = t("limit_3");
    $("lim4").textContent = t("limit_4", { miss: Math.round((1 - m.sensitivity) * 100) });
  }

  // ---------- form ----------
  function num(id) {
    const v = $(id).value.trim();
    return v === "" ? NaN : Number(v);
  }

  function sex() {
    return document.querySelector('input[name="sex"]:checked').value;
  }

  function updateBmi() {
    const h = num("height"), w = num("weight");
    $("bmiOut").textContent = h > 0 && w > 0 ? fmt(RISK.bmi(h, w), 1) : "–";
  }

  function readForm() {
    const checks = [
      ["age", 18, 110], ["height", 120, 220], ["weight", 30, 250],
    ];
    if (sex() === "female") checks.push(["preg", 0, 20]);
    if (!$("bpUnknown").checked && $("bp").value.trim() !== "") checks.push(["bp", 40, 140]);

    for (const [id, a, b] of checks) {
      const v = num(id);
      if (!(v >= a && v <= b)) {
        if (id === "age" && v < 18 && v > 0) return { error: t("err_adult"), field: id };
        return { error: t("err_range", { a, b }), field: id };
      }
    }
    const family = document.querySelector('input[name="family"]:checked').value;
    return {
      sex: sex(),
      age: num("age"),
      height: num("height"),
      weight: num("weight"),
      pregnancies: sex() === "female" ? num("preg") : 0,
      bp: $("bpUnknown").checked || $("bp").value.trim() === "" ? null : num("bp"),
      family: family,
    };
  }

  /** Maps questionnaire answers onto the model's five features. */
  function toFeatures(a, weightOverride) {
    return {
      Pregnancies: a.pregnancies,
      BloodPressure: a.bp,
      BMI: RISK.bmi(a.height, weightOverride ?? a.weight),
      DiabetesPedigreeFunction: MODEL.family_history_dpf[a.family],
      Age: a.age,
    };
  }

  function warningsFor(a, f) {
    const r = MODEL.training_ranges;
    const w = [];
    if (a.sex === "male") w.push(t("warn_male"));
    if (a.age < r.Age[0] || a.age > r.Age[1]) w.push(t("warn_age"));
    if (f.BMI < r.BMI[0] || f.BMI > r.BMI[1]) w.push(t("warn_bmi"));
    if (a.bp !== null && (a.bp < r.BloodPressure[0] || a.bp > r.BloodPressure[1])) w.push(t("warn_bp"));
    return w;
  }

  // ---------- result ----------
  function renderResult(a) {
    const f = toFeatures(a);
    const res = RISK.score(MODEL, f);
    const high = res.aboveThreshold;

    const tier = $("tier");
    tier.className = "tier " + (high ? "high" : "low");
    tier.textContent = t(high ? "tier_high" : "tier_low");
    $("tierMsg").textContent = t(high ? "tier_high_msg" : "tier_low_msg");

    $("gaugeFill").style.width = (res.probability * 100).toFixed(1) + "%";
    $("gaugeThr").style.left = (MODEL.threshold * 100).toFixed(1) + "%";
    $("scoreOut").textContent = fmt(res.probability, 2);
    $("pctOut").textContent = t("percentile_tpl", { p: RISK.percentile(MODEL, res.probability) });

    const warn = $("warnings");
    warn.replaceChildren(...warningsFor(a, f).map((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      return li;
    }));

    renderBars(res);
    setupWhatIf(a);
    buildPrintSummary(a, f, res);
  }

  function renderBars(res) {
    const entries = Object.entries(res.contributions).sort((x, y) => Math.abs(y[1]) - Math.abs(x[1]));
    const maxAbs = Math.max(0.5, ...entries.map(([, v]) => Math.abs(v)));
    const rows = entries.map(([feat, v]) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      const label = document.createElement("span");
      label.textContent = t("feat_" + feat);
      const track = document.createElement("div");
      track.className = "bar-track";
      track.title = (v >= 0 ? "+" : "") + v.toFixed(2) + " log-odds";
      const bar = document.createElement("div");
      bar.className = "bar " + (v >= 0 ? "up" : "down");
      bar.style.width = ((Math.abs(v) / maxAbs) * 50).toFixed(1) + "%";
      track.appendChild(bar);
      row.append(label, track);
      if (res.imputed.includes(feat)) {
        const note = document.createElement("span");
        note.className = "bar-note";
        note.textContent = t("imputed");
        row.appendChild(note);
      }
      return row;
    });
    $("bars").replaceChildren(...rows);
  }

  function setupWhatIf(a) {
    const s = $("whatIf");
    const lo = Math.max(30, Math.round(a.weight - 20));
    const hi = Math.round(a.weight + 10);
    s.min = lo; s.max = hi;
    if (!s.dataset.touched || Number(s.value) < lo || Number(s.value) > hi) s.value = Math.round(a.weight - 5);
    updateWhatIf();
  }

  function updateWhatIf() {
    if (!lastInput) return;
    const w = Number($("whatIf").value);
    const f = toFeatures(lastInput, w);
    const p = RISK.score(MODEL, f).probability;
    $("whatIfOut").textContent = t("whatif_tpl", { w: w, b: fmt(f.BMI, 1), s: fmt(p, 2) });
  }

  function buildPrintSummary(a, f, res) {
    const root = $("printSummary");
    root.replaceChildren();
    const h = document.createElement("h1");
    h.textContent = t("summary_title");
    const p1 = document.createElement("p");
    p1.textContent = t(res.aboveThreshold ? "tier_high" : "tier_low") + ". " + t(res.aboveThreshold ? "tier_high_msg" : "tier_low_msg");
    const table = document.createElement("table");
    const rows = [
      [t("sex"), t(a.sex)],
      [t("age"), a.age],
      [t("height"), a.height],
      [t("weight"), a.weight],
      [t("bmi_label"), fmt(f.BMI, 1)],
      [t("pregnancies"), a.sex === "female" ? a.pregnancies : "–"],
      [t("bp"), a.bp ?? t("unknown")],
      [t("family"), t("fam_" + a.family)],
      [t("score"), fmt(res.probability, 2) + " (" + t("threshold_lbl") + " " + MODEL.threshold + ")"],
    ];
    for (const [k, v] of rows) {
      const tr = table.insertRow();
      tr.insertCell().textContent = k;
      tr.insertCell().textContent = String(v);
    }
    const p2 = document.createElement("p");
    p2.textContent = t("disclaimer");
    const p3 = document.createElement("p");
    p3.textContent = new Date().toLocaleDateString(lang === "ur" ? "ur-PK" : "en-GB");
    root.append(h, p1, table, p2, p3);
  }

  // ---------- reading check ----------
  function updateReadingFields() {
    const type = $("readingType").value;
    $("unitField").hidden = type === "hba1c";
    $("symptomField").hidden = type !== "random";
  }

  // ---------- wiring ----------
  $("riskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const a = readForm();
    const err = $("formError");
    if (a.error) {
      err.textContent = a.error;
      err.hidden = false;
      $(a.field).focus();
      return;
    }
    err.hidden = true;
    lastInput = a;
    $("resultCard").hidden = false;
    renderResult(a);
    if (window.matchMedia("(max-width: 720px)").matches) $("resultCard").scrollIntoView({ behavior: "smooth" });
  });

  $("riskForm").addEventListener("reset", () => {
    lastInput = null;
    $("resultCard").hidden = true;
    $("formError").hidden = true;
    $("whatIf").dataset.touched = "";
    setTimeout(() => { updateBmi(); syncSex(); syncBp(); }, 0);
  });

  ["height", "weight"].forEach((id) => $(id).addEventListener("input", updateBmi));

  function syncSex() {
    $("pregField").hidden = sex() === "male";
  }
  document.querySelectorAll('input[name="sex"]').forEach((r) => r.addEventListener("change", syncSex));

  function syncBp() {
    $("bp").disabled = $("bpUnknown").checked;
  }
  $("bpUnknown").addEventListener("change", syncBp);

  $("whatIf").addEventListener("input", () => {
    $("whatIf").dataset.touched = "1";
    updateWhatIf();
  });

  $("readingType").addEventListener("change", updateReadingFields);
  $("readingForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = Number($("readingValue").value);
    const out = $("readingOut");
    const type = $("readingType").value;
    const limits = type === "hba1c" ? [3, 20] : $("readingUnit").value === "mmol" ? [1, 40] : [20, 700];
    if (!(v >= limits[0] && v <= limits[1])) {
      out.className = "reading-out";
      out.dataset.cat = "";
      out.textContent = t("err_range", { a: limits[0], b: limits[1] });
      return;
    }
    const cat = RISK.classifyReading(type, v, $("readingUnit").value, $("symptoms").checked);
    out.className = "reading-out " + cat;
    out.dataset.cat = cat;
    out.textContent = t("cat_" + cat);
  });

  $("langBtn").addEventListener("click", () => {
    lang = lang === "en" ? "ur" : "en";
    applyLanguage();
  });

  $("themeBtn").addEventListener("click", () => {
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  });

  $("printBtn").addEventListener("click", () => window.print());

  updateReadingFields();
  syncSex();
  applyLanguage();
})();
