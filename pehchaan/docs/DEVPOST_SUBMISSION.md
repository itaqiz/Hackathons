# Devpost project page text

Copy each section into the matching Devpost field.

## Project name

Pehchaan

## Elevator pitch (200 characters max)

Six questions, no lab test: an explainable, bilingual (English and Urdu) AI screen that tells you whether to get a diabetes blood test, and shows exactly why. Runs fully in your browser.

## Inspiration

Type 2 diabetes is often found late because testing needs a lab visit, and many people put that off until symptoms appear. I wanted a tool that a person could use at home, in their own language, that answers one practical question: should I get a blood test now? Most risk calculators online either need a glucose value people do not have, or return a number with no explanation. I wanted the reasoning to be visible.

## What it does

Pehchaan asks six questions anyone can answer: sex, age, height, weight, pregnancies, blood pressure (optional) and family history. It returns whether the person is above or below a screening threshold, their percentile among study participants, and a specific next step. A bar chart shows how much each answer raised or lowered the score. A weight slider shows how the score shifts with weight, labelled as a pattern in the data.

If someone already has a fasting, OGTT, HbA1c or random glucose value, a separate checker classifies it with American Diabetes Association cut-offs. That part is rule-based and kept apart from the model on purpose.

The whole interface works in English and Urdu with a right-to-left layout, prints a summary to take to a clinic, and sends no data anywhere.

## How we built it

The model is a logistic regression trained in scikit-learn on the Pima Indians Diabetes Database, using only the five features answerable without a blood test. Impossible zero values were treated as missing and imputed with training medians. I held out 25% of the data, compared logistic regression, random forest and gradient boosting with 5-fold cross-validation, and picked the screening threshold on cross-validated predictions so the test set was used exactly once.

The fitted model is exported to JSON and re-implemented in a short, dependency-free JavaScript module. Node tests confirm the browser output matches scikit-learn to 1e-9 on held-out rows and that every ADA boundary is classified correctly. The front end is plain HTML, CSS and JavaScript with no build step.

## Challenges we ran into

The dataset's glucose column is a 2-hour oral glucose tolerance result, not the fasting or random readings most people get. Feeding a home glucometer value into the model would have been wrong, so I split lab readings out into a rule-based checker with published cut-offs.

The family-history input in the data is a computed pedigree score no user knows. I mapped a simple question (none, one, two or more relatives) to the 25th, 50th and 75th percentiles of that score and disclosed it as an approximation.

Test-set sensitivity came out at 0.73, below the 0.80 target set in cross-validation. I reported it instead of re-tuning on the test set.

## Accomplishments that we're proud of

Every prediction is fully explainable, and the explanation in the browser is mathematically exact rather than an approximation. The app tells users its own weaknesses in their own language. The tests prove the deployed model is the evaluated model.

## What we learned

A simple model matched tree ensembles on this data, so interpretability cost nothing. Honest reporting meant writing down numbers I would rather have been higher. Right-to-left layout needs more than a `dir` attribute: charts and gauges have to stay left-to-right while text flips.

## What's next for Pehchaan

Retrain on South Asian screening data and add waist circumference as a question. Validate it with a community health clinic before anyone relies on it. Add more regional languages and an offline Android wrapper.

## Built with

python, scikit-learn, pandas, numpy, matplotlib, javascript, html5, css3, node.js

## Honest status

Finished: the questionnaire, model, explanations, what-if slider, lab-result checker, Urdu interface, printable summary, model card and tests.
Planned, not built: South Asian retraining, clinical validation, Android app.
