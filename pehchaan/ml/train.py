"""Train Pehchaan's no-lab diabetes risk model and export it for the browser.

Pipeline
  1. Load the Pima Indians Diabetes dataset (768 women, age 21+).
  2. Treat physiologically impossible zeros as missing values.
  3. Hold out 25% as a test set that is touched exactly once.
  4. Compare candidate models with 5-fold cross-validation on the training set.
  5. Pick the screening threshold on cross-validated training predictions
     (target sensitivity >= 0.80), never on the test set.
  6. Fit the final no-lab logistic regression, evaluate on the test set with
     bootstrap confidence intervals, and export everything the browser needs.

Run:  python ml/train.py
"""
from __future__ import annotations

import json
import pathlib

import numpy as np
import pandas as pd
from sklearn.calibration import calibration_curve
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss, roc_auc_score, roc_curve
from sklearn.model_selection import StratifiedKFold, cross_val_predict, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

SEED = 42
ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "ml" / "data" / "pima.csv"
REPORTS = ROOT / "ml" / "reports"
APP = ROOT / "app"
TESTS = ROOT / "tests"

COLUMNS = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome",
]
# Features a person can answer at home, without any blood test.
NO_LAB = ["Pregnancies", "BloodPressure", "BMI", "DiabetesPedigreeFunction", "Age"]
# All eight features, used only as a reference point in the report.
FULL = NO_LAB + ["Glucose", "SkinThickness", "Insulin"]
# A recorded value of 0 is impossible for these, so it means "not measured".
ZERO_IS_MISSING = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
TARGET_SENSITIVITY = 0.80


def load() -> pd.DataFrame:
    df = pd.read_csv(DATA, header=None, names=COLUMNS)
    df[ZERO_IS_MISSING] = df[ZERO_IS_MISSING].replace(0, np.nan)
    return df


def logreg() -> Pipeline:
    return Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
        ("model", LogisticRegression(max_iter=1000)),
    ])


def candidates() -> dict[str, tuple[Pipeline, list[str]]]:
    rf = Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("model", RandomForestClassifier(n_estimators=400, min_samples_leaf=5, random_state=SEED)),
    ])
    gb = Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("model", HistGradientBoostingClassifier(max_depth=3, learning_rate=0.05, random_state=SEED)),
    ])
    return {
        "Logistic regression, no-lab (deployed)": (logreg(), NO_LAB),
        "Random forest, no-lab": (rf, NO_LAB),
        "Gradient boosting, no-lab": (gb, NO_LAB),
        "Logistic regression, all 8 features incl. glucose (reference)": (logreg(), FULL),
    }


def sens_spec(y: np.ndarray, p: np.ndarray, thr: float) -> tuple[float, float]:
    pred = p >= thr
    sens = (pred & (y == 1)).sum() / (y == 1).sum()
    spec = (~pred & (y == 0)).sum() / (y == 0).sum()
    return float(sens), float(spec)


def pick_threshold(y: np.ndarray, p: np.ndarray, target: float) -> float:
    """Highest threshold whose sensitivity still meets the target."""
    for thr in np.round(np.arange(0.95, 0.0, -0.005), 3):
        if sens_spec(y, p, thr)[0] >= target:
            return float(thr)
    return 0.0


def bootstrap_ci(y, p, thr, n=2000):
    rng = np.random.default_rng(SEED)
    stats = {"auc": [], "sensitivity": [], "specificity": []}
    for _ in range(n):
        idx = rng.integers(0, len(y), len(y))
        yb, pb = y[idx], p[idx]
        if yb.min() == yb.max():
            continue
        stats["auc"].append(roc_auc_score(yb, pb))
        s, sp = sens_spec(yb, pb, thr)
        stats["sensitivity"].append(s)
        stats["specificity"].append(sp)
    return {k: [float(np.percentile(v, 2.5)), float(np.percentile(v, 97.5))] for k, v in stats.items()}


def main() -> None:
    REPORTS.mkdir(parents=True, exist_ok=True)
    df = load()
    train, test = train_test_split(df, test_size=0.25, stratify=df["Outcome"], random_state=SEED)
    y_tr, y_te = train["Outcome"].to_numpy(), test["Outcome"].to_numpy()
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)

    # Step 4: model comparison on training folds only.
    comparison = []
    for name, (pipe, feats) in candidates().items():
        p = cross_val_predict(pipe, train[feats], y_tr, cv=cv, method="predict_proba")[:, 1]
        comparison.append({"model": name, "cv_auc": round(float(roc_auc_score(y_tr, p)), 3),
                           "cv_brier": round(float(brier_score_loss(y_tr, p)), 3)})
        print(f"{name:<66} CV AUC {comparison[-1]['cv_auc']:.3f}")

    # Step 5: threshold from cross-validated training predictions.
    final = logreg()
    p_cv = cross_val_predict(final, train[NO_LAB], y_tr, cv=cv, method="predict_proba")[:, 1]
    thr = pick_threshold(y_tr, p_cv, TARGET_SENSITIVITY)

    # Step 6: fit once, test once.
    final.fit(train[NO_LAB], y_tr)
    p_te = final.predict_proba(test[NO_LAB])[:, 1]
    sens, spec = sens_spec(y_te, p_te, thr)
    test_metrics = {
        "auc": round(float(roc_auc_score(y_te, p_te)), 3),
        "brier": round(float(brier_score_loss(y_te, p_te)), 3),
        "sensitivity": round(sens, 3),
        "specificity": round(spec, 3),
        "ci95": {k: [round(a, 3), round(b, 3)] for k, (a, b) in bootstrap_ci(y_te, p_te, thr).items()},
        "n_test": int(len(y_te)),
        "positives_test": int(y_te.sum()),
    }
    full_ref = logreg().fit(train[FULL], y_tr)
    ref_auc = round(float(roc_auc_score(y_te, full_ref.predict_proba(test[FULL])[:, 1])), 3)

    imp, sc, lr = final.named_steps["impute"], final.named_steps["scale"], final.named_steps["model"]
    p_train = final.predict_proba(train[NO_LAB])[:, 1]
    dpf = train["DiabetesPedigreeFunction"]

    model = {
        "name": "Pehchaan no-lab diabetes risk model",
        "version": "1.0.0",
        "features": NO_LAB,
        "medians": dict(zip(NO_LAB, map(float, imp.statistics_))),
        "means": dict(zip(NO_LAB, map(float, sc.mean_))),
        "scales": dict(zip(NO_LAB, map(float, sc.scale_))),
        "coefficients": dict(zip(NO_LAB, map(float, lr.coef_[0]))),
        "intercept": float(lr.intercept_[0]),
        "threshold": thr,
        "threshold_rule": f"Highest cut-off reaching sensitivity >= {TARGET_SENSITIVITY} on 5-fold CV of the training set",
        # Score distribution of the training population, for percentile display.
        "train_score_quantiles": [float(q) for q in np.quantile(p_train, np.linspace(0, 1, 101))],
        # Approximate mapping from a family-history question to the pedigree function.
        "family_history_dpf": {
            "none": float(dpf.quantile(0.25)),
            "one": float(dpf.quantile(0.50)),
            "multiple": float(dpf.quantile(0.75)),
        },
        "training_ranges": {f: [float(train[f].min()), float(train[f].max())] for f in NO_LAB},
        "dataset": {
            "name": "Pima Indians Diabetes Database (NIDDK, via UCI)",
            "n_total": int(len(df)),
            "prevalence": round(float(df["Outcome"].mean()), 3),
            "population": "Women of Pima heritage, age 21+, Arizona, USA",
        },
        "test_metrics": test_metrics,
        "reference_auc_with_glucose": ref_auc,
        "cv_comparison": comparison,
    }
    (APP / "model.json").write_text(json.dumps(model, indent=2))
    # Same data as a script, so the app also works when opened straight from disk.
    (APP / "model.js").write_text("window.PEHCHAAN_MODEL = " + json.dumps(model) + ";\n")
    (REPORTS / "metrics.json").write_text(json.dumps(
        {"test_metrics": test_metrics, "threshold": thr,
         "reference_auc_with_glucose": ref_auc, "cv_comparison": comparison}, indent=2))

    # Parity vectors: the browser must reproduce these probabilities exactly.
    sample = test[NO_LAB].head(25)
    vectors = [{"input": {k: (None if pd.isna(v) else float(v)) for k, v in row.items()},
                "expected": float(prob)}
               for (_, row), prob in zip(sample.iterrows(), final.predict_proba(sample)[:, 1])]
    (TESTS / "parity_vectors.json").write_text(json.dumps(vectors, indent=2))

    plot(y_te, p_te, thr, sens, test_metrics["auc"], full_ref.predict_proba(test[FULL])[:, 1], ref_auc)
    print(json.dumps(test_metrics, indent=2))
    print("threshold", thr, "| reference AUC with glucose", ref_auc)


def plot(y, p, thr, sens, auc, p_ref, ref_auc) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    navy, cyan, grey = "#0B1F3B", "#00A3D9", "#9AA4B2"
    fig, axes = plt.subplots(1, 2, figsize=(10, 4.2))

    fpr, tpr, _ = roc_curve(y, p)
    fr, tr_, _ = roc_curve(y, p_ref)
    ax = axes[0]
    ax.plot(fpr, tpr, color=navy, lw=2, label=f"No-lab model (AUC {auc:.2f})")
    ax.plot(fr, tr_, color=cyan, lw=1.5, ls="--", label=f"With glucose, reference (AUC {ref_auc:.2f})")
    ax.plot([0, 1], [0, 1], color=grey, lw=1, ls=":")
    s, sp = sens_spec(y, p, thr)
    ax.scatter([1 - sp], [s], color=navy, zorder=3, label=f"Screening cut-off {thr:.3f}")
    ax.set(xlabel="False positive rate", ylabel="True positive rate", title="ROC, held-out test set")
    ax.legend(loc="lower right", fontsize=8, frameon=False)

    ax = axes[1]
    frac, mean = calibration_curve(y, p, n_bins=6, strategy="quantile")
    ax.plot(mean, frac, marker="o", color=navy, lw=2, label="No-lab model")
    ax.plot([0, 1], [0, 1], color=grey, lw=1, ls=":", label="Perfect calibration")
    ax.set(xlabel="Predicted probability", ylabel="Observed fraction with diabetes",
           title="Calibration, held-out test set")
    ax.legend(loc="upper left", fontsize=8, frameon=False)
    for a in axes:
        a.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    fig.savefig(REPORTS / "evaluation.png", dpi=160)
    fig.savefig(APP / "evaluation.png", dpi=110)


if __name__ == "__main__":
    main()
