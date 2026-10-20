# Demo video script (target length 2:45, hard limit 3:00)

Record the screen at 1080p with OBS Studio (free) or the Windows Game Bar (Win + G). Speak over it live or record the voice separately. Upload to YouTube as Unlisted and paste the link into Devpost.

Before recording: open `app/index.html` in Chrome, zoom to 110%, close other tabs, hide bookmarks, and have a second tab ready with `ml/train.py` open in VS Code.

## 0:00 to 0:20, the problem

Screen: the Pehchaan landing page.

> Many people with type 2 diabetes have no idea they have it. Getting tested means a lab visit, and most people skip it until something goes wrong. Pehchaan answers one question: should you get a blood test now? It needs no lab result, it explains itself, and it runs entirely in your browser.

## 0:20 to 1:05, the main flow

Screen: fill the form with age 45, pregnancies 3, height 160, weight 78, blood pressure 84, family history "One". Click "Check my risk".

> Six questions anyone can answer. BMI is calculated as you type. Blood pressure is optional; if you don't know it, the model uses the study median and says so.
>
> This person is above the screening threshold, with a score higher than 52% of study participants. The next step is specific: a fasting sugar or HbA1c test.

Point the cursor at the bars.

> This is the part I care most about. Every bar is that factor's exact contribution to the score. Age and blood pressure pushed it up here; BMI and the other answers pulled it slightly down compared with the average participant.

Drag the weight slider down.

> The what-if slider shows how the score changes with weight. It's labelled as a pattern in the data, not a promise.

## 1:05 to 1:30, lab result checker and Urdu

Screen: choose "Fasting glucose", enter 112 mg/dL, click "Check result".

> If you already have a reading, Pehchaan checks it against American Diabetes Association cut-offs. 112 fasting is in the prediabetes range. This part is fixed clinical rules, deliberately kept separate from the AI model.

Click "اردو".

> The whole interface switches to Urdu, right-to-left, because a screening tool only helps people who can read it.

Click "Print or save summary" and show the print preview briefly.

## 1:30 to 2:20, how it works and honest numbers

Screen: scroll to "How it works", then switch to `ml/train.py`.

> The model is logistic regression trained on the Pima Indians Diabetes Database. I compared it with a random forest and gradient boosting; all three scored about 0.74 AUC in cross-validation, so I kept the one whose predictions can be explained exactly.
>
> I picked the threshold on cross-validation and touched the test set once. On 192 held-out people it reached an AUC of 0.74, sensitivity 0.73 and specificity 0.58. A model that adds blood glucose reaches 0.82. That gap is why Pehchaan sends people to a blood test instead of pretending to replace one.

Screen: terminal running `node --test tests/test_risk.js`, all 7 passing.

> These tests confirm the JavaScript in the browser reproduces scikit-learn's predictions to nine decimal places, and that every ADA boundary is handled correctly.

## 2:20 to 2:45, limitations and what's next

Screen: the "Known limitations" list.

> The data comes from women of Pima heritage in Arizona. It hasn't been validated in South Asia, where diabetes often appears at a lower BMI, and men get a warning. What's finished: everything you've just seen. What's planned: retraining on South Asian screening data with waist circumference added as a question, and testing it with a community health clinic.
>
> Pehchaan. Know your risk before the lab.
