// ------------------ 🔠 Levenshtein Distance ------------------
function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[a.length][b.length];
  }
  
  // ------------------ 🧠 Domain Similarity Check ------------------
  function isSimilarDomain(currentDomain, trustedDomains, threshold = 0.3) {
    return trustedDomains.find(trusted => {
      const dist = levenshtein(currentDomain, trusted);
      const sim = dist / trusted.length;
      return dist > 0 && sim < threshold;
    });
  }
  
  // ------------------ 🛂 Login Field Check ------------------
  function containsLoginFields() {
    const inputs = document.querySelectorAll("input");
    const loginLike = Array.from(inputs).filter(input =>
      ["password", "email", "username", "text"].includes(input.type.toLowerCase())
    );
    return loginLike.length > 1;
  }
  
  // ------------------ 🔍 Main Detection Logic ------------------
  const trustedDomains = ["capitalone.com", "amazon.com", "google.com"];
  const currentDomain = window.location.hostname.toLowerCase();
  const matchedDomain = isSimilarDomain(currentDomain, trustedDomains);
  
  let alertMessage = "";
  
  if (matchedDomain) {
    alertMessage = `⚠️ This domain (${currentDomain}) is suspiciously similar to ${matchedDomain}. It may be a phishing site.`;
  } else if (containsLoginFields() && !trustedDomains.some(d => currentDomain.includes(d))) {
    alertMessage = `⚠️ This page contains login fields on an untrusted domain (${currentDomain}). Be cautious before entering credentials.`;
  } else {
    alertMessage = "✅ No threats detected on this page.";
  }
  
  // Display alert popup
  alert(alertMessage);
  
  // Save result for popup.js to display in extension popup
  localStorage.setItem("authguard_alert", alertMessage);
  