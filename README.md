# 🛡️ AuthGuard – Fake Login Page Detector Extension

**AuthGuard** is a lightweight Chrome extension that helps protect users from phishing websites impersonating trusted login portals. It analyzes URLs and webpage content in real time to detect suspicious domains, insecure login forms, and phishing indicators.

---

## 🚀 Features

- ✅ Detects visually deceptive domains (e.g., `cap1talone.com`)
- 🔒 Warns users of login forms on untrusted websites
- 🔍 Checks for insecure (non-HTTPS) connections
- 🧠 Easily extendable with custom phishing detection logic
- 🧩 Simple popup UI with page scanning status

---

## 🛠️ Built With

- JavaScript (ES6)
- Chrome Extensions API (Manifest V3)
- HTML/CSS for UI
- Optional: Levenshtein distance, Google Safe Browsing API (future enhancement)

---

## 📦 Folder Structure


---

## 🧪 How to Install Locally

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `authguard` project folder.
5. Visit websites to see the extension in action.

---

## ⚠️ Example Use Cases

| URL                     | Result                               |
|-------------------------|--------------------------------------|
| `https://capitalone.com`     | ✅ No warning                      |
| `https://cap1talone.com`     | ⚠️ Phishing alert triggered         |
| `http://fake-login.net`     | ⚠️ Insecure connection warning     |

---

## 🎯 Why This Project?

This project simulates real-world work that cybersecurity professionals—especially at fintech companies like **Capital One**—focus on: **protecting users from phishing and fraud**. It demonstrates:
- Browser-level security enforcement
- Threat detection and prevention
- Customer-focused cybersecurity design

---

## 📌 Future Improvements

- 🔁 Add fuzzy domain matching (Levenshtein distance)
- 🌐 Integrate Google Safe Browsing API
- 📥 Add a "Report This Site" feature
- 📊 Create a local dashboard of flagged URLs

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙋‍♂️ Author

**Rudra Agarwal**  
Computer Science @ University of Maryland  
Aspiring cybersecurity engineer passionate about secure systems and ethical technology.
