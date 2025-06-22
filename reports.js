document.addEventListener("DOMContentLoaded", () => {
    const listEl = document.getElementById("reportedList");
    const clearBtn = document.getElementById("clearBtn");
  
    function renderReports(sites) {
      if (!sites || sites.length === 0) {
        listEl.innerHTML = "<li>No sites reported yet.</li>";
        return;
      }
      listEl.innerHTML = sites.map(site => `<li>${site}</li>`).join("");
    }
  
    // Load reports from storage
    chrome.storage.local.get(["reportedSites"], (data) => {
      renderReports(data.reportedSites);
    });
  
    // Clear reports on button click
    clearBtn.addEventListener("click", () => {
      chrome.storage.local.set({ reportedSites: [] }, () => {
        renderReports([]);
        alert("All reports cleared.");
      });
    });
  });

  
