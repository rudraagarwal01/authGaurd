document.addEventListener("DOMContentLoaded", () => {
    const statusEl = document.getElementById("status");
    const reportBtn = document.getElementById("reportBtn");
    const viewReportsBtn = document.getElementById("viewReportsBtn");
  
    // Display current tab's domain
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url);
      statusEl.textContent = `Current domain: ${url.hostname}`;
    });
  
    // Report current site button
    reportBtn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const domain = new URL(tabs[0].url).hostname;
  
        chrome.storage.local.get(["reportedSites"], (data) => {
          let reported = data.reportedSites || [];
          if (!reported.includes(domain)) {
            reported.push(domain);
            chrome.storage.local.set({ reportedSites: reported }, () => {
              alert(`✅ ${domain} has been reported.`);
            });
          } else {
            alert("⚠️ You already reported this site.");
          }
        });
      });
    });
  
    // View reported sites button
    viewReportsBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: chrome.runtime.getURL("reports.html") });
    });
  });
  