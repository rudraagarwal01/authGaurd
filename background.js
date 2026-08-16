// Change this to your deployed backend URL in production.
const BACKEND_URL = "http://localhost:8000";

// --- Local fallback scoring (runs when backend is unreachable) ---

function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  const dp = Array.from({length: m + 1}, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

const FALLBACK_BRANDS = [
  "capitalone.com", "amazon.com", "google.com", "paypal.com",
  "apple.com", "microsoft.com", "netflix.com", "chase.com",
  "wellsfargo.com", "bankofamerica.com", "facebook.com", "github.com",
];

function localRiskScore(url) {
  let hostname;
  try { hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, ""); }
  catch { return {risk_score: 100, flags: ["invalid_url"], matched_brand: null}; }

  if (FALLBACK_BRANDS.includes(hostname)) {
    return {risk_score: 0, flags: [], matched_brand: null};
  }

  let score = 0;
  const flags = [];
  let matched_brand = null;

  for (const brand of FALLBACK_BRANDS) {
    const dist = levenshtein(hostname, brand);
    const sim = 1 - dist / Math.max(hostname.length, brand.length);
    if (sim >= 0.7 && dist > 0) {
      score += sim * 60;
      flags.push(`typosquat:${brand}`);
      matched_brand = brand;
      break;
    }
  }

  if (url.startsWith("http:")) { score += 10; flags.push("no_https"); }

  return {risk_score: Math.min(Math.round(score * 100) / 100, 100), flags, matched_brand};
}

// --- Backend check with local fallback ---

async function checkUrl(url) {
  try {
    const resp = await fetch(`${BACKEND_URL}/check`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({url}),
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    return {...data, source: "backend"};
  } catch {
    const local = localRiskScore(url);
    let domain = url;
    try { domain = new URL(url).hostname; } catch {}
    return {url, domain, safe_browsing_hit: false, source: "local", ...local};
  }
}

// --- Badge helpers ---

function setBadge(tabId, riskScore) {
  const text  = riskScore >= 60 ? "!" : riskScore >= 30 ? "?" : "";
  const color = riskScore >= 60 ? "#e74c3c" : riskScore >= 30 ? "#f39c12" : "#2ecc71";
  chrome.action.setBadgeText({tabId, text});
  chrome.action.setBadgeBackgroundColor({tabId, color});
}

// --- Tab lifecycle ---

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url?.startsWith("http")) return;
  const result = await checkUrl(tab.url);
  setBadge(tabId, result.risk_score);
  chrome.storage.local.set({[`tab_${tabId}`]: result});
});

chrome.tabs.onRemoved.addListener(tabId => {
  chrome.storage.local.remove([`tab_${tabId}`]);
});

// --- Messages from content.js and popup.js ---

chrome.runtime.onMessage.addListener((msg, sender) => {
  // content.js reports whether the page has a password field
  if (msg.action === "loginFields" && sender.tab) {
    const key = `tab_${sender.tab.id}`;
    chrome.storage.local.get(key, data => {
      const result = data[key];
      if (result && msg.hasLoginFields && !result.flags.includes("login_fields")) {
        result.flags = [...result.flags, "login_fields"];
        chrome.storage.local.set({[key]: result});
      }
    });
  }
});
