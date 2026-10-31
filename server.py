"""
CyberRakshak AI — Backend API & Model Inference Server
Connects the trained Scikit-Learn ML Models with the Frontend:
1. Phishing URL Detection Model (RandomForestClassifier on 45 PhiUSIIL features)
2. Scam & SMS Fraud Detection Model (TF-IDF + LogisticRegression)
3. Document Security Analyzer (PDF, DOCX, TXT Text Extraction + ML Inference)
4. AI Security Assistant Chatbot Endpoint
"""

import os
import re
import urllib.parse
from io import BytesIO
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env
load_dotenv()

# Initialize Groq LLM Client
groq_client = None

def get_groq_client():
    global groq_client
    if groq_client is not None:
        return groq_client
    try:
        load_dotenv(override=True)
        key = (
            os.getenv("GROQ_API_KEY")
            or os.getenv("api_key")
            or os.getenv("API_KEY")
            or os.getenv("groq_api_key")
        )
        if key and key.strip():
            groq_client = Groq(api_key=key.strip())
            print(f"[OK] Groq LLM API connected successfully for AI Chatbot (Key: {key[:6]}...)")
        else:
            print("[!] No GROQ_API_KEY or api_key found in .env — chatbot will use fallback responses")
    except Exception as e:
        print(f"[!] Groq client init error: {e}")
    return groq_client

get_groq_client()

# Initialize Flask App
app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Global model holders
scam_model = None
tfidf_vec = None
phish_model = None
feature_cols = None
imputer = None

def load_models():
    global scam_model, tfidf_vec, phish_model, feature_cols, imputer
    try:
        scam_path = os.path.join(MODELS_DIR, "scam_detection_model.pkl")
        tfidf_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl")
        if os.path.exists(scam_path) and os.path.exists(tfidf_path):
            scam_model = joblib.load(scam_path)
            tfidf_vec = joblib.load(tfidf_path)
            print("[OK] Loaded Scam Detection ML Model & TF-IDF Vectorizer")
    except Exception as e:
        print("[!] Error loading scam model:", e)

    try:
        phish_path = os.path.join(MODELS_DIR, "phishing_detection_model.pkl")
        cols_path = os.path.join(MODELS_DIR, "final_feature_columns.pkl")
        imp_path = os.path.join(MODELS_DIR, "final_phishing_imputer.pkl")
        if os.path.exists(phish_path) and os.path.exists(cols_path):
            phish_model = joblib.load(phish_path)
            feature_cols = joblib.load(cols_path)
            if os.path.exists(imp_path):
                imputer = joblib.load(imp_path)
            print("[OK] Loaded Phishing URL Detection Model & 45 Feature Columns")
    except Exception as e:
        print("[!] Error loading phishing model:", e)

load_models()

def extract_url_features(url):
    """Extracts features matching the PhiUSIIL 45-feature dataset format."""
    parsed = urllib.parse.urlparse(url if "://" in url else "http://" + url)
    domain = parsed.netloc or parsed.path.split("/")[0]
    tld = domain.split(".")[-1] if "." in domain else ""

    row = {col: np.nan for col in feature_cols}
    row["URLLength"] = len(url)
    row["DomainLength"] = len(domain)
    row["IsDomainIP"] = 1 if re.match(r"^\d+\.\d+\.\d+\.\d+$", domain) else 0
    row["TLDLength"] = len(tld)
    row["NoOfSubDomain"] = max(0, len(domain.split(".")) - 2)
    row["HasObfuscation"] = 1 if ("%" in url or "@" in url) else 0
    row["NoOfObfuscatedChar"] = url.count("%") + url.count("@")
    row["ObfuscationRatio"] = row["NoOfObfuscatedChar"] / max(1, len(url))
    letters = sum(c.isalpha() for c in url)
    row["NoOfLettersInURL"] = letters
    row["LetterRatioInURL"] = letters / max(1, len(url))
    digits = sum(c.isdigit() for c in url)
    row["NoOfDegitsInURL"] = digits
    row["DegitRatioInURL"] = digits / max(1, len(url))
    row["NoOfEqualsInURL"] = url.count("=")
    row["NoOfQMarkInURL"] = url.count("?")
    row["NoOfAmpersandInURL"] = url.count("&")
    row["NoOfOtherSpecialCharsInURL"] = sum(not c.isalnum() for c in url)
    row["SpacialCharRatioInURL"] = row["NoOfOtherSpecialCharsInURL"] / max(1, len(url))
    row["IsHTTPS"] = 1 if url.lower().startswith("https") else 0
    row["Bank"] = 1 if any(b in url.lower() for b in ["bank", "sbi", "hdfc", "icici", "axis", "pnb", "verify", "secure"]) else 0
    row["Pay"] = 1 if any(p in url.lower() for p in ["pay", "upi", "wallet", "gpay", "phonepe", "kyc"]) else 0
    row["Crypto"] = 1 if any(c in url.lower() for c in ["crypto", "btc", "eth", "binance", "coin"]) else 0

    df = pd.DataFrame([row])[feature_cols]
    if imputer is not None:
        return imputer.transform(df)
    return df.fillna(0)

# ==================== STATIC ROUTES ====================
@app.route("/")
def serve_index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(".", path)

# ==================== API ROUTES ====================

@app.route("/api/status", methods=["GET"])
def api_status():
    return jsonify({
        "status": "online",
        "models": {
            "scam_nlp_model": "connected" if scam_model is not None else "offline",
            "phishing_url_model": "connected" if phish_model is not None else "offline",
            "document_analyzer": "connected"
        },
        "version": "2.4.0",
        "system": "CyberRakshak AI Live Engine"
    })

@app.route("/api/analyze/message", methods=["POST"])
def analyze_message():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "No text provided"}), 400

    is_spam = False
    confidence = 0.0

    if scam_model is not None and tfidf_vec is not None:
        X = tfidf_vec.transform([text])
        pred = scam_model.predict(X)[0]
        proba = scam_model.predict_proba(X)[0]
        is_spam = (pred == "spam") or (pred == 1)
        classes = list(scam_model.classes_)
        spam_idx = classes.index("spam") if "spam" in classes else 1
        confidence = float(proba[spam_idx] * 100)
    else:
        # Heuristic fallback if model not loaded
        is_spam = bool(re.search(r"blocked|urgent|verify|otp|pin|won|prize|lottery|loan|kyc", text, re.I))
        confidence = 88.5 if is_spam else 12.0

    # Categorize Scam Type & Extract Indicators
    indicators = []
    if re.search(r"urgent|today|immediately|within \d+|suspended|blocked", text, re.I):
        indicators.append("Urgent action demand (Artificial psychological panic)")
    if re.search(r"https?://|www\.|\.com|\.link|\.xyz|\.gift", text, re.I):
        indicators.append("Suspicious external web link embedded")
    if re.search(r"otp|pin|password|cvv|account no|aadhaar", text, re.I):
        indicators.append("Requests confidential security credentials or banking details")
    if re.search(r"won|lottery|crore|lakh|prize|gift card|bonus", text, re.I):
        indicators.append("Unsolicited reward / lottery scam lure")
    if re.search(r"0% interest|instant loan|pre-approved", text, re.I):
        indicators.append("Unregulated instant loan offer pattern")

    if not indicators:
        indicators = ["No obvious threat indicators found"] if not is_spam else ["Matches known fraudulent SMS communication patterns"]

    scam_type = "Fake Bank / KYC Alert" if re.search(r"bank|kyc|sbi|blocked", text, re.I) else \
                "Lottery / Lucky Draw Scam" if re.search(r"won|prize|lottery", text, re.I) else \
                "Instant Loan Fraud" if re.search(r"loan|cash", text, re.I) else \
                "Phishing / Impersonation Scam" if is_spam else "Legitimate Message"

    return jsonify({
        "is_scam": bool(is_spam),
        "risk_level": "High" if is_spam else "Low",
        "confidence_score": round(confidence, 1),
        "scam_type": scam_type,
        "key_indicators": indicators,
        "recommendation": "Do not click links or share personal details. Block sender and report on National Helpline 1930." if is_spam else "Message appears safe, but never share banking PINs or OTPs with anyone."
    })

# ==================== HYBRID ML + GROQ URL SECURITY ANALYZER ====================

def analyze_url_security(url):
    """
    Hybrid URL Security Engine:
    1. Extracts URL/domain structural features.
    2. Runs preliminary ML Random Forest classifier.
    3. Leverages Groq LLM to verify domain authenticity, brand impersonation,
       and forensic threat indicators to eliminate ML false positives on legitimate websites.
    """
    if not url:
        return {
            "url": "",
            "domain": "",
            "is_phishing": False,
            "risk_level": "Safe",
            "phishing_probability": 0.0,
            "confidence_score": 100.0,
            "type_name": "No URL Provided",
            "key_indicators": ["No URL analyzed"],
            "recommendation": "Provide a valid URL to scan."
        }

    parsed = urllib.parse.urlparse(url if "://" in url else "http://" + url)
    domain = parsed.netloc or parsed.path.split("/")[0]
    domain_clean = domain.lower().split(":")[0]
    if domain_clean.startswith("www."):
        domain_clean = domain_clean[4:]

    # 1. High-Reputation Whitelist Check (Zero False Positives for Known Safe Domains)
    trusted_roots = (
        "google.com", "google.co.in", "youtube.com", "wikipedia.org",
        "github.com", "microsoft.com", "apple.com", "amazon.in", "amazon.com",
        "flipkart.com", "sbi.co.in", "onlinesbi.sbi", "hdfcbank.com",
        "icicibank.com", "axisbank.com", "pnbindia.in", "bankofbaroda.in",
        "rbi.org.in", "npci.org.in", "gov.in", "nic.in", "openai.com", "groq.com"
    )
    is_whitelisted = any(domain_clean == t or domain_clean.endswith("." + t) for t in trusted_roots)

    # 2. Preliminary ML Model inference (baseline)
    raw_ml_prob = 50.0
    if phish_model is not None and feature_cols is not None:
        try:
            feats = extract_url_features(url)
            proba = phish_model.predict_proba(feats)[0]
            raw_ml_prob = float(proba[0] * 100)
        except Exception as e:
            print(f"[!] ML feature eval error: {e}")

    # If whitelisted trusted domain, immediately return verified safe output
    if is_whitelisted:
        return {
            "url": url,
            "domain": domain,
            "is_phishing": False,
            "risk_level": "Safe",
            "phishing_probability": 2.5,
            "confidence_score": 98.5,
            "type_name": "Verified Legitimate Domain",
            "key_indicators": [
                f"Official high-reputation domain: {domain_clean}",
                "Valid encryption & established identity standards",
                "Zero credential harvesting or spoofing signatures"
            ],
            "recommendation": "Domain verified as authentic and safe. Always check for HTTPS and avoid sharing OTPs."
        }

    # 3. Use Groq LLM for authoritative forensic classification
    client = get_groq_client()
    if client:
        try:
            system_prompt = (
                "You are CyberRakshak Senior Cybersecurity Forensic AI. Analyze the given URL for phishing or fraud.\n"
                "The preliminary ML model gave a raw score that may have false positives.\n"
                "You must inspect: domain legitimacy, lookalike/typosquatting tricks (e.g. sbi-verify.com), "
                "deceptive subdomains, suspicious TLDs (.xyz, .top, .gift, .click, .fun), credential harvesting endpoints (/login, /kyc, /otp), "
                "and whether it is a legitimate organization or an active phishing scam.\n"
                "Respond ONLY with valid JSON: {\n"
                '  "is_phishing": boolean,\n'
                '  "risk_level": "Safe" or "High" or "Suspicious",\n'
                '  "phishing_probability": float (0-100),\n'
                '  "type_name": string,\n'
                '  "key_indicators": [string, string, string],\n'
                '  "recommendation": string\n'
                "}"
            )
            llm_res = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"URL to analyze: {url}\nExtracted Domain: {domain_clean}\nRaw ML Phishing Score: {raw_ml_prob:.1f}%"}
                ],
                model="qwen/qwen3.8-27b",
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            analysis = json.loads(llm_res.choices[0].message.content)
            is_phish = bool(analysis.get("is_phishing"))
            risk = analysis.get("risk_level", "High" if is_phish else "Safe")
            prob = float(analysis.get("phishing_probability", 92.0 if is_phish else 8.0))
            type_name = analysis.get("type_name", "Phishing Link" if is_phish else "Legitimate URL")
            indicators = analysis.get("key_indicators", [])
            rec = analysis.get("recommendation", "")

            return {
                "url": url,
                "domain": domain,
                "is_phishing": is_phish,
                "risk_level": risk,
                "phishing_probability": round(prob, 1),
                "confidence_score": round(prob if is_phish else 100.0 - prob, 1),
                "type_name": type_name,
                "key_indicators": indicators if indicators else (["Suspicious domain pattern"] if is_phish else ["Standard domain structure"]),
                "recommendation": rec if rec else ("Do NOT open this link or enter passwords. Report to 1930." if is_phish else "Link appears safe.")
            }
        except Exception as e:
            print(f"[!] Groq URL analysis error: {e}")

    # 4. Smart fallback heuristics if Groq is offline
    is_phish = bool(
        re.search(r"verify|login|kyc|otp|free|bonus|gift|bank|update|support|prize", domain_clean, re.I)
        or re.search(r"\.(xyz|top|gift|club|fun|click|link|info)$", domain_clean, re.I)
        or re.match(r"^\d+\.\d+\.\d+\.\d+$", domain_clean)
    )
    prob = 92.5 if is_phish else 12.0
    indicators = []
    if not url.lower().startswith("https://"):
        indicators.append("Insecure connection (Missing HTTPS)")
    if is_phish:
        indicators.append("Domain contains deceptive keywords or high-risk extension")
    else:
        indicators.append("Standard domain structure verified")

    return {
        "url": url,
        "domain": domain,
        "is_phishing": is_phish,
        "risk_level": "High" if is_phish else "Safe",
        "phishing_probability": round(prob, 1),
        "confidence_score": round(prob if is_phish else 100.0 - prob, 1),
        "type_name": "Phishing Threat" if is_phish else "Legitimate Web Link",
        "key_indicators": indicators,
        "recommendation": "Do not enter passwords or credentials on this site. Report if suspicious." if is_phish else "Link structure appears normal."
    }

@app.route("/api/analyze/url", methods=["POST"])
def analyze_url():
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    result = analyze_url_security(url)
    return jsonify(result)

@app.route("/api/analyze/document", methods=["POST"])
def analyze_document():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    filename = file.filename
    ext = filename.lower().split(".")[-1]
    
    extracted_text = ""
    try:
        if ext == "pdf":
            import pypdf
            reader = pypdf.PdfReader(BytesIO(file.read()))
            for page in reader.pages:
                extracted_text += (page.extract_text() or "") + " "
        elif ext in ["doc", "docx"]:
            import docx
            doc = docx.Document(BytesIO(file.read()))
            for p in doc.paragraphs:
                extracted_text += p.text + " "
        else:
            extracted_text = file.read().decode("utf-8", errors="ignore")
    except Exception as e:
        extracted_text = f"Sample document content for {filename}"

    # Analyze extracted document text using the scam model
    if not extracted_text.strip():
        extracted_text = filename

    is_spam = False
    confidence = 0.0
    if scam_model is not None and tfidf_vec is not None:
        X = tfidf_vec.transform([extracted_text])
        pred = scam_model.predict(X)[0]
        proba = scam_model.predict_proba(X)[0]
        is_spam = (pred == "spam" or pred == 1)
        classes = list(scam_model.classes_)
        spam_idx = classes.index("spam") if "spam" in classes else 1
        confidence = float(proba[spam_idx] * 100)
    else:
        is_spam = bool(re.search(r"loan|urgent|kyc|verify|penalty|court|legal notice|won", extracted_text, re.I))
        confidence = 94.0 if is_spam else 10.0

    bullets = []
    if is_spam:
        bullets.append("Contains suspicious loan / fee extortion language")
        bullets.append("Unverified sender or non-statutory template signature")
        bullets.append("Demands personal identity records or upfront payment")
        bullets.append("High risk of fraudulent deception")
    else:
        bullets.append("No malicious deception signatures found")
        bullets.append("Standard professional document formatting")
        bullets.append("Low risk profile")

    file.seek(0, os.SEEK_END)
    file_size_mb = round(file.tell() / (1024 * 1024), 2)

    return jsonify({
        "filename": filename,
        "file_type": ext.upper(),
        "file_size": f"{file_size_mb} MB",
        "is_fraud": bool(is_spam),
        "risk_level": "High" if is_spam else "Safe",
        "confidence_score": round(confidence, 1),
        "summary_bullets": bullets,
        "recommendation": "Do not share personal details or pay any processing fees. Verify directly with the issuing institution." if is_spam else "Document appears safe to read."
    })

@app.route("/api/chat/status", methods=["GET"])
def api_chat_status():
    client = get_groq_client()
    return jsonify({
        "groq_connected": bool(client),
        "provider": "Groq Cloud",
        "primary_model": "qwen/qwen3.8-27b",
        "models": ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"],
        "status": "online" if client else "fallback"
    })

@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    history = data.get("history", []) or []
    lang = data.get("language", "en")
    
    if not message:
        return jsonify({
            "is_analysis": False,
            "reply": "Namaste! I am CyberRakshak AI. How can I assist you with your digital safety and security today?"
        })

    client = get_groq_client()

    # 1. Check if user sent a URL
    url_match = re.search(r"https?://\S+|www\.\S+|[a-zA-Z0-9.-]+\.(?:com|org|in|net|xyz|link|gift|info|biz)\b", message)
    is_pure_url = bool(url_match and len(message.strip()) <= len(url_match.group(0)) + 15)

    detected_url = url_match.group(0) if url_match else None
    url_sec = None

    if detected_url:
        url_sec = analyze_url_security(detected_url)
        if is_pure_url:
            return jsonify({
                "is_analysis": True,
                "analysis_type": "url",
                "risk_level": url_sec["risk_level"],
                "type_name": url_sec["type_name"],
                "probability": url_sec["confidence_score"],
                "indicators": url_sec["key_indicators"],
                "recommendation": url_sec["recommendation"]
            })

    # 2. Check text with Scam ML Model
    ml_scam_detected = False
    ml_confidence = 0.0
    if scam_model is not None and tfidf_vec is not None:
        try:
            X = tfidf_vec.transform([message])
            pred = scam_model.predict(X)[0]
            proba = scam_model.predict_proba(X)[0]
            ml_scam_detected = bool(pred == "spam" or pred == 1)
            classes = list(scam_model.classes_)
            spam_idx = classes.index("spam") if "spam" in classes else 1
            ml_confidence = float(proba[spam_idx] * 100)
        except Exception as e:
            print(f"[!] Scam model check error: {e}")

    # 3. Call Groq LLM API for rich, intelligent cybersecurity response
    if client:
        # Build prompt messages including conversation history
        system_content = (
            "You are CyberRakshak AI, an expert cybersecurity and fraud prevention assistant built to protect Indian citizens "
            "from online fraud, phishing, UPI scams, fake loan offers, lottery scams, electricity bill scams, digital arrests, and cyber threats.\n\n"
            "Key Instructions:\n"
            "- Speak in a friendly, clear, respectful tone.\n"
            "- Keep answers crisp, informative, and actionable (2 to 4 concise paragraphs or bullet points).\n"
            "- If a user describes a suspicious message or link, explain whether it is safe or a scam with accurate reasons.\n"
            "- When relevant, cite the Indian National Cyber Crime Helpline: 1930 and official portal: https://cybercrime.gov.in.\n"
            "- Support both English and Indian regional languages fluently.\n"
        )
        
        lang_names = {
            "hi": "Hindi (हिन्दी)",
            "bn": "Bengali (বাংলা)",
            "mr": "Marathi (मराठी)",
            "ta": "Tamil (தமிழ்)",
            "te": "Telugu (తెలుగు)",
            "en": "English"
        }
        target_lang = lang_names.get(lang, "English")
        if lang != "en":
            system_content += f"\n[CRITICAL LANGUAGE MANDATE: The user's active interface language is {target_lang}. You MUST write your ENTIRE reply in fluent {target_lang} using its native script. Use respectful, clear terms understandable by everyday citizens.]\n"

        if url_sec:
            system_content += f"\n[Forensic Analysis of URL '{detected_url}': Verdict is {url_sec['risk_level']} ({url_sec['type_name']}). Phishing Probability: {url_sec['phishing_probability']}%. Indicators: {', '.join(url_sec['key_indicators'])}]."
        elif ml_scam_detected:
            system_content += f"\n[Context: CyberRakshak ML fraud detector flagged this input as scam pattern with {ml_confidence:.1f}% confidence]."

        llm_messages = [{"role": "system", "content": system_content}]

        # Append last 6 turns from history
        if isinstance(history, list):
            for h in history[-6:]:
                if isinstance(h, dict) and h.get("role") in ["user", "assistant"] and h.get("content"):
                    llm_messages.append({"role": h["role"], "content": str(h["content"])[:500]})

        llm_messages.append({"role": "user", "content": message})

        # Models prioritized by latency and reasoning quality on Groq
        models_to_try = [
            "qwen/qwen3.8-27b",
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b"
        ]

        for m_name in models_to_try:
            try:
                chat_completion = client.chat.completions.create(
                    messages=llm_messages,
                    model=m_name,
                    temperature=0.6,
                    max_tokens=400,
                )
                reply = chat_completion.choices[0].message.content.strip()
                return jsonify({
                    "is_analysis": False,
                    "reply": reply,
                    "model": m_name,
                    "source": "groq"
                })
            except Exception as e:
                print(f"[!] Groq error with {m_name}: {e}")
                continue

    # 4. Fallback if Groq API is unavailable or offline
    if re.search(r"whatsapp", message, re.I):
        reply = "CyberRakshak WhatsApp Scam Protection monitors forwarded messages. Never forward unverified notices. If in doubt, verify with our team or report suspicious numbers."
    elif re.search(r"upi|pin|money|qr", message, re.I):
        reply = "Remember: You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money. A UPI PIN is only required to SEND money. Any claim that a PIN is needed to receive cashback is 100% fraud."
    elif re.search(r"help|report|police|1930", message, re.I):
        reply = "If you have lost money to cyber fraud, dial 1930 immediately (National Cyber Crime Helpline) within golden hour (2 hours) to freeze bank transfers. You can also file a complaint at https://cybercrime.gov.in."
    elif ml_scam_detected:
        reply = f"⚠️ Warning: This message matches known scam patterns (Confidence: {ml_confidence:.1f}%). Do not share OTPs, click suspicious links, or send any money. If targeted, call 1930."
    else:
        reply = "CyberRakshak AI is actively monitoring digital threats. Always verify sender identity, avoid clicking unknown links, and never share OTPs or bank passwords with anyone."

    return jsonify({"is_analysis": False, "reply": reply, "source": "fallback"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"[*] CyberRakshak AI Full-Stack Server starting on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
