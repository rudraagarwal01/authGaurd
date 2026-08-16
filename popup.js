const BACKEND_URL = "http://localhost:8000";

function riskLabel(score) {
  if (score >= 60) return {label: "High Risk", color: "#e74c3c"};
  if (score >= 30) return {label: "Suspicious", color: "#f39c12"};
  return {label: "Low Risk", color: "#27ae60"};
}

document.addEventListener("DOMContentLoaded", () => {
  const statusEl    = document.getElementById("status");
  const scoreEl     = document.getElementById("score");
  const flagsEl     = document.getElementById("flags");
  const sourceEl    = document.getElementById("source");
  const reportBtn   = document.getElementById("reportBtn");
  const viewReportsBtn = document.getElementById("viewReportsBtn");

  chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
    if (!tab?.url?.startsWith("http")) {
      statusEl.textContent = "Not a web page.";
      scoreEl.textContent  = "";
      return;
    }

    const domain = new URL(tab.url).hostname;
    statusEl.textContent = domain;

    chrome.storage.local.get(`tab_${tab.id}`, data => {
      const result = data[`tab_${tab.id}`];

      if (!result) {
        scoreEl.textContent = "No scan result yet — try reloading the page.";
        return;
      }

      const {label, color} = riskLabel(result.risk_score);
      scoreEl.textContent  = `${label}  ${result.risk_score}/100`;
      scoreEl.style.color  = color;

      if (result.flags?.length > 0) {
        flagsEl.textContent = result.flags.join("  ·  ");
      }

      if (result.source === "local") {
        sourceEl.textContent = "⚠ Backend offline — local scan only";
      }
    });

    // --- Report button ---
    reportBtn.addEventListener("click", () => {
      reportBtn.disabled     = true;
      reportBtn.textContent  = "Reporting…";

      fetch(`${BACKEND_URL}/report`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: tab.url, reason: "Reported via AuthGuard extension"}),
      })
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(() => {
          reportBtn.textContent = "✓ Reported";
        })
        .catch(() => {
          // Backend unreachable — save locally as a fallback
          chrome.storage.local.get("reportedSites", d => {
            const sites = d.reportedSites || [];
            if (!sites.includes(domain)) sites.push(domain);
            chrome.storage.local.set({reportedSites: sites}, () => {
              reportBtn.textContent = "✓ Saved locally";
            });
          });
        });
    });

    viewReportsBtn.addEventListener("click", () => {
      chrome.tabs.create({url: chrome.runtime.getURL("reports.html")});
    });
  });
});
