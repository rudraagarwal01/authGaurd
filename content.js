// Detect password fields and report to background for risk scoring.
const hasLoginFields = document.querySelectorAll('input[type="password"]').length > 0;
chrome.runtime.sendMessage({action: "loginFields", hasLoginFields});
