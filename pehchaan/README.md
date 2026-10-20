# Pehchaan

Early diabetes risk screening without a lab test. Six questions, an explainable model, English and Urdu, and nothing leaves the browser.

Built for the UnivaBio 2026 hackathon (theme: Artificial Intelligence for Human Health).

## The problem

A large share of people with type 2 diabetes do not know they have it, and the gap is widest where lab visits cost time and money. Most online "diabetes risk" tools either ask for a blood glucose value the user does not have, or give a number with no explanation and no honesty about who the model was built for.

Pehchaan ("recognition" in Urdu) answers one practical question: should this person get a blood test now? It uses only information a person already knows, explains which answers drove the result, and says plainly where the model is weak.

## What it does

1. Questionnaire: sex, age, height and weight (BMI computed live), pregnancies, diastolic blood pressure (optional) and family history.
2. Result: above or below a screening threshold, a model score, the user's percentile among study participants, and plain-language next steps.
3. Explanation: a bar per factor showing how much it raised or lowered the score compared with an average study participant.
4. What-if slider: how the score moves if weight changes, labelled as a data pattern, not a promise.
5. Lab result checker: if the user already has a fasting, OGTT, HbA1c or random glucose value, it is classified with American Diabetes Association cut-offs. This part is rule-based and kept separate from the model on purpose.
6. Model card inside the app: data source, test-set metrics with confidence intervals, ROC and calibration plots, and four stated limitations.
7. Printable summary to take to a clinic, a full Urdu interface with right-to-left layout, dark and light themes, and offline operation once loaded.

## How it was built

| Layer | Choice | Reason |
|---|---|---|
| Data | Pima Indians Diabetes Database, 768 women | Public, clinically measured, widely used as a benchmark |
| Features | Pregnancies, diastolic BP, BMI, family-history proxy, age | All answerable without a blood test |
| Model | Logistic regression (median imputation, standard scaling) | Matched random forest and gradient boosting in cross-validation, and every prediction can be decomposed exactly |
| Threshold | Highest cut-off reaching sensitivity 0.80 in 5-fold CV on the training set | Screening should favour catching cases; the test set was never used to tune it |
| Front end | Plain HTML, CSS and JavaScript | No build step, no server, runs from a USB stick or GitHub Pages |
| Verification | Node tests check the browser engine against scikit-learn to 1e-9 and every ADA boundary | The model the judges see is the model that was evaluated |

## Results on the held-out test set (192 people, 67 with diabetes)

| Metric | Value | 95% bootstrap CI |
|---|---|---|
| AUC | 0.744 | 0.672 to 0.809 |
| Sensitivity at threshold 0.27 | 0.731 | 0.625 to 0.833 |
| Specificity at threshold 0.27 | 0.584 | 0.496 to 0.672 |
| Brier score | 0.196 | |

Cross-validated AUC on the training set: logistic regression 0.743, random forest 0.737, gradient boosting 0.740. A reference model that adds plasma glucose, insulin and skin thickness reaches a test AUC of 0.824. That gap is the reason the app recommends a blood test rather than trying to replace one.

Test sensitivity (0.73) came in below the 0.80 target set on cross-validation. This is reported as is.

## Limitations

- Trained only on women of Pima heritage in Arizona. Not validated in Pakistan or South Asia, where type 2 diabetes tends to appear at lower BMI. Men get a warning.
- 35% of the study population had diabetes, so the raw score overstates absolute risk in the general population. The app shows it as a ranking and a percentile.
- The family-history question is mapped to the 25th, 50th and 75th percentiles of the original pedigree function. This is an approximation.
- Moderate accuracy. About 27% of people with diabetes in the test set scored below the threshold.
- Not a medical device and not clinically validated.

## Run it

Open `app/index.html` in any modern browser. That is all.

To serve it locally: `python3 -m http.server 8000 --directory app`, then open `http://localhost:8000`.

## Reproduce the model

```bash
pip install -r requirements.txt
python ml/train.py          # retrains, rewrites app/model.json, app/model.js, reports and parity vectors
node --test tests/test_risk.js
```

`ml/data/pima.csv` is included so the pipeline runs offline. Seed 42 throughout.

## Repository layout

```
app/          the web app (index.html, styles.css, app.js, risk.js, i18n.js, model.js, model.json)
ml/           training script, dataset, reports (metrics.json, evaluation.png)
tests/        Node tests and the scikit-learn parity vectors
docs/         one-page description PDF, code PDF, demo script, Devpost text
```

## Data credit

Pima Indians Diabetes Database, originally from the National Institute of Diabetes and Digestive and Kidney Diseases, distributed through the UCI Machine Learning Repository. Smith, J.W., Everhart, J.E., Dickson, W.C., Knowler, W.C., and Johannes, R.S. (1988). Using the ADAP learning algorithm to forecast the onset of diabetes mellitus. Proceedings of the Symposium on Computer Applications in Medical Care, 261 to 265.

## Licence

MIT. Author: Muhammad Taqui.
