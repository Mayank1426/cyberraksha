/**
 * CyberRakshak AI — Client-Side Application Logic & Multilingual Engine
 * Powered by Groq Cloud LLM (qwen/qwen3.8-27b) and Hybrid ML Threat Detectors
 */

// Application State
let currentScreen = 'chat';
let currentLanguage = localStorage.getItem('cyberrakshak_lang') || 'en';
let isBackendConnected = false;
let isGroqConnected = false;
let apiBaseUrl = '';
let chatHistory = [];

/**
 * Full Multilingual Translation Dictionary
 */
const i18n = {
  en: {
    lang_name: 'English',
    lang_badge: 'EN ▾',
    nav_chat: 'Chatbot',
    nav_awareness: 'Awareness',
    nav_history: 'History',
    nav_language: 'Language',
    nav_profile: 'Profile',
    groq_active: 'Groq AI Active',
    btn_reset: '🔄 Reset',
    welcome_title: 'CyberRakshak AI Guardian',
    welcome_sub: 'Powered by Groq Cloud LLM & Live Threat Detection',
    welcome_body: 'Namaste! I am your 24/7 AI Cybersecurity Assistant. Ask me anything about online fraud, verify suspicious links or messages, and learn how to stay protected.',
    suggestions_label: 'Quick Safety Prompts (Click to ask):',
    chip_electricity: '⚡ Electricity Bill SMS',
    chip_upi: '💳 UPI PIN for Receiving Money?',
    chip_helpline: '🚨 1930 Helpline Info',
    chip_arrest: '👮 Digital Arrest Threat',
    input_placeholder: 'Ask CyberRakshak AI or paste any message/link...',
    academy_sub: 'Digital Safety Academy',
    academy_banner_title: 'Learn. Practice. Stay Safe.',
    academy_banner_desc: 'Free interactive lessons, simple language & safety guides.',
    btn_watch_video: 'Watch Awareness Video',
    popular_courses: 'Popular Courses',
    course1_title: 'Spot Online Scams',
    course1_desc: 'Identify fraud and stay safe',
    course2_title: 'UPI Safety & Secure Payments',
    course2_desc: 'Protect your money & bank accounts',
    course3_title: 'Digital Literacy for Seniors',
    course3_desc: 'Safe internet & WhatsApp guide',
    history_subtitle: 'Safety Inquiry History',
    lang_subtitle: 'Language Selection',
    lang_choose_title: 'Choose Your Language',
    lang_choose_sub: 'Select your preferred language for CyberRakshak AI',
    btn_continue_chat: 'Continue to Chatbot →',
    profile_title: 'Profile',
    profile_member: 'CyberRakshak Member',
    profile_guest: 'Guest User',
    setting_language: 'Language',
    setting_notifications: 'Notification Settings',
    setting_whatsapp: 'WhatsApp Bot Settings',
    setting_help: 'Help & Support',
    setting_about: 'About CyberRakshak AI',
    setting_logout: 'Log Out',
    toast_lang_changed: 'Language set to English',
    typing_text: 'CyberRakshak AI is analyzing with Groq...',
    report_safe_title: 'Security Scan Complete: Verified Legitimate Domain 🛡️',
    report_danger_title: 'Security Alert: Deceptive Threat Detected! ⚠️'
  },
  hi: {
    lang_name: 'हिन्दी',
    lang_badge: 'HI ▾',
    nav_chat: 'चैटबॉट',
    nav_awareness: 'जागरूकता',
    nav_history: 'इतिहास',
    nav_language: 'भाषा',
    nav_profile: 'प्रोफ़ाइल',
    groq_active: 'ग्रोक AI सक्रिय',
    btn_reset: '🔄 रीसेट',
    welcome_title: 'साइबर रक्षक AI गार्डियन',
    welcome_sub: 'ग्रोक क्लाउड LLM और लाइव साइबर सुरक्षा द्वारा संचालित',
    welcome_body: 'नमस्ते! मैं आपका 24/7 AI साइबर सुरक्षा सहायक हूँ। मुझसे ऑनलाइन धोखाधड़ी, संदिग्ध लिंक, व्हाट्सएप या बैंक अलर्ट के बारे में पूछें और सुरक्षित रहें।',
    suggestions_label: 'त्वरित सुरक्षा सवाल (पूछने के लिए क्लिक करें):',
    chip_electricity: '⚡ बिजली बिल काटने का फर्जी SMS',
    chip_upi: '💳 क्या पैसे पाने के लिए UPI PIN चाहिए?',
    chip_helpline: '🚨 1930 साइबर हेल्पलाइन जानकारी',
    chip_arrest: '👮 डिजिटल अरेस्ट पुलिस फ्रॉड',
    input_placeholder: 'साइबर रक्षक AI से पूछें या कोई लिंक/संदेश पेस्ट करें...',
    academy_sub: 'डिजिटल सुरक्षा अकादमी',
    academy_banner_title: 'सीखें। अभ्यास करें। सुरक्षित रहें।',
    academy_banner_desc: 'मुफ्त इंटरैक्टिव पाठ, सरल भाषा और संपूर्ण साइबर सुरक्षा निर्देश।',
    btn_watch_video: 'जागरूकता वीडियो देखें',
    popular_courses: 'लोकप्रिय पाठ',
    course1_title: 'ऑनलाइन घोटालों को पहचानें',
    course1_desc: 'धोखाधड़ी को पहचानें और सतर्क रहें',
    course2_title: 'UPI सुरक्षा और सुरक्षित भुगतान',
    course2_desc: 'अपने पैसे और बैंक खातों की सुरक्षा करें',
    course3_title: 'वरिष्ठ नागरिकों के लिए डिजिटल साक्षरता',
    course3_desc: 'सुरक्षित इंटरनेट और व्हाट्सएप गाइड',
    history_subtitle: 'सुरक्षा पूछताछ इतिहास',
    lang_subtitle: 'भाषा चयन',
    lang_choose_title: 'अपनी पसंदीदा भाषा चुनें',
    lang_choose_sub: 'साइबर रक्षक AI के लिए अपनी पसंदीदा भाषा चुनें',
    btn_continue_chat: 'चैटबॉट पर जारी रखें →',
    profile_title: 'प्रोफ़ाइल',
    profile_member: 'साइबर रक्षक सदस्य',
    profile_guest: 'अतिथि उपयोगकर्ता',
    setting_language: 'भाषा',
    setting_notifications: 'अधिसूचना सेटिंग्स',
    setting_whatsapp: 'व्हाट्सएप बॉट सेटिंग्स',
    setting_help: 'सहायता और समर्थन',
    setting_about: 'साइबर रक्षक AI के बारे में',
    setting_logout: 'लॉग आउट',
    toast_lang_changed: 'भाषा बदलकर हिन्दी कर दी गई है',
    typing_text: 'साइबर रक्षक AI ग्रोक के साथ विश्लेषण कर रहा है...',
    report_safe_title: 'सुरक्षा जांच पूर्ण: सत्यापित सुरक्षित लिंक 🛡️',
    report_danger_title: 'सुरक्षा चेतावनी: खतरनाक साइबर फ्रॉड लिंक! ⚠️'
  },
  bn: {
    lang_name: 'বাংলা',
    lang_badge: 'BN ▾',
    nav_chat: 'চ্যাটবট',
    nav_awareness: 'সচেতনতা',
    nav_history: 'ইতিহাস',
    nav_language: 'ভাষা',
    nav_profile: 'প্রোফাইল',
    groq_active: 'গ্রক AI সক্রিয়',
    btn_reset: '🔄 রিসেট',
    welcome_title: 'সাইবার রক্ষক AI গার্ডিয়ান',
    welcome_sub: 'গ্রক ক্লাউড এলএলএম এবং রিয়েল-টাইম থ্রেট ডিটেকশন',
    welcome_body: 'নমস্কার! আমি আপনার ২৪/৭ সাইবার নিরাপত্তা এআই সহকারী। অনলাইন জালিয়াতি, সন্দেহজনক লিঙ্ক বা মেসেজ সম্পর্কে আমাকে জিজ্ঞাসা করুন।',
    suggestions_label: 'জরুরী নিরাপত্তা প্রশ্ন (ক্লিক করে জানুন):',
    chip_electricity: '⚡ বিদ্যুৎ বিল কাটার ভুয়ো SMS',
    chip_upi: '💳 টাকা পেতে কি UPI PIN দিতে হয়?',
    chip_helpline: '🚨 ১৯৩০ সাইবার হেল্পলাইন তথ্য',
    chip_arrest: '👮 ডিজিটাল অ্যারেস্ট পুলিশ প্রতারণা',
    input_placeholder: 'সাইবার রক্ষককে জিজ্ঞাসা করুন বা লিঙ্ক পেস্ট করুন...',
    academy_sub: 'ডিজিটাল সেফটি একাডেমি',
    academy_banner_title: 'শিখুন। অনুশীলন করুন। সুরক্ষিত থাকুন।',
    academy_banner_desc: 'বিনামূল্যে ইন্টারেক্টিভ পাঠ ও সহজ ভাষার নিরাপত্তা নির্দেশিকা।',
    btn_watch_video: 'সচেতনতামূলক ভিডিও দেখুন',
    popular_courses: 'জনপ্রিয় কোর্স',
    course1_title: 'অনলাইন স্ক্যাম চিনুন',
    course1_desc: 'জালিয়াতি চিহ্নিত করুন এবং নিরাপদ থাকুন',
    course2_title: 'UPI ও নিরাপদ ডিজিটাল পেমেন্ট',
    course2_desc: 'আপনার কষ্টার্জিত টাকা সুরক্ষিত রাখুন',
    course3_title: 'প্রবীণ নাগরিকদের ডিজিটাল সুরক্ষা',
    course3_desc: 'সহজ ইন্টারনেট ও হোয়াটসঅ্যাপ নির্দেশিকা',
    history_subtitle: 'নিরাপত্তা অনুসন্ধানের ইতিহাস',
    lang_subtitle: 'ভাষা নির্বাচন',
    lang_choose_title: 'আপনার ভাষা বেছে নিন',
    lang_choose_sub: 'সাইবার রক্ষক এআই ব্যবহারের জন্য আপনার ভাষা নির্বাচন করুন',
    btn_continue_chat: 'চ্যাটবটে এগিয়ে যান →',
    profile_title: 'প্রোফাইল',
    profile_member: 'সাইবার রক্ষক সদস্য',
    profile_guest: 'গেস্ট ব্যবহারকারী',
    setting_language: 'ভাষা',
    setting_notifications: 'বিজ্ঞপ্তি সেটিংস',
    setting_whatsapp: 'হোয়াটসঅ্যাপ বট সেটিংস',
    setting_help: 'সহায়তা ও সাপোর্ট',
    setting_about: 'সাইবার রক্ষক AI সম্পর্কে',
    setting_logout: 'লগ আউট',
    toast_lang_changed: 'ভাষা বাংলা সেট করা হয়েছে',
    typing_text: 'সাইবার রক্ষক AI বিশ্লেষণ করছে...',
    report_safe_title: 'নিরাপত্তা স্ক্যান সম্পূর্ণ: নিরাপদ লিঙ্ক 🛡️',
    report_danger_title: 'নিরাপত্তা সতর্কতা: ক্ষতিকারক প্রতারণামূলক লিঙ্ক! ⚠️'
  },
  mr: {
    lang_name: 'मराठी',
    lang_badge: 'MR ▾',
    nav_chat: 'चॅटबॉट',
    nav_awareness: 'जागरूकता',
    nav_history: 'इतिहास',
    nav_language: 'भाषा',
    nav_profile: 'प्रोफाइल',
    groq_active: 'ग्रोक AI सक्रिय',
    btn_reset: '🔄 रीसेट',
    welcome_title: 'सायबर रक्षक AI गार्डियन',
    welcome_sub: 'ग्रोक क्लाउड LLM आणि लाईव्ह सायबर सुरक्षा प्रणाली',
    welcome_body: 'नमस्कार! मी आपला २४/७ AI सायबर सुरक्षा रक्षक आहे. ऑनलाइन फसवणूक, संशयास्पद लिंक्स किंवा मेसेज तपासा आणि सुरक्षित राहा.',
    suggestions_label: 'त्वरित सुरक्षा प्रश्न (विचारण्यासाठी क्लिक करा):',
    chip_electricity: '⚡ वीज बिल बंद होण्याचा खोटा SMS',
    chip_upi: '💳 पैसे मिळवण्यासाठी UPI PIN लागतो का?',
    chip_helpline: '🚨 १९३० सायबर हेल्पलाइन माहिती',
    chip_arrest: '👮 डिजिटल अरेस्ट पोलीस फ्रॉड',
    input_placeholder: 'सायबर रक्षकाला विचारा किंवा लिंक पेस्ट करा...',
    academy_sub: 'डिजिटल सुरक्षा अकादमी',
    academy_banner_title: 'शिका. सराव करा. सुरक्षित राहा.',
    academy_banner_desc: 'मोफत धडे, सोपी भाषा आणि सायबर सुरक्षा मार्गदर्शक.',
    btn_watch_video: 'जागरूकता व्हिडिओ पहा',
    popular_courses: 'लोकप्रिय कोर्सेस',
    course1_title: 'ऑनलाइन फसवणूक ओळखा',
    course1_desc: 'सायबर धोके ओळखा आणि सुरक्षित राहा',
    course2_title: 'UPI सुरक्षा आणि सुरक्षित व्यवहार',
    course2_desc: 'तुमचे बँक खाते आणि पैसे सुरक्षित ठेवा',
    course3_title: 'ज्येष्ठ नागरिकांसाठी डिजिटल साक्षरता',
    course3_desc: 'इंटरनेट आणि व्हॉट्सअ‍ॅप सुरक्षितपणे वापरा',
    history_subtitle: 'सुरक्षा चौकशी इतिहास',
    lang_subtitle: 'भाषा निवड',
    lang_choose_title: 'आपली भाषा निवडा',
    lang_choose_sub: 'सायबर रक्षक AI साठी आपली आवडती भाषा निवडा',
    btn_continue_chat: 'चॅटबॉटवर पुढे जा →',
    profile_title: 'प्रोफाइल',
    profile_member: 'सायबर रक्षक सदस्य',
    profile_guest: 'अतिथी वापरकर्ता',
    setting_language: 'भाषा',
    setting_notifications: 'सूचना सेटिंग्ज',
    setting_whatsapp: 'व्हॉट्सअ‍ॅप बॉट',
    setting_help: 'मदत आणि सहकार्य',
    setting_about: 'सायबर रक्षक AI बद्दल',
    setting_logout: 'लॉग आउट',
    toast_lang_changed: 'भाषा मराठी निवडली आहे',
    typing_text: 'सायबर रक्षक AI विश्लेषण करत आहे...',
    report_safe_title: 'सुरक्षा तपासणी पूर्ण: सुरक्षित वेब लिंक 🛡️',
    report_danger_title: 'सुरक्षा इशारा: धोकादायक सायबर फसवणूक लिंक! ⚠️'
  },
  ta: {
    lang_name: 'தமிழ்',
    lang_badge: 'TA ▾',
    nav_chat: 'சாட்போட்',
    nav_awareness: 'விழிப்புணர்வு',
    nav_history: 'வரலாறு',
    nav_language: 'மொழி',
    nav_profile: 'சுயவிவரம்',
    groq_active: 'க்ரோக் AI செயல்படுகிறது',
    btn_reset: '🔄 மீட்டமை',
    welcome_title: 'சைபர் ரக்ஷக் AI பாதுகாவலர்',
    welcome_sub: 'க்ரோக் கிளவுட் LLM மூலம் இயங்கும் நேரடி பாதுகாப்பு',
    welcome_body: 'வணக்கம்! நான் உங்கள் 24/7 AI இணைய பாதுகாப்பு உதவியாளர். ஆன்லைன் மோசடிகள், சந்தேகத்திற்கிடமான இணைப்புகள் பற்றி என்னிடம் கேட்கவும்.',
    suggestions_label: 'விரைவு பாதுகாப்பு கேள்விகள் (கேட்க கிளிக் செய்க):',
    chip_electricity: '⚡ மின் கட்டண மோசடி SMS',
    chip_upi: '💳 பணம் பெற UPI PIN தேவையா?',
    chip_helpline: '🚨 1930 உதவி எண் தகவல்',
    chip_arrest: '👮 டிஜிட்டல் கைது மோசடி',
    input_placeholder: 'சைபர் ரக்ஷக்கிடம் கேட்கவும் அல்லது இணைப்பை ஒட்டவும்...',
    academy_sub: 'டிஜிட்டல் பாதுகாப்பு அகாடமி',
    academy_banner_title: 'கற்க. பழகுங்கள். பாதுகாப்பாக இருங்கள்.',
    academy_banner_desc: 'எளிய மொழியில் இலவச பாதுகாப்பு வழிகாட்டிகள்.',
    btn_watch_video: 'விழிப்புணர்வு வீடியோவைப் பாருங்கள்',
    popular_courses: 'பிரபலமான பாடங்கள்',
    course1_title: 'ஆன்லைன் மோசடிகளை அடையாளம் காணுங்கள்',
    course1_desc: 'மோசடிகளை கண்டறிந்து பாதுகாப்பாக இருங்கள்',
    course2_title: 'UPI பாதுகாப்பு மற்றும் பரிவர்த்தனைகள்',
    course2_desc: 'உங்கள் பணத்தைப் பாதுகாக்கவும்',
    course3_title: 'முதியவர்களுக்கான டிஜிட்டல் கல்வி',
    course3_desc: 'பாதுகாப்பான இணையப் பயன்பாடு',
    history_subtitle: 'பாதுகாப்பு விசாரணை வரலாறு',
    lang_subtitle: 'மொழி தேர்வு',
    lang_choose_title: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    lang_choose_sub: 'சைபர் ரக்ஷக் AI க்காக உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    btn_continue_chat: 'சாட்போட்டுக்குச் செல்லவும் →',
    profile_title: 'சுயவிவரம்',
    profile_member: 'சைபர் ரக்ஷக் உறுப்பினர்',
    profile_guest: 'விருந்தினர் பயனர்',
    setting_language: 'மொழி',
    setting_notifications: 'அறிவிப்பு அமைப்புகள்',
    setting_whatsapp: 'வாட்ஸ்அப் பாட்',
    setting_help: 'உதவி & ஆதரவு',
    setting_about: 'சைபர் ரக்ஷக் AI பற்றி',
    setting_logout: 'வெளியேறு',
    toast_lang_changed: 'மொழி தமிழில் மாற்றப்பட்டது',
    typing_text: 'சைபர் ரக்ஷக் AI பகுப்பாய்வு செய்கிறது...',
    report_safe_title: 'பாதுகாப்பு சோதனை முடிந்தது: பாதுகாப்பான இணைப்பு 🛡️',
    report_danger_title: 'பாதுகாப்பு எச்சரிக்கை: அச்சுறுத்தல் கண்டறியப்பட்டது! ⚠️'
  },
  te: {
    lang_name: 'తెలుగు',
    lang_badge: 'TE ▾',
    nav_chat: 'చాట్‌బాట్',
    nav_awareness: 'అవగాహన',
    nav_history: 'చరిత్ర',
    nav_language: 'భాష',
    nav_profile: 'ప్రొఫైల్',
    groq_active: 'గ్రోక్ AI యాక్టివ్',
    btn_reset: '🔄 రీసెట్',
    welcome_title: 'సైబర్ రక్షక్ AI రక్షకుడు',
    welcome_sub: 'గ్రోక్ క్లౌడ్ LLM మరియు రియల్-టైమ్ సెక్యూరిటీ ఆధారితం',
    welcome_body: 'నమస్కారం! నేను మీ 24/7 AI సైబర్ సెక్యూరిటీ అసిస్టెంట్‌ని. ఆన్‌లైన్ మోసాలు, అనుమానాస్పద లింకులు లేదా సందేశాలను తనిఖీ చేయండి.',
    suggestions_label: 'త్వరిత భద్రతా ప్రశ్నలు (అడగడానికి క్లిక్ చేయండి):',
    chip_electricity: '⚡ విద్యుత్ బిల్లు కట్ అయ్యే నకిలీ SMS',
    chip_upi: '💳 డబ్బులు పొందడానికి UPI PIN అవసరమా?',
    chip_helpline: '🚨 1930 హెల్ప్‌లైన్ సమాచారం',
    chip_arrest: '👮 డిజిటల్ అరెస్ట్ పోలీస్ మోసం',
    input_placeholder: 'సైబర్ రక్షక్ AI ని అడగండి లేదా లింక్ పేస్ట్ చేయండి...',
    academy_sub: 'డిజిటల్ సేఫ్టీ అకాడమీ',
    academy_banner_title: 'నేర్చుకోండి. సాధన చేయండి. సురక్షితంగా ఉండండి.',
    academy_banner_desc: 'సరళమైన భాషలో ఉచిత ఇంటరాక్టివ్ పాఠాలు.',
    btn_watch_video: 'అవగాహన వీడియో చూడండి',
    popular_courses: 'ప్రసిద్ధ కోర్సులు',
    course1_title: 'ఆన్‌లైన్ స్కామ్‌లను గుర్తించండి',
    course1_desc: 'మోసాలను గుర్తించి సురక్షితంగా ఉండండి',
    course2_title: 'UPI భద్రత & సురక్షిత లావాదేవీలు',
    course2_desc: 'మీ డబ్బును రక్షించుకోండి',
    course3_title: 'సీనియర్ సిటిజన్లకు డిజిటల్ అక్షరాస్యత',
    course3_desc: 'సురక్షితమైన ఇంటర్నెట్ గైడ్',
    history_subtitle: 'భద్రతా విచారణ చరిత్ర',
    lang_subtitle: 'భాష ఎంపిక',
    lang_choose_title: 'మీ భాషను ఎంచుకోండి',
    lang_choose_sub: 'సైబర్ రక్షక్ AI కోసం మీ భాషను ఎంచుకోండి',
    btn_continue_chat: 'చాట్‌బాట్‌కి కొనసాగండి →',
    profile_title: 'ప్రొఫైల్',
    profile_member: 'సైబర్ రక్షక్ సభ్యుడు',
    profile_guest: 'అతిథి వినియోగదారు',
    setting_language: 'భాష',
    setting_notifications: 'నోటిఫికేషన్ సెట్టింగ్‌లు',
    setting_whatsapp: 'వాట్సాప్ బాట్',
    setting_help: 'సహాయం & మద్దతు',
    setting_about: 'సైబర్ రక్షక్ AI గురించి',
    setting_logout: 'లాగ్ అవుట్',
    toast_lang_changed: 'భాష తెలుగులోకి మార్చబడింది',
    typing_text: 'సైబర్ రక్షక్ AI విశ్లేషిస్తోంది...',
    report_safe_title: 'భద్రతా తనిఖీ పూర్తయింది: సురక్షితమైన లింక్ 🛡️',
    report_danger_title: 'భద్రతా హెచ్చరిక: మోసపూరితమైన లింక్! ⚠️'
  }
};

/**
 * Initialize on DOM Load
 */
document.addEventListener('DOMContentLoaded', () => {
  initScreenPills();
  initLanguageSelector();
  initAwarenessCarousel();
  initCyberQuiz();
  applyLanguage(currentLanguage, false);
  resolveApiBase();
  navigateTo('chat');
});

/**
 * Apply Language Across the Entire Interface
 */
function applyLanguage(langCode, showToast = true) {
  if (!i18n[langCode]) langCode = 'en';
  currentLanguage = langCode;
  localStorage.setItem('cyberrakshak_lang', langCode);
  const dict = i18n[langCode];

  // 1. Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // 2. Update placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });

  // 3. Update Language Badges in Header & Profile
  const chatLangBadge = document.getElementById('chatLangBadge');
  if (chatLangBadge) chatLangBadge.textContent = dict.lang_badge || (langCode.toUpperCase() + ' ▾');

  const profileLangLabel = document.getElementById('profileLangLabel');
  if (profileLangLabel) profileLangLabel.textContent = dict.lang_name + ' ›';

  // 4. Update Language selection card active states
  document.querySelectorAll('.lang-option-card').forEach(card => {
    const isSelected = card.getAttribute('data-lang') === langCode;
    card.classList.toggle('active', isSelected);
  });

  // 5. Update HTML lang attribute
  document.documentElement.lang = langCode;

  if (showToast) {
    toast(dict.toast_lang_changed || `Language set to ${dict.lang_name}`);
  }
}

/**
 * Initialize Language Selector Cards
 */
function initLanguageSelector() {
  const langCards = document.querySelectorAll('.lang-option-card');
  langCards.forEach(card => {
    card.addEventListener('click', () => {
      const selected = card.getAttribute('data-lang') || 'en';
      applyLanguage(selected, true);
    });
  });
}

/**
 * Toast Notification Helper
 */
function toast(message) {
  const toastEl = document.getElementById('toastMessage');
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2600);
}

/**
 * Resolve Backend URL & Verify Groq Connection
 */
async function resolveApiBase() {
  const candidates = [
    '', // Relative if served by Flask directly
    'http://localhost:8080',
    'http://127.0.0.1:8080'
  ];

  for (const base of candidates) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${base}/api/chat/status`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        apiBaseUrl = base;
        isBackendConnected = true;
        isGroqConnected = !!data.groq_connected;
        updateGroqStatusUI(true, data.primary_model || 'Groq Cloud');
        console.log(`✓ CyberRakshak Backend connected at [${base || 'local origin'}]:`, data);
        return base;
      }
    } catch (e) {
      // Try next
    }
  }

  isBackendConnected = false;
  isGroqConnected = false;
  updateGroqStatusUI(false);
  return '';
}

function updateGroqStatusUI(connected, modelName = '') {
  const badge = document.getElementById('groqStatusBadge');
  if (!badge) return;
  const dict = i18n[currentLanguage] || i18n.en;
  if (connected) {
    badge.className = 'header-status-indicator online';
    badge.innerHTML = `<span class="status-dot"></span> <span class="status-text">${dict.groq_active || '24/7 AI Protected'}</span>`;
  } else {
    badge.className = 'header-status-indicator offline';
    badge.innerHTML = `<span class="status-dot"></span> <span class="status-text">Connecting...</span>`;
  }
}

/**
 * Screen Navigation
 */
function navigateTo(targetScreen) {
  const allScreens = document.querySelectorAll('.screen-page');
  allScreens.forEach(sc => sc.classList.remove('active'));

  const targetEl = document.getElementById(`screen-${targetScreen}`);
  if (targetEl) {
    targetEl.classList.add('active');
    currentScreen = targetScreen;
  }

  // Update Bottom Nav Tabs
  const allTabs = document.querySelectorAll('.bottom-tab-item');
  allTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === targetScreen);
  });

  // Update Top Quick Pills
  const allPills = document.querySelectorAll('.screen-pill-btn');
  allPills.forEach(pill => {
    pill.classList.toggle('active', pill.dataset.target === targetScreen);
  });

  const scrollArea = targetEl?.querySelector('.screen-scroll-container') || targetEl?.querySelector('.chat-thread');
  if (scrollArea) {
    scrollArea.scrollTop = 0;
  }
}

function initScreenPills() {
  const pills = document.querySelectorAll('.screen-pill-btn');
  pills.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      if (target) navigateTo(target);
    });
  });
}

function clearAllHistory() {
  const chatList = document.getElementById('chatHistoryList');
  if (chatList) {
    chatList.innerHTML = `
      <div class="empty-history-box">
        <div class="empty-history-icon">🕒</div>
        <p>No recent inquiries</p>
        <small>Ask the Chatbot any security questions to see logs here.</small>
      </div>
    `;
  }
  toast('Inquiry history cleared.');
}

/**
 * Markdown & Format Helper for Groq Chatbot Responses
 */
function formatMarkdown(text) {
  if (!text) return '';
  let escaped = escapeHtml(text);

  // Bold
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic
  escaped = escaped.replace(/(^|[^\*])\*(?!\*)([^\*]+)\*(?!\*)/g, '$1<em>$2</em>');

  // Inline code
  escaped = escaped.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

  // National Cyber Helpline: 1930
  escaped = escaped.replace(/\b1930\b/g, '<a href="tel:1930" class="chat-helpline-link" title="Call National Cyber Crime Helpline">🚨 1930 (Dial)</a>');

  // Official portal links: cybercrime.gov.in
  escaped = escaped.replace(/(https?:\/\/cybercrime\.gov\.in[^\s<]*)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="chat-ext-link">$1 ↗</a>');
  escaped = escaped.replace(/\bcybercrime\.gov\.in\b/g, '<a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" class="chat-ext-link">cybercrime.gov.in ↗</a>');

  // Split into lines for list processing
  const lines = escaped.split('\n');
  let inBulletList = false;
  let inNumberedList = false;
  let formatted = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      if (inNumberedList) {
        formatted.push('</ol>');
        inNumberedList = false;
      }
      if (!inBulletList) {
        formatted.push('<ul class="chat-bullet-list">');
        inBulletList = true;
      }
      formatted.push(`<li>${trimmed.substring(2)}</li>`);
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (inBulletList) {
        formatted.push('</ul>');
        inBulletList = false;
      }
      if (!inNumberedList) {
        formatted.push('<ol class="chat-numbered-list">');
        inNumberedList = true;
      }
      formatted.push(`<li>${trimmed.replace(/^\d+\.\s*/, '')}</li>`);
    } else {
      if (inBulletList) {
        formatted.push('</ul>');
        inBulletList = false;
      }
      if (inNumberedList) {
        formatted.push('</ol>');
        inNumberedList = false;
      }
      if (trimmed) {
        formatted.push(`<p class="chat-p">${trimmed}</p>`);
      }
    }
  }

  if (inBulletList) formatted.push('</ul>');
  if (inNumberedList) formatted.push('</ol>');

  return formatted.join('');
}

/**
 * Send Quick Suggestion Prompt
 */
function sendQuickPrompt(promptText) {
  navigateTo('chat');
  const input = document.getElementById('chatMessageInput');
  if (input) {
    input.value = promptText;
    handleSendMessage();
  }
}

/**
 * Reset / Clear Chat Thread with localized welcome
 */
function clearChatThread() {
  chatHistory = [];
  const thread = document.getElementById('chatThread');
  if (!thread) return;
  const dict = i18n[currentLanguage] || i18n.en;

  thread.innerHTML = `
    <div class="chat-welcome-card">
      <div class="welcome-bot-header">
        <div class="welcome-bot-avatar">
          <img src="assets/robot.jpg" alt="CyberRakshak AI">
          <span class="online-ring"></span>
        </div>
        <div class="welcome-bot-titles">
          <div class="bot-name-badge">
            <h3>${dict.welcome_title}</h3>
            <span class="shield-verified-tag">✓ 24/7 AI Shield</span>
          </div>
          <p class="welcome-subtitle">${dict.welcome_sub}</p>
        </div>
      </div>
      <p class="welcome-text">${dict.welcome_body}</p>
      <div class="chat-suggestions-box">
        <div class="suggestions-header">
          <span class="suggestions-sparkle">✨</span>
          <span class="suggestions-label">${dict.suggestions_label}</span>
        </div>
        <div class="suggestions-chips-grid">
          <button class="chip-btn" onclick="sendQuickPrompt('Someone sent me an electricity bill disconnection notice asking to call a phone number. Is this a scam?')">
            <span class="chip-emoji">⚡</span>
            <span>${dict.chip_electricity}</span>
          </button>
          <button class="chip-btn" onclick="sendQuickPrompt('Do I ever need to enter my UPI PIN to receive cashback or money?')">
            <span class="chip-emoji">💳</span>
            <span>${dict.chip_upi}</span>
          </button>
          <button class="chip-btn" onclick="sendQuickPrompt('What is the 1930 Cyber Helpline and when should I call it?')">
            <span class="chip-emoji">🚨</span>
            <span>${dict.chip_helpline}</span>
          </button>
          <button class="chip-btn" onclick="sendQuickPrompt('What is a digital arrest scam and what should I do if someone calls from police via Skype?')">
            <span class="chip-emoji">👮</span>
            <span>${dict.chip_arrest}</span>
          </button>
        </div>
      </div>
    </div>
  `;
  toast('Chat conversation reset.');
}

/**
 * Copy bot response text to clipboard
 */
function copyReplyText(btn) {
  const wrapper = btn.closest('.bot-bubble-wrapper');
  const content = wrapper?.querySelector('.bot-bubble-content')?.innerText || '';
  if (content) {
    navigator.clipboard.writeText(content).then(() => {
      toast('Copied response to clipboard!');
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = '📋'; }, 1500);
    }).catch(() => toast('Could not copy'));
  }
}

/**
 * Send Quick Pre-defined or Custom Prompts
 */
function sendQuickPrompt(promptText) {
  if (!promptText) return;
  if (currentScreen !== 'chat') {
    navigateTo('chat');
  }
  const input = document.getElementById('chatMessageInput');
  if (input) {
    input.value = promptText;
    const thread = document.getElementById('chatThread');
    if (thread) {
      setTimeout(() => { thread.scrollTop = thread.scrollHeight; }, 50);
    }
    handleSendMessage();
  }
}

/**
 * Action 1: Verify Link - Focus & Pre-fill URL scanner prompt
 */
function promptVerifyLink() {
  if (currentScreen !== 'chat') {
    navigateTo('chat');
  }
  const input = document.getElementById('chatMessageInput');
  if (input) {
    input.value = 'Please check and verify this link for phishing: ';
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    toast('🔗 Paste your link after the prompt to scan');
    const thread = document.getElementById('chatThread');
    if (thread) {
      setTimeout(() => { thread.scrollTop = thread.scrollHeight; }, 100);
    }
  }
}

/**
 * Action 4: Dial 1930 Cyber Helpline
 */
function call1930Helpline() {
  toast('🚨 Calling National Cyber Crime Helpline 1930...');
  window.location.href = 'tel:1930';
}

/**
 * Smoothly slide down to the answer in the chatbot
 */
function slideDownToAnswer(smooth = true) {
  const thread = document.getElementById('chatThread');
  if (!thread) return;

  const behavior = smooth ? 'smooth' : 'auto';

  // 1. Scroll internal thread container
  try {
    thread.scrollTo({
      top: thread.scrollHeight,
      behavior: behavior
    });
  } catch (e) {
    thread.scrollTop = thread.scrollHeight;
  }

  // 2. Scroll window to bottom so answer slides cleanly into view above docked input
  const scrollTarget = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    thread.offsetTop + thread.scrollHeight
  );

  try {
    window.scrollTo({
      top: scrollTarget,
      behavior: behavior
    });
  } catch (e) {}

  // 3. Scroll last message into view
  const lastMsg = thread.lastElementChild;
  if (lastMsg && typeof lastMsg.scrollIntoView === 'function') {
    try {
      lastMsg.scrollIntoView({
        behavior: behavior,
        block: 'end'
      });
    } catch (e) {}
  }
}

/**
 * Chatbot with Live Groq LLM & Multilingual ML Threat Model Integration
 */
async function handleSendMessage() {
  const input = document.getElementById('chatMessageInput');
  const sendBtn = document.getElementById('sendChatBtn');
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;

  const thread = document.getElementById('chatThread');
  if (!thread) return;

  const dict = i18n[currentLanguage] || i18n.en;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Append User Message
  const userHtml = `
    <div class="chat-row user-side">
      <div class="user-bubble">
        <p>${escapeHtml(message)}</p>
        <div class="bubble-meta">${timeStr} <span class="blue-ticks">✓✓</span></div>
      </div>
    </div>
  `;
  thread.insertAdjacentHTML('beforeend', userHtml);
  input.value = '';
  if (sendBtn) sendBtn.disabled = true;

  // 2. Append Animated Groq Thinking Indicator
  const typingId = 'typing-' + Date.now();
  const typingHtml = `
    <div class="chat-row bot-side typing-row" id="${typingId}">
      <div class="bot-avatar-thumb">
        <img src="assets/robot.jpg" alt="CyberRakshak Bot">
      </div>
      <div class="bot-bubble-wrapper">
        <div class="groq-thinking-bubble">
          <span class="thinking-glow"></span>
          <span class="thinking-text">${dict.typing_text || 'CyberRakshak AI is analyzing with Groq...'}</span>
          <span class="dots"><span>.</span><span>.</span><span>.</span></span>
        </div>
      </div>
    </div>
  `;
  thread.insertAdjacentHTML('beforeend', typingHtml);
  slideDownToAnswer(true);

  // Track user message in history
  chatHistory.push({ role: 'user', content: message });

  try {
    if (!apiBaseUrl) {
      await resolveApiBase();
    }
    const targetUrl = `${apiBaseUrl}/api/chat`;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: chatHistory.slice(-6),
        language: currentLanguage
      })
    });

    // Remove typing bubble
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    let botReplyHtml = '';
    if (data.is_analysis) {
      const isSafe = data.risk_level === 'Safe';
      botReplyHtml = `
        <div class="chat-row bot-side">
          <div class="bot-avatar-thumb">
            <img src="assets/robot.jpg" alt="CyberRakshak Bot">
          </div>
          <div class="bot-bubble-wrapper">
            <p class="bot-speech-intro">${isSafe ? (dict.report_safe_title || "Security Scan Complete: Verified Safe Link. 🛡️") : (dict.report_danger_title || "Security Alert: Threat patterns detected! ⚠️")}</p>
            <div class="scam-report-card ${isSafe ? 'card-safe' : 'card-danger'}">
              <div class="report-row">
                <span class="report-label">Risk Level:</span>
                <span class="${isSafe ? 'badge-safe-risk' : 'badge-high-risk'}">${data.risk_level}</span>
              </div>
              <div class="report-row">
                <span class="report-label">Analysis Result:</span>
                <b class="report-val">${escapeHtml(data.type_name || 'URL Link Analysis')}</b>
              </div>
              <div class="report-group">
                <span class="report-label">Forensic Indicators (Confidence: ${data.probability}%):</span>
                <ul class="indicators-bullet-list ${isSafe ? 'bullets-safe' : ''}">
                  ${(data.indicators || []).map(ind => `<li>${escapeHtml(ind)}</li>`).join('')}
                </ul>
              </div>
              <div class="report-group">
                <span class="report-label">Safety Recommendation:</span>
                <p class="rec-paragraph">${escapeHtml(data.recommendation)}</p>
              </div>
              <div class="report-btn-row">
                <button class="report-action-btn primary" onclick="toast('Threat analysis verified by Groq LLM &amp; ML models')">Verified by AI 🛡️</button>
                ${!isSafe ? '<button class="report-action-btn danger" onclick="openReportModal()">🚨 Report to 1930</button>' : ''}
              </div>
            </div>
            <div class="bubble-meta bot-meta">${timeStr} · Hybrid ML &amp; Groq AI</div>
          </div>
        </div>
      `;
      chatHistory.push({ role: 'assistant', content: `[${data.risk_level} Risk: ${data.type_name}] ${data.recommendation}` });
    } else {
      const formatted = formatMarkdown(data.reply);
      const modelLabel = data.model ? `<span class="model-tag">⚡ ${data.model}</span>` : '<span class="model-tag">⚡ Groq LLM</span>';
      botReplyHtml = `
        <div class="chat-row bot-side">
          <div class="bot-avatar-thumb">
            <img src="assets/robot.jpg" alt="CyberRakshak Bot">
          </div>
          <div class="bot-bubble-wrapper">
            <div class="bot-bubble-content">
              ${formatted}
            </div>
            <div class="bubble-meta bot-meta">
              <span>${timeStr}</span>
              ${modelLabel}
              <button class="copy-bubble-btn" onclick="copyReplyText(this)" title="Copy response">📋</button>
            </div>
          </div>
        </div>
      `;
      chatHistory.push({ role: 'assistant', content: data.reply });
    }

    thread.insertAdjacentHTML('beforeend', botReplyHtml);
    slideDownToAnswer(true);
    setTimeout(() => slideDownToAnswer(true), 80);
    setTimeout(() => slideDownToAnswer(true), 250);
  } catch (err) {
    console.error('Chat API error:', err);
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();

    const errorHtml = `
      <div class="chat-row bot-side">
        <div class="bot-avatar-thumb">
          <img src="assets/robot.jpg" alt="CyberRakshak Bot">
        </div>
        <div class="bot-bubble-wrapper">
          <div class="bot-bubble-content error-box">
            <p><strong>⚠️ Backend Connection Required:</strong> Unable to connect to the CyberRakshak backend server.</p>
            <p style="margin-top:6px;font-size:12px;">Ensure the Python server is running on port 8080:<br><code>python server.py</code></p>
            <button class="retry-connection-btn" onclick="resolveApiBase().then(() => toast('Re-checked server status!'))">🔄 Retry Connection</button>
          </div>
          <div class="bubble-meta bot-meta">${timeStr}</div>
        </div>
      </div>
    `;
    thread.insertAdjacentHTML('beforeend', errorHtml);
    slideDownToAnswer(true);
    setTimeout(() => slideDownToAnswer(true), 80);
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement?.id === 'chatMessageInput') {
    handleSendMessage();
  }
});

/**
 * Modals
 */
function openCommonModal(title, htmlContent) {
  const modal = document.getElementById('commonModal');
  const container = document.getElementById('modalCustomContent');
  if (!modal || !container) return;

  container.innerHTML = `
    <h3 style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:700;color:#1e1b4b;margin-bottom:8px;">${title}</h3>
    <div style="font-size:13px;color:#475569;line-height:1.6;">${htmlContent}</div>
  `;
  modal.classList.add('active');
}

function closeCommonModal() {
  const modal = document.getElementById('commonModal');
  if (modal) modal.classList.remove('active');
}

document.getElementById('commonModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'commonModal') closeCommonModal();
});

function openAwarenessModal() {
  openCommonModal('Cyber Safety Awareness Video', `
    <div style="padding:4px 0 10px;">
      <div class="yt-video-responsive" style="border-radius:12px;margin-bottom:12px;">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/usMDVaxdEHY?si=fE5yn4Wt1FiX2My5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
      <p style="font-weight:700;font-size:15px;color:#1e1b4b;margin-bottom:6px;">Official Cyber Safety &amp; Scam Prevention</p>
      <p style="margin-bottom:14px;color:#64748b;font-size:12.5px;line-height:1.45;">Watch this essential cybersecurity briefing to identify fake messages, fraudulent bank alerts, and phishing traps.</p>
      <div style="display:flex;gap:10px;">
        <button class="primary-action-btn glow-btn" onclick="switchNav('screen-academy');closeCommonModal();" style="flex:1;">View All 4 Videos in Awareness →</button>
        <button class="slide-call-btn" onclick="window.location.href='tel:1930'" style="padding:10px 14px;border-radius:14px;">📞 1930</button>
      </div>
    </div>
  `);
}

function openReportModal() {
  openCommonModal('Emergency Fraud Reporting', `
    <p style="margin-bottom:12px;">If you have experienced online fraud, act promptly to secure your bank accounts:</p>
    <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:14px;margin-bottom:14px;">
      <b style="color:#b91c1c;display:block;margin-bottom:4px;font-size:14px;">🚨 National Cyber Helpline:</b>
      <a href="tel:1930" style="color:#dc2626;font-size:22px;font-weight:800;text-decoration:none;">Dial 1930</a>
      <small style="display:block;color:#7f1d1d;margin-top:4px;">Call immediately within Golden Hour (2 hrs) to freeze fraudulent money transfers.</small>
    </div>
    <div style="background:#f1f5f9;border-radius:12px;padding:12px;margin-bottom:16px;">
      <b>Government Portal:</b> <a href="https://cybercrime.gov.in" target="_blank" style="color:#4f46e5;font-weight:600;">cybercrime.gov.in ↗</a>
    </div>
    <button class="primary-action-btn glow-btn" onclick="toast('Incident report draft saved');closeCommonModal();">Submit Incident Report</button>
  `);
}

function openWhatsAppFlow() {
  openCommonModal('WhatsApp Scam Protection', `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      <div style="width:42px;height:42px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;">💬</div>
      <div>
        <b style="font-size:15px;">Status: Connected</b><br>
        <small style="color:#10b981;font-weight:600;">Active 24/7 Protection</small>
      </div>
    </div>
    <p style="margin-bottom:14px;">Forward suspicious messages or loan offers to the CyberRakshak WhatsApp Assistant at <b>+91 90000-SAFE-1</b> for instant verification before sharing with family.</p>
    <button class="primary-action-btn glow-btn" onclick="toast('WhatsApp Safety Bot connected');closeCommonModal();">Open in WhatsApp</button>
  `);
}

function openCourseDetail(title, desc) {
  openCommonModal(title, `
    <p style="margin-bottom:12px;color:#334155;font-size:14px;">${desc}</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:16px;">
      <b style="color:#1e1b4b;display:block;margin-bottom:8px;">Lesson Curriculum:</b>
      <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#475569;">
        <span>✓ <b>Module 1:</b> The Psychology of Indian Online Scams</span>
        <span>✓ <b>Module 2:</b> Red Flags in SMS, WhatsApp &amp; UPI Collect Requests</span>
        <span>✓ <b>Module 3:</b> Golden Hour Emergency Action Plan (Dial 1930)</span>
      </div>
    </div>
    <button class="primary-action-btn glow-btn" onclick="toast('Lesson started!');closeCommonModal();">Start Free Lesson</button>
  `);
}

function openNotificationModal() {
  openCommonModal('Notification Settings', `
    <div style="display:flex;flex-direction:column;gap:14px;margin:10px 0 18px;">
      <label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;">
        <span>Real-time Phishing Alerts</span>
        <input type="checkbox" checked style="accent-color:#4f46e5;width:18px;height:18px;">
      </label>
      <label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;">
        <span>WhatsApp Forward Warnings</span>
        <input type="checkbox" checked style="accent-color:#4f46e5;width:18px;height:18px;">
      </label>
      <label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;">
        <span>Weekly Digital Safety Digest</span>
        <input type="checkbox" style="accent-color:#4f46e5;width:18px;height:18px;">
      </label>
    </div>
    <button class="primary-action-btn glow-btn" onclick="toast('Notification preferences saved');closeCommonModal();">Save Preferences</button>
  `);
}

function openHelpSupportModal() {
  openCommonModal('Help & Support', `
    <p style="margin-bottom:12px;">Need assistance with scam verification or app settings?</p>
    <div style="background:#f8fafc;padding:12px;border-radius:10px;margin-bottom:12px;">
      <p style="margin-bottom:6px;"><b>Email:</b> support@cyberrakshak.ai</p>
      <p style="margin-bottom:6px;"><b>Toll Free:</b> 1800-CYBER-SHIELD</p>
      <p><b>National Cyber Helpline:</b> 1930</p>
    </div>
    <button class="primary-action-btn glow-btn" onclick="closeCommonModal()">Close</button>
  `);
}

function openAboutModal() {
  openCommonModal('About CyberRakshak AI', `
    <p style="margin-bottom:10px;"><b>CyberRakshak AI</b> is an intelligent digital safety companion engineered to shield citizens against online fraud, phishing links, and social engineering threats.</p>
    <p style="color:#64748b;font-size:12px;margin-bottom:14px;">Powered by Scikit-Learn Hybrid Threat Classifiers and Groq Cloud 27B LLM.<br>Version 2.5.0 (Build 2026.10)</p>
    <button class="primary-action-btn glow-btn" onclick="closeCommonModal()">OK</button>
  `);
}

function handleLogout() {
  chatHistory = [];
  toast('Signed out from guest session');
  clearChatThread();
  navigateTo('chat');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * ==================== AWARENESS SLIDESHOW CAROUSEL CONTROLLER ====================
 */
let currentSlideIndex = 0;
let carouselTimer = null;
const totalSlides = 4;

function initAwarenessCarousel() {
  const carousel = document.getElementById('awarenessCarousel');
  if (!carousel) return;

  goToSlide(0);
  startCarouselTimer();

  carousel.addEventListener('mouseenter', () => pauseCarouselTimer());
  carousel.addEventListener('mouseleave', () => startCarouselTimer());
  carousel.addEventListener('touchstart', () => pauseCarouselTimer(), { passive: true });
  carousel.addEventListener('touchend', () => startCarouselTimer(), { passive: true });
}

function startCarouselTimer() {
  pauseCarouselTimer();
  carouselTimer = setInterval(() => {
    nextSlide();
  }, 4500);
}

function pauseCarouselTimer() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

function goToSlide(index) {
  const track = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('#carouselDots .dot');
  if (!track) return;

  if (index < 0) index = totalSlides - 1;
  if (index >= totalSlides) index = 0;
  currentSlideIndex = index;

  track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlideIndex);
  });
}

function nextSlide() {
  goToSlide(currentSlideIndex + 1);
}

function prevSlide() {
  goToSlide(currentSlideIndex - 1);
}

/**
 * ==================== AI CYBER SAFETY VIDEOS CONTROLLER ====================
 */
const aiVideosData = {
  deepfake: {
    title: 'AI Deepfake Voice & Face Clone Scams',
    badge: 'AI Threat Breakdown',
    thumb: 'assets/deepfake_video_thumb.jpg',
    duration: '3:45 min',
    desc: 'Criminal syndicates now use voice cloning AI tools that require only 3 seconds of WhatsApp voice note audio to clone a child or parent voice, demanding urgent bail or hospital deposits.',
    takeaways: [
      'Always set up a secret family safety keyword for emergency claims.',
      'Call the family member back on their regular cellular number immediately.',
      'Never transfer money to third-party bank accounts or QR codes under panic.'
    ],
    prompt: 'How do scammers clone voices using AI and what should I do if a relative calls asking for emergency bail money?'
  },
  digital_arrest: {
    title: 'Digital Arrest: Inside Fake Police Stations',
    badge: 'High Risk Alert',
    thumb: 'assets/digital_arrest_fraud.png',
    duration: '4:20 min',
    desc: 'Deceptive criminal syndicates set up fake Skype studio sets designed to look like CBI or Police stations, presenting forged Supreme Court arrest warrants and threatening immediate detention unless money is transferred into "RBI verification accounts".',
    takeaways: [
      'Indian Police and Enforcement Directorate NEVER arrest or summon citizens over Skype or video calls.',
      'There is no legal concept called "Digital Arrest" under Indian Law or Bharatiya Nyaya Sanhita.',
      'Immediately hang up video calls, take screenshots, and dial 1930.'
    ],
    prompt: 'What is a digital arrest scam and what should I do if someone calls from police via Skype?'
  },
  portal_1930: {
    title: 'Golden Hour FIR & Helpline 1930 Guide',
    badge: 'Govt Portal Guide',
    thumb: 'assets/portal_cybercrime.png',
    duration: '2:50 min',
    desc: 'The National Cyber Crime Helpline (1930) operates Citizen Financial Cyber Fraud Reporting System. If reported within 2 hours of money debit, the system triggers real-time holds across 55+ Indian banks.',
    takeaways: [
      'Dial 1930 within the 2-hour Golden Hour with your transaction ID & bank account number.',
      'Log into cybercrime.gov.in and complete the official cyber fraud complaint acknowledgment.',
      'Never pay any private third-party recovery agents claiming to recover lost money.'
    ],
    prompt: 'What is the 1930 Cyber Helpline and when should I call it?'
  },
  upi_qr: {
    title: "The Truth About 'Scan QR to Receive Money'",
    badge: 'Payment Defense',
    thumb: 'assets/stop_fraud.png',
    duration: '3:15 min',
    desc: 'Fraudsters post fake OLX buyer inquiries or claim cashback, sending a QR code with the caption "Scan to Receive Rs. 25,000". Scanning or typing your UPI PIN is cryptographically designed ONLY to DEBIT your account.',
    takeaways: [
      'Golden Rule: You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money.',
      'UPI collect requests asking for confirmation will deduct funds from your account.',
      'Block and report fraudulent UPI handles immediately through your banking app.'
    ],
    prompt: 'Do I ever need to enter my UPI PIN to receive cashback or money?'
  }
};

function openVideoPlayer(videoId) {
  const video = aiVideosData[videoId] || aiVideosData.deepfake;
  const modal = document.getElementById('videoModal');
  const body = document.getElementById('videoModalBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="player-screen-wrap">
      <img src="${video.thumb}" alt="${video.title}">
      <div class="play-pulse-btn" style="position:absolute;z-index:3;cursor:pointer;" onclick="toast('Playing simulation: ${video.title}')">▶</div>
      <div class="player-controls-bar">
        <div class="player-progress-track">
          <div class="player-progress-fill"></div>
        </div>
        <div class="player-bottom-btns">
          <span>▶ Playing (1:12 / ${video.duration})</span>
          <span>1080p HD · AI Cyber Defense</span>
        </div>
      </div>
    </div>
    <div class="player-modal-content">
      <span class="video-badge-tag tag-cyan" style="position:static;display:inline-block;margin-bottom:8px;">${video.badge}</span>
      <h3>${video.title}</h3>
      <p>${video.desc}</p>
      <div class="takeaway-box">
        <b>Key Cyber Defense Takeaways:</b>
        <ul>
          ${video.takeaways.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="primary-action-btn glow-btn" onclick="closeVideoModal();sendQuickPrompt('${video.prompt}')" style="flex:1;">Ask Chatbot About This →</button>
        <button class="slide-call-btn" onclick="window.location.href='tel:1930'" style="padding:10px 14px;border-radius:14px;">📞 1930</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  if (modal) modal.classList.remove('active');
}

document.getElementById('videoModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'videoModal') closeVideoModal();
});

/**
 * ==================== CYBER SAFETY IQ QUIZ ENGINE ====================
 * 10 Real-World Cybersecurity Scenarios with Live Feedback & Score Evaluation
 */
const cyberQuizData = [
  {
    id: 1,
    icon: '💳',
    category: 'UPI & Payment Defense',
    scenario: 'You receive a payment request on PhonePe / Google Pay stating: "Scan QR code or enter your UPI PIN to claim ₹2,500 festive cashback reward". What is the correct action?',
    options: [
      { text: 'Enter your 4 or 6 digit UPI PIN immediately to claim the money into your account.', isCorrect: false },
      { text: 'Decline immediately! You NEVER need to enter a UPI PIN or scan a QR code to receive money.', isCorrect: true },
      { text: 'Scan the QR code and enter 0000 as default verification PIN.', isCorrect: false },
      { text: 'Forward the QR code to 5 WhatsApp friends to test if cashback works.', isCorrect: false }
    ],
    explanation: 'Golden Rule of UPI: Entering your UPI PIN is cryptographically designed ONLY to DEBIT (deduct) money from your account. You NEVER enter a PIN to receive cashback or money!'
  },
  {
    id: 2,
    icon: '👮',
    category: 'Digital Arrest Threat',
    scenario: 'A caller in police uniform on a Skype video call shows an arrest warrant from the Supreme Court / CBI, claiming your Aadhaar is linked to money laundering and demanding money transfer for "verification". What is this?',
    options: [
      { text: 'A routine digital bail procedure conducted by central police agencies.', isCorrect: false },
      { text: 'A genuine CBI interrogation that requires staying in room detention.', isCorrect: false },
      { text: 'A fake Digital Arrest scam! Real police & CBI never interrogate or demand money transfers over video calls.', isCorrect: true },
      { text: 'A mandatory confidential Reserve Bank of India safety audit.', isCorrect: false }
    ],
    explanation: 'There is NO concept of "Digital Arrest" under Indian Law. Real police, ED, and CBI officers never interrogate citizens, show arrest warrants, or demand money transfers via Skype video calls. Hang up and dial 1930.'
  },
  {
    id: 3,
    icon: '⚡',
    category: 'Electricity Bill Disconnection SMS',
    scenario: 'You get an SMS: "Dear consumer, your electricity will be disconnected tonight at 9:30 PM due to unpaid bill. Immediately call officer at 9876543210 or install QuickSupport.apk". What should you do?',
    options: [
      { text: 'Download and install the APK file to urgently update your bill status.', isCorrect: false },
      { text: 'Call the mobile number and provide your debit card details to clear the bill.', isCorrect: false },
      { text: 'Ignore the SMS and verify your actual bill status only on the official electricity discom portal or app.', isCorrect: true },
      { text: 'Send your Aadhaar and bank passbook photo via WhatsApp to the officer.', isCorrect: false }
    ],
    explanation: 'Power discoms never send disconnection threats from personal 10-digit mobile numbers with third-party APK links. These APK files install remote trojans that steal your banking passwords and SMS OTPs.'
  },
  {
    id: 4,
    icon: '📲',
    category: 'Remote Screen Sharing Apps',
    scenario: 'A "bank customer care executive" calls asking you to install AnyDesk, TeamViewer, or RustDesk on your phone and share the 9-digit code to refund a failed transaction. What will happen if you agree?',
    options: [
      { text: 'The technician safely fixes software bugs and removes viruses from your phone.', isCorrect: false },
      { text: 'The fraudster gets full live remote screen control to read incoming OTPs and drain your bank account.', isCorrect: true },
      { text: 'It automatically verifies your KYC credentials with RBI servers.', isCorrect: false },
      { text: 'It boosts your 5G network speeds and signal strength.', isCorrect: false }
    ],
    explanation: 'Never install screen-sharing apps or share 9-digit codes with unknown callers. Once connected, fraudsters watch your screen live, view your banking credentials, read incoming OTPs, and steal your money.'
  },
  {
    id: 5,
    icon: '📦',
    category: 'Customs & Courier Parcel Scams',
    scenario: 'An automated IVR call states: "Your FedEx parcel to Taiwan with contraband narcotics and fake passports was seized by Customs. Press 1 to connect with Cyber Crime Police". How should you react?',
    options: [
      { text: 'Press 1 and agree to pay a "customs clearance penalty" via UPI to avoid arrest.', isCorrect: false },
      { text: 'Hang up immediately! Customs and courier agencies never settle contraband seizures via telephone money transfers.', isCorrect: true },
      { text: 'Send a photo of your debit card front and back to clear your name.', isCorrect: false },
      { text: 'Transfer your life savings into a temporary "safe government account" for auditing.', isCorrect: false }
    ],
    explanation: 'Customs departments and international couriers never settle contraband matters over phone calls, nor do they ask citizens to transfer money to "clear their name". Disconnect immediately.'
  },
  {
    id: 6,
    icon: '💼',
    category: 'Work From Home / Task Scams',
    scenario: 'A Telegram recruiter offers ₹3,000–₹8,000 daily for liking YouTube videos. After paying you ₹300 initially, they ask you to deposit ₹25,000 for "Crypto VIP tasks with 30% bonus". What is this?',
    options: [
      { text: 'A legitimate online freelance part-time digital marketing agency.', isCorrect: false },
      { text: 'A task-based cyber fraud syndicate designed to siphon your deposit and lock your account.', isCorrect: true },
      { text: 'An official YouTube creator monetization affiliate scheme.', isCorrect: false },
      { text: 'A government certified youth skill development program.', isCorrect: false }
    ],
    explanation: 'Classic Task Scam formula: syndicates pay small token payouts initially to build trust, entice victims into depositing larger amounts under the lure of high returns, and then vanish with the funds.'
  },
  {
    id: 7,
    icon: '🚨',
    category: 'Golden Hour Emergency Response',
    scenario: 'If someone in your family has unfortunately transferred money to an online fraudster 30 minutes ago, what is the single most critical action to take right now?',
    options: [
      { text: 'Wait 3 to 5 business days to see if the bank automatically reverses the charge.', isCorrect: false },
      { text: 'Post a complaint tweet on social media tagging influencers.', isCorrect: false },
      { text: 'Call National Cyber Helpline 1930 immediately within the 2-hour Golden Hour to freeze bank accounts.', isCorrect: true },
      { text: 'Pay an online "recovery hacker" on Instagram who claims they can hack the money back.', isCorrect: false }
    ],
    explanation: 'Calling 1930 within the first 2 hours (Golden Hour) alerts the Indian Financial Cyber Fraud Reporting System, triggering automated lien holds across 55+ participating banks to freeze the money.'
  },
  {
    id: 8,
    icon: '🔗',
    category: 'Phishing & Domain Verification',
    scenario: 'You receive an SMS: "SBI Account Suspended. Update PAN immediately to avoid closure: http://sbi-card-kyc-verify.serveo.net". How do you identify this as a phishing attack?',
    options: [
      { text: 'The domain uses free tunnel hosting (serveo.net) instead of official bank domain (onlinesbi.sbi).', isCorrect: false },
      { text: 'Banks never threaten sudden account suspension without official branch notice.', isCorrect: false },
      { text: 'Banks never ask you to input netbanking passwords or MPIN on SMS web links.', isCorrect: false },
      { text: 'All of the above are major red flags of a fraudulent phishing attack.', isCorrect: true }
    ],
    explanation: 'All of the above! CyberRakshak AI flags such links because genuine banks exclusively use their verified root domains (e.g., .sbi, hdfcbank.com, icicibank.com) and never free subdomains or tunnel URLs.'
  },
  {
    id: 9,
    icon: '🛵',
    category: 'Delivery OTP Trap',
    scenario: 'A courier delivery boy calls: "Sir, I have your package. To confirm delivery address, tell me the 6-digit OTP just sent to your phone". The SMS says "OTP for Netbanking Password Reset". What should you do?',
    options: [
      { text: 'Read the OTP to him quickly so he delivers the package to your home.', isCorrect: false },
      { text: 'Never share the OTP! Read the SMS text carefully — genuine delivery OTPs never say password reset.', isCorrect: true },
      { text: 'Tell him only the first 3 digits of the OTP.', isCorrect: false },
      { text: 'Send a screenshot of the OTP SMS to his personal WhatsApp.', isCorrect: false }
    ],
    explanation: 'Always read the exact message attached to an OTP! Fraudsters trigger password resets or SIM swaps while falsely claiming it is just a routine parcel or food delivery confirmation OTP.'
  },
  {
    id: 10,
    icon: '📶',
    category: 'Public Wi-Fi & Cyber Hygiene',
    scenario: 'You are waiting at a railway station or airport with free public Wi-Fi. You need to send ₹15,000 to a friend via banking app. What is the safest cybersecurity practice?',
    options: [
      { text: 'Connect to the free open Wi-Fi and make the payment as quickly as possible.', isCorrect: false },
      { text: 'Disconnect from public Wi-Fi and switch to your private mobile cellular data (4G/5G) for banking.', isCorrect: true },
      { text: 'Ask a stranger to hotspot from their device instead.', isCorrect: false },
      { text: 'Disable your phone lock password while on public Wi-Fi to speed up apps.', isCorrect: false }
    ],
    explanation: 'Unencrypted public Wi-Fi networks are vulnerable to Man-in-the-Middle (MitM) packet sniffing and fake hotspot clones. Always switch to mobile cellular data for sensitive banking transactions.'
  }
];

let currentQuizIndex = 0;
let userQuizScore = 0;
let isAnswerSubmitted = false;

function initCyberQuiz() {
  currentQuizIndex = 0;
  userQuizScore = 0;
  isAnswerSubmitted = false;
  renderQuiz();
}

function renderQuiz() {
  const container = document.getElementById('quizContainer');
  const badge = document.getElementById('quizHeaderBadge');
  if (!container) return;

  if (currentQuizIndex >= cyberQuizData.length) {
    renderQuizResults(container, badge);
    return;
  }

  const q = cyberQuizData[currentQuizIndex];
  const qNum = currentQuizIndex + 1;
  const total = cyberQuizData.length;
  const pct = Math.round((qNum / total) * 100);

  if (badge) badge.textContent = `Scenario ${qNum} of ${total}`;

  const letters = ['A', 'B', 'C', 'D'];

  container.innerHTML = `
    <div class="quiz-meta-header">
      <span class="quiz-step-pill">Scenario ${qNum} of ${total}</span>
      <span class="quiz-live-score">⭐ Score: ${userQuizScore} / ${currentQuizIndex}</span>
    </div>

    <div class="quiz-progress-track">
      <div class="quiz-progress-fill" style="width: ${pct}%;"></div>
    </div>

    <div class="quiz-cat-tag">
      <span>${q.icon}</span>
      <span>${escapeHtml(q.category)}</span>
    </div>

    <div class="quiz-question-box">
      <p class="quiz-question-text">${escapeHtml(q.scenario)}</p>
    </div>

    <div class="quiz-options-list" id="quizOptionsList">
      ${q.options.map((opt, idx) => `
        <button class="quiz-opt-btn" id="quizOpt_${idx}" onclick="handleSelectQuizOption(${idx})">
          <span class="quiz-opt-letter">${letters[idx]}</span>
          <span class="quiz-opt-text">${escapeHtml(opt.text)}</span>
        </button>
      `).join('')}
    </div>

    <div id="quizFeedbackArea" style="display:none;">
      <!-- Populated when user selects an option -->
    </div>

    <div class="quiz-controls-row" id="quizControlsRow" style="display:none;">
      <button class="quiz-next-btn" onclick="nextQuizQuestion()">
        <span>${qNum === total ? 'View Final Score 🏆' : 'Next Scenario →'}</span>
      </button>
    </div>
  `;
}

function handleSelectQuizOption(selectedIndex) {
  if (isAnswerSubmitted) return;
  isAnswerSubmitted = true;

  const q = cyberQuizData[currentQuizIndex];
  const selectedOpt = q.options[selectedIndex];
  const isCorrect = !!selectedOpt.isCorrect;

  if (isCorrect) {
    userQuizScore++;
    toast('🎉 Correct Answer! (+1 Point)');
  } else {
    toast('❌ Incorrect! Review security insight below.');
  }

  // Update button visual states
  q.options.forEach((opt, idx) => {
    const btn = document.getElementById(`quizOpt_${idx}`);
    if (!btn) return;
    btn.disabled = true;

    if (opt.isCorrect) {
      btn.classList.add('correct');
      const letter = btn.querySelector('.quiz-opt-letter');
      if (letter) letter.textContent = '✓';
    } else if (idx === selectedIndex && !isCorrect) {
      btn.classList.add('incorrect');
      const letter = btn.querySelector('.quiz-opt-letter');
      if (letter) letter.textContent = '✗';
    }
  });

  // Display Explanation
  const feedbackArea = document.getElementById('quizFeedbackArea');
  if (feedbackArea) {
    feedbackArea.style.display = 'block';
    feedbackArea.innerHTML = `
      <div class="quiz-explanation-box ${isCorrect ? 'success-border' : 'danger-border'}">
        <div class="quiz-explanation-title">
          <span>${isCorrect ? '✅ Well Done!' : '⚠️ Crucial Security Lesson:'}</span>
          <span style="font-weight:600;font-size:11px;color:${isCorrect ? '#059669' : '#dc2626'};">
            ${isCorrect ? 'Correct Decision' : 'High-Risk Trapped'}
          </span>
        </div>
        <p class="quiz-explanation-text">💡 <b>CyberRakshak Insight:</b> ${escapeHtml(q.explanation)}</p>
      </div>
    `;
  }

  // Show Next button
  const controlsRow = document.getElementById('quizControlsRow');
  if (controlsRow) controlsRow.style.display = 'flex';

  // Live Score update in header
  const liveScoreEl = document.querySelector('.quiz-live-score');
  if (liveScoreEl) {
    liveScoreEl.textContent = `⭐ Score: ${userQuizScore} / ${currentQuizIndex + 1}`;
  }
}

function nextQuizQuestion() {
  currentQuizIndex++;
  isAnswerSubmitted = false;
  renderQuiz();

  const container = document.getElementById('quizContainer');
  if (container) {
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function renderQuizResults(container, badge) {
  const total = cyberQuizData.length;
  const score = userQuizScore;
  const pct = Math.round((score / total) * 100);

  if (badge) badge.textContent = `Completed (${score}/${total})`;

  let rankTitle = '';
  let rankClass = '';
  let stars = '';
  let evalDesc = '';

  if (score >= 9) {
    rankClass = 'rank-grandmaster';
    rankTitle = '🏆 Cyber Rakshak Grandmaster';
    stars = '★★★★★';
    evalDesc = `Exceptional vigilance! You scored ${score}/${total} (${pct}%). You demonstrated elite instincts against phishing URLs, digital arrest threats, remote access scams, and payment fraud. You are well-equipped to guide family and friends!`;
  } else if (score >= 7) {
    rankClass = 'rank-defender';
    rankTitle = '🛡️ Cyber Shield Defender';
    stars = '★★★★☆';
    evalDesc = `Well done! You scored ${score}/${total} (${pct}%). You possess strong security habits and understand critical defense steps like the 1930 Golden Hour rule. Stay vigilant against emerging AI voice cloning and fake caller spoofing!`;
  } else if (score >= 5) {
    rankClass = 'rank-apprentice';
    rankTitle = '⚠️ Apprentice Protector';
    stars = '★★★☆☆';
    evalDesc = `Moderate Security Risk! You scored ${score}/${total} (${pct}%). You caught several common scams but were trapped by deceptive tricks. Crucial reminder: You NEVER enter a UPI PIN or download APK files from unknown callers!`;
  } else {
    rankClass = 'rank-danger';
    rankTitle = '🚨 High Vulnerability Risk';
    stars = '★☆☆☆☆';
    evalDesc = `Warning: High Fraud Risk! You scored ${score}/${total} (${pct}%). Your bank accounts and personal data are susceptible to real-world fraud syndicates. We urge you to watch the 4 awareness videos above and memorize helpline 1930 immediately.`;
  }

  container.innerHTML = `
    <div class="quiz-results-card">
      <div class="quiz-score-badge-circle ${rankClass}">
        <span class="score-num-big">${score}</span>
        <span class="score-num-denom">out of ${total}</span>
      </div>

      <h3 class="quiz-rank-title">${rankTitle}</h3>
      <div class="quiz-rank-stars">${stars}</div>
      <p class="quiz-score-eval-desc">${evalDesc}</p>

      <div class="quiz-stats-grid">
        <div class="quiz-stat-pill">
          <b>${score} / ${total}</b>
          <small>Correct</small>
        </div>
        <div class="quiz-stat-pill">
          <b>${pct}%</b>
          <small>Accuracy</small>
        </div>
        <div class="quiz-stat-pill">
          <b>${total - score}</b>
          <small>Missed</small>
        </div>
      </div>

      <div class="quiz-results-actions">
        <button class="primary-action-btn glow-btn" onclick="initCyberQuiz()" style="flex:1;">
          🔄 Retake Quiz
        </button>
        <button class="quiz-next-btn" onclick="askBotAboutQuizResults(${score})" style="flex:1.2;background:#1e1b4b;justify-content:center;">
          💬 Ask AI Chatbot to Explain Scams →
        </button>
      </div>
    </div>
  `;
}

function askBotAboutQuizResults(score) {
  const prompt = `I just took the CyberRakshak Cyber Safety Quiz and scored ${score}/10. Can you explain the most critical rules to protect my bank accounts and UPI from modern scams like Digital Arrest and Phishing?`;
  sendQuickPrompt(prompt);
}

