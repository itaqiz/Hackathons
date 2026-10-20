"""Build the two PDFs Devpost asks for.

  docs/Pehchaan_Project_Description.pdf   one page: purpose and key features
  docs/Pehchaan_Code.pdf                  every source file written for the project

Needs: pip install playwright pygments && python -m playwright install chromium
Run:   python scripts/build_docs.py
"""
import base64
import html
import json
import pathlib

from playwright.sync_api import sync_playwright
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_for_filename

ROOT = pathlib.Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
CODE_FILES = [
    "app/index.html", "app/styles.css", "app/app.js", "app/risk.js", "app/i18n.js",
    "ml/train.py", "tests/test_risk.js", "scripts/build_docs.py",
    "package.json", "requirements.txt",
]

BASE_CSS = """
@page { size: A4; margin: 14mm 15mm; }
body { font-family: Inter, 'Segoe UI', sans-serif; color: #111827; font-size: 10pt; line-height: 1.45; margin: 0; }
h1 { font-size: 22pt; margin: 0; color: #0B1F3B; letter-spacing: -0.01em; }
h2 { font-size: 11pt; margin: 12px 0 4px; color: #0B1F3B; }
.sub { color: #00799F; font-weight: 600; margin: 2px 0 10px; }
p { margin: 0 0 6px; }
ul { margin: 0 0 6px; padding-left: 16px; } li { margin-bottom: 2px; }
.cols { display: grid; grid-template-columns: 1.15fr 1fr; gap: 16px; }
table { border-collapse: collapse; width: 100%; font-size: 9pt; }
td, th { border-bottom: 1px solid #DCE3EC; padding: 3px 4px; text-align: left; }
th { color: #5B6676; font-weight: 600; }
img { width: 100%; border: 1px solid #DCE3EC; border-radius: 4px; }
.bar { border-left: 3px solid #00C2FF; padding: 4px 8px; background: #F2F8FC; margin: 8px 0; }
.foot { color: #5B6676; font-size: 8pt; margin-top: 8px; }
"""


def description_html() -> str:
    m = json.loads((ROOT / "app" / "model.json").read_text())
    t = m["test_metrics"]
    img = base64.b64encode((ROOT / "ml" / "reports" / "evaluation.png").read_bytes()).decode()
    cv = {c["model"].split(",")[0] + (" + glucose" if "glucose" in c["model"] else ""): c["cv_auc"]
          for c in m["cv_comparison"]}
    cv_rows = "".join(f"<tr><td>{html.escape(k)}</td><td>{v:.3f}</td></tr>" for k, v in cv.items())
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE_CSS}</style></head><body>
<h1>Pehchaan</h1>
<p class="sub">Early diabetes risk screening without a lab test. UnivaBio 2026, theme: AI for Human Health. Muhammad Taqui.</p>

<div class="bar"><b>Purpose.</b> Many people with type 2 diabetes do not know they have it, because testing needs a lab visit.
Pehchaan answers one question from information a person already knows: should I get a blood test now?
It explains every result, works in English and Urdu, and runs fully in the browser with no data sent anywhere.</div>

<div class="cols"><div>
<h2>Key features</h2>
<ul>
<li><b>Six-question screen.</b> Sex, age, height and weight (live BMI), pregnancies, optional blood pressure, family history.</li>
<li><b>Clear outcome.</b> Above or below a screening threshold, percentile among study participants, and a specific next step.</li>
<li><b>Exact explanation.</b> A bar per factor showing its contribution to the score, compared with an average participant.</li>
<li><b>What-if slider.</b> How the score moves with weight, labelled as a data pattern rather than a promise.</li>
<li><b>Lab result checker.</b> Fasting, OGTT, HbA1c or random glucose classified by ADA cut-offs; rule-based and separate from the model.</li>
<li><b>Accessible.</b> Full Urdu interface with right-to-left layout, dark and light themes, mobile layout, printable clinic summary.</li>
<li><b>Private and offline.</b> Static files only; no server, no account, no storage.</li>
<li><b>Model card in the app.</b> Data source, metrics with confidence intervals, plots and four stated limitations.</li>
</ul>
<h2>How it works</h2>
<p>Logistic regression on the Pima Indians Diabetes Database ({m['dataset']['n_total']} women), using five features answerable without a blood test.
Impossible zeros treated as missing and median-imputed. 25% held out; model choice and threshold
(sensitivity target 0.80) fixed by 5-fold cross-validation on the training set; test set used once.
The exported model runs in JavaScript, and tests confirm it matches scikit-learn to 1e-9.</p>
</div><div>
<h2>Held-out test results (n = {t['n_test']}, {t['positives_test']} with diabetes)</h2>
<table><tr><th>Metric</th><th>Value</th><th>95% CI</th></tr>
<tr><td>AUC</td><td>{t['auc']:.3f}</td><td>{t['ci95']['auc'][0]:.2f} to {t['ci95']['auc'][1]:.2f}</td></tr>
<tr><td>Sensitivity at {m['threshold']}</td><td>{t['sensitivity']:.3f}</td><td>{t['ci95']['sensitivity'][0]:.2f} to {t['ci95']['sensitivity'][1]:.2f}</td></tr>
<tr><td>Specificity at {m['threshold']}</td><td>{t['specificity']:.3f}</td><td>{t['ci95']['specificity'][0]:.2f} to {t['ci95']['specificity'][1]:.2f}</td></tr>
</table>
<h2>Cross-validated AUC, training set</h2>
<table>{cv_rows}</table>
<p style="margin-top:6px">Tree ensembles gave no gain, so the explainable model was kept. Adding glucose lifts test AUC to {m['reference_auc_with_glucose']:.2f}, which is why a high score leads to a blood test.</p>
<img src="data:image/png;base64,{img}">
</div></div>

<h2>Limitations, stated in the app</h2>
<p>Trained only on women of Pima heritage in Arizona; not validated in South Asia, and men receive a warning.
Study prevalence was {m['dataset']['prevalence']*100:.0f}%, so raw scores overstate absolute risk. Family history is an approximate mapping.
{round((1-t['sensitivity'])*100)}% of test-set cases fell below the threshold. Not a medical device.</p>
<p><b>Finished:</b> everything above. <b>Planned:</b> retraining on South Asian data with waist circumference, clinic validation, Android app.</p>
<p class="foot">Data: Pima Indians Diabetes Database (NIDDK, via the UCI Machine Learning Repository). Smith et al., Proc. Symp. Computer Applications in Medical Care, 1988, 261 to 265. Code: MIT licence.</p>
</body></html>"""


def code_html() -> str:
    fmt = HtmlFormatter(style="friendly", linenos="inline", nobackground=True)
    parts = []
    toc = []
    for i, rel in enumerate(CODE_FILES, 1):
        src = (ROOT / rel).read_text(encoding="utf-8")
        lines = src.count("\n") + 1
        toc.append(f"<li>{rel} ({lines} lines)</li>")
        try:
            body = highlight(src, get_lexer_for_filename(rel), fmt)
        except Exception:
            body = f"<pre>{html.escape(src)}</pre>"
        parts.append(f'<section><h2>{i}. {rel}</h2>{body}</section>')
    css = BASE_CSS + fmt.get_style_defs(".highlight") + """
section { page-break-before: always; }
pre { font-family: 'JetBrains Mono', Menlo, monospace; font-size: 7.4pt; line-height: 1.35;
      white-space: pre-wrap; word-break: break-word; margin: 0; }
.highlight .linenos { color: #9AA4B2; padding-right: 6px; }
"""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body>
<h1>Pehchaan: source code</h1>
<p class="sub">UnivaBio 2026 submission. Muhammad Taqui. MIT licence.</p>
<p>All code written for the project, in the order a reader would follow it: the web app, the risk engine,
the interface text, the training pipeline, the tests and the documentation build script.
Generated files (model.json, model.js, parity_vectors.json) and the dataset are not reprinted;
they are produced by ml/train.py.</p>
<h2>Contents</h2><ol>{''.join(toc)}</ol>
{''.join(parts)}
</body></html>"""


def render(doc: str, out: pathlib.Path, page_numbers: bool) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(doc, wait_until="load")
        footer = ('<div style="font-size:8px;width:100%;text-align:center;color:#888">'
                  'Pehchaan source code, page <span class="pageNumber"></span> of <span class="totalPages"></span></div>')
        page.pdf(path=str(out), format="A4", print_background=True, prefer_css_page_size=True,
                 display_header_footer=page_numbers, header_template="<div></div>", footer_template=footer)
        browser.close()


if __name__ == "__main__":
    DOCS.mkdir(exist_ok=True)
    render(description_html(), DOCS / "Pehchaan_Project_Description.pdf", page_numbers=False)
    render(code_html(), DOCS / "Pehchaan_Code.pdf", page_numbers=True)
    print("PDFs written to", DOCS)
