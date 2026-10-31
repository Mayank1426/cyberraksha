website demo link:-https://cyberraksha-zwj9.onrender.com/

# CyberRakshak AI — AI Cyber Security Assistant & Threat Defense Platform

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Mayank1426/cyberraksha)

CyberRakshak AI is a full-stack cybersecurity defense platform combining machine learning models and LLM intelligence to protect everyday citizens from online fraud, scams, phishing URLs, malicious documents, and deepfakes.

---

## 🌟 Key Features

- **Phishing URL Detection**: Real-time feature extraction matching 45 PhiUSIIL behavioral indicators with a Scikit-Learn `RandomForestClassifier`.
- **Scam & Fraud Message Checker**: Scans SMS messages, emails, and WhatsApp forwards using TF-IDF text vectorization and logistic classification.
- **Document Threat Scanner**: Extracts and inspects PDFs and Word `.docx` documents for suspicious links, credential harvesters, and malicious payloads.
- **AI Cyber Security Assistant**: Powered by Groq Cloud ultra-low-latency LLMs (`qwen/qwen3.8-27b`, `openai/gpt-oss-120b`) with multi-language support (English, Hindi, Bengali, Marathi, Tamil, Telugu).
- **Incident Response & 1930 Helpline**: Quick guide and direct reporting integration to the National Cyber Crime Portal (`cybercrime.gov.in`) and the 1930 emergency hotline.
- **Safety Academy**: Interactive cybersecurity literacy quizzes and scam prevention modules.

---

## 🚀 Running Locally

### 1. Prerequisites
- Python 3.9+ (Python 3.10 or 3.11 recommended)
- `pip`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Mayank1426/cyberraksha.git
cd cyberraksha

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Setup
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Add your free Groq API key:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=8080
```

### 4. Start the Server
```bash
python server.py
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## ☁️ Deployment on Render

This project is configured for one-click deployment on [Render](https://render.com).

### Option 1: Direct Web Service (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository: `Mayank1426/cyberraksha`.
3. Configure the settings:
   - **Name**: `cyberraksha`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn server:app`
   - **Instance Type**: `Free`
4. In **Environment Variables**, add:
   - `GROQ_API_KEY`: *(Your Groq API key from console.groq.com)*
   - `PYTHON_VERSION`: `3.11.9`
5. Click **Create Web Service**. Render will build and deploy your app with a public `https://<service-name>.onrender.com` URL!

### Option 2: Render Blueprint
Render will automatically detect the included `render.yaml` and `Procfile`.
Simply connect the repository and choose **New +** -> **Blueprint**.

---

## 📂 Project Architecture

```
cyberraksha/
│
├── index.html              # Main user interface
├── styles.css              # CyberRakshak theme and responsive layout
├── app.js                  # Frontend controllers, event handlers & API communication
├── server.py               # Flask backend, static file server & ML inference APIs
├── Procfile                # WSGI entrypoint for Render / Heroku
├── render.yaml             # Render Blueprint configuration
├── requirements.txt        # Python production dependencies
├── .gitignore              # Git ignore rules
│
├── assets/                 # Graphics, icons, and illustrations
│   ├── robot.jpg
│   ├── ai_protection_hero.jpg
│   ├── deepfake_video_thumb.jpg
│   └── portal_cybercrime.png
│
└── models/                 # Pre-trained ML models & vectorizers
    ├── phishing_detection_model.pkl
    ├── scam_detection_model.pkl
    ├── tfidf_vectorizer.pkl
    ├── final_feature_columns.pkl
    └── final_phishing_imputer.pkl
```

---

## 🛡️ License
CyberRakshak AI — Built for Digital Public Safety.
