/**
 * Mentor Country & Language (Man Power–compatible preferences)
 * Stores: mentor_lang, mp_lang, mp_country
 * Full UI translations today: en, hi. Other codes fall back to English until translated.
 */
(function (MG) {
  'use strict';

  var LANG_KEY = 'mentor_lang';
  var MP_LANG = 'mp_lang';
  var MP_COUNTRY = 'mp_country';

  /** Full app UI is maintained in English + Hindi. Other codes may translate
   * home/catalog chips only and fall back to English elsewhere.
   */
  MG.PRIMARY_LANGS = ['en', 'hi'];

  /** Same regions as Man Power for a consistent experience */
  MG.MENTOR_LOCALES = {
    IN: {
      name: 'India',
      flag: '🇮🇳',
      langs: [
        { code: 'hi', label: 'हिं', title: 'हिन्दी' },
        { code: 'en', label: 'EN', title: 'English' },
        { code: 'gu', label: 'ગુ', title: 'ગુજરાતી' },
        { code: 'ta', label: 'த', title: 'தமிழ்' },
        { code: 'te', label: 'తె', title: 'తెలుగు' },
        { code: 'kn', label: 'ಕ', title: 'ಕನ್ನಡ' },
        { code: 'bn', label: 'বা', title: 'বাংলা' },
        { code: 'mr', label: 'मर', title: 'मराठी' },
        { code: 'ml', label: 'മ', title: 'മലയാളം' },
        { code: 'pa', label: 'ਪੰ', title: 'ਪੰਜਾਬੀ' }
      ]
    },
    GULF: {
      name: 'Gulf',
      flag: '🌴',
      langs: [
        { code: 'en', label: 'EN', title: 'English' },
        { code: 'hi', label: 'हिं', title: 'हिन्दी' },
        { code: 'ar', label: 'ع', title: 'العربية' },
        { code: 'ur', label: 'اُ', title: 'اردو' },
        { code: 'bn', label: 'বা', title: 'বাংলা' }
      ]
    },
    CN: {
      name: 'China',
      flag: 'CN',
      langs: [
        { code: 'zh', label: '中', title: '中文' },
        { code: 'en', label: 'EN', title: 'English' }
      ]
    },
    EU: {
      name: 'Europe',
      flag: 'EU',
      langs: [
        { code: 'en', label: 'EN', title: 'English' },
        { code: 'de', label: 'DE', title: 'Deutsch' },
        { code: 'it', label: 'IT', title: 'Italiano' },
        { code: 'es', label: 'ES', title: 'Español' },
        { code: 'tr', label: 'TR', title: 'Türkçe' },
        { code: 'fr', label: 'FR', title: 'Français' }
      ]
    },
    AM: {
      name: 'Americas',
      flag: '🌎',
      langs: [
        { code: 'en', label: 'EN', title: 'English' },
        { code: 'es', label: 'ES', title: 'Español' },
        { code: 'pt', label: 'PT', title: 'Português' }
      ]
    },
    SEA: {
      name: 'SE Asia',
      flag: '🌏',
      langs: [
        { code: 'en', label: 'EN', title: 'English' },
        { code: 'th', label: 'ไท', title: 'ไทย' },
        { code: 'id', label: 'ID', title: 'Indonesia' },
        { code: 'vi', label: 'VI', title: 'Tiếng Việt' }
      ]
    }
  };
  MG.MENTOR_COUNTRY_ORDER = ['IN', 'GULF', 'CN', 'EU', 'AM', 'SEA'];

  var STR = {
  "en": {
    "appSubtitle": "One-to-One Guidance",
    "payments": "Payments",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",

    "loginTitle": "Login with Mobile OTP",
    "welcomeBack": "Welcome back",
    "rememberDevice": "Remember this device",
    "sessionUnlocked": "Session unlocked — you can open your topic now",
    "loginSub": "Enter mobile number to continue",
    "mobileLabel": "10-digit Mobile Number",
    "sendOtp": "Send OTP",
    "continueBtn": "Continue",
    "otpTitle": "Enter OTP",
    "otpSub": "OTP sent to your mobile",
    "verifyOtp": "Verify OTP",
    "installApp": "Install Mentor app",
    "shareApp": "Share Mentor app",
    "installHint": "Install for home-screen access · OTP login after install",
    "addNameTitle": "Add your name",
    "addNameBody": "Show your name in the header instead of mobile number.",
    "addNameBtn": "Add name",
    "addNameLater": "Later",
    "freeBadge": "Free",
    "paidBadge": "Paid 1:1",
    "openModule": "Open module",
    "openCalculator": "Open calculator",
    "completed": "Completed",
    "markComplete": "Mark complete",
    "certificate": "Certificate",
    "payPending": "Pending review",
    "payApproved": "Approved",
    "payRejected": "Rejected",
    "payNextPending": "Mentor will confirm shortly",
    "payNextApproved": "Topic unlocked",
    "loadingPayments": "Loading payments…",
    "noPayments": "No payments yet",
    "privacy": "Privacy",
    "playSoon": "Play Store (coming soon)",
    "signedIn": "Signed in",
    "bookPaid": "Book paid 1:1",
    "starterModule": "Free starter module",
    "offlineRetry": "You appear offline. Tap to retry.",
    "myOwnView": "— My own view (Mentor) —",
    "loadingStudents": "Loading students…",
    "backToPaths": "Back to paths",
    "recordings": "Recordings",
    "noRecordings": "No recordings yet. Flow: Book hours → Pay → Mentor approves → Session → Recording appears here.",
    "noMessages": "No messages yet. Log your practice or ask a doubt.",
    "sessionChecklist": "Session checklist",
    "chatPlaceholder": "Log progress, ask doubt, share homework…",
    "sendChat": "Send",
    "recordingAdded": "Recording added",
    "bookingTitle": "Book 1:1 session",
    "hoursLabel": "Hours",
    "slotLabel": "Preferred slot",
    "topicFocus": "Topic focus",
    "payNow": "Pay Now via Razorpay",
    "payHint": "Pay Now notifies the Mentor automatically. No UTR required.",
    "attachPayId": "Attach Payment ID (optional)",
    "paymentHistory": "Payment & Session History",
    "personalWorkspace": "Personal workspace",
    "selectRecording": "Select a recording below to watch",
    "bookMore": "Book more hours",
    "chooseTrack": "Choose track",
    "programTopic": "Program / Topic",
    "packageLabel": "Package",
    "hour1": "1 Hour",
    "hours3": "3 Hours",
    "hours5": "5 Hours",
    "off5": "~5% off",
    "off10": "~10% off",
    "totalLabel": "Total",
    "payAfterHint": "After paying, Mentor is notified automatically. Payment ID is optional.",


    "share": "Share",
    "choosePath": "Choose your path",
    "choosePathSub": "Free modules inside · book paid 1:1 · recordings & doubt chat",
    "packaging": "Flexible Packaging",
    "packagingTag": "FREE MODULES + PAID 1:1 · ₹799/HR",
    "packagingDesc": "Open free plant modules and calculators. Book paid 1:1 only when you need help on real plant problems (capacity, yield, metalliser, 5S, cost/sqm).",
    "packagingOpen": "Open Packaging — free modules inside",
    "career": "Career & AI Guidance",
    "careerTag": "PAID 1:1 · ₹699/HR",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, freelancing, ITR, resume, personal finance and more — one-to-one.",
    "careerOpen": "Open Career & AI — book 1:1",
    "logout": "Logout",
    "language": "Language",
    "langTitle": "Country & Language",
    "langHint": "App UI is complete in English & Hindi. Pick Hindi or English for the best experience.",
    "country": "1. Country",
    "languageSection": "2. Language",
    "english": "English",
    "hindi": "Hindi",
    "done": "Done",
    "closeApp": "Close Mentor app?",
    "runningInstalled": "Running as installed Mentor app.",
    "shareTitle": "Share App",
    "choosePlatform": "Choose platform",
    "cancel": "Cancel",
    "systemShare": "System share…",
    "missingNote": "Full app language: English & Hindi. Other languages use English where a line is not translated.",
    "viewAsStudent": "View as Student:",
    "selectStudent": "— Select student mobile —",
    "refreshList": "Refresh List"
  },
  "hi": {
    "appSubtitle": "एक-से-एक मार्गदर्शन",
    "payments": "भुगतान",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",

    "loginTitle": "मोबाइल OTP से लॉगिन",
    "welcomeBack": "वापस स्वागत है",
    "rememberDevice": "इस डिवाइस को याद रखें",
    "sessionUnlocked": "सत्र अनलॉक — अब अपना टॉपिक खोल सकते हैं",
    "loginSub": "जारी रखने के लिए मोबाइल नंबर डालें",
    "mobileLabel": "10 अंकों का मोबाइल नंबर",
    "sendOtp": "OTP भेजें",
    "continueBtn": "आगे बढ़ें",
    "otpTitle": "OTP डालें",
    "otpSub": "OTP आपके मोबाइल पर भेजा गया",
    "verifyOtp": "OTP सत्यापित करें",
    "installApp": "Mentor ऐप इंस्टॉल करें",
    "shareApp": "Mentor ऐप साझा करें",
    "installHint": "होम स्क्रीन के लिए इंस्टॉल करें · बाद में OTP लॉगिन",
    "addNameTitle": "अपना नाम जोड़ें",
    "addNameBody": "हेडर पर मोबाइल की जगह आपका नाम दिखेगा।",
    "addNameBtn": "नाम जोड़ें",
    "addNameLater": "बाद में",
    "freeBadge": "मुफ़्त",
    "paidBadge": "पेड 1:1",
    "openModule": "मॉड्यूल खोलें",
    "openCalculator": "कैलकुलेटर खोलें",
    "completed": "पूर्ण",
    "markComplete": "पूर्ण चिह्नित करें",
    "certificate": "प्रमाणपत्र",
    "payPending": "समीक्षा में",
    "payApproved": "स्वीकृत",
    "payRejected": "अस्वीकृत",
    "payNextPending": "मेंटर जल्द पुष्टि करेंगे",
    "payNextApproved": "टॉपिक अनलॉक",
    "loadingPayments": "भुगतान लोड हो रहे हैं…",
    "noPayments": "अभी कोई भुगतान नहीं",
    "privacy": "गोपनीयता",
    "playSoon": "Play Store (जल्द)",
    "signedIn": "साइन इन",
    "bookPaid": "पेड 1:1 बुक करें",
    "starterModule": "मुफ़्त स्टार्टर मॉड्यूल",
    "offlineRetry": "आप ऑफ़लाइन लगते हैं। पुनः प्रयास करें।",
    "myOwnView": "— मेरा अपना व्यू (Mentor) —",
    "loadingStudents": "विद्यार्थी लोड हो रहे हैं…",
    "backToPaths": "पथ पर वापस",
    "recordings": "रिकॉर्डिंग",
    "noRecordings": "अभी कोई रिकॉर्डिंग नहीं। क्रम: घंटे बुक करें → भुगतान → मेंटर स्वीकृति → सत्र → फिर रिकॉर्डिंग यहाँ।",
    "noMessages": "अभी कोई संदेश नहीं। अभ्यास लिखें या डाउट पूछें।",
    "sessionChecklist": "सत्र चेकलिस्ट",
    "chatPlaceholder": "प्रगति लिखें, डाउट पूछें…",
    "sendChat": "भेजें",
    "recordingAdded": "रिकॉर्डिंग जोड़ी गई",
    "bookingTitle": "1:1 सत्र बुक करें",
    "hoursLabel": "घंटे",
    "slotLabel": "पसंदीदा स्लॉट",
    "topicFocus": "टॉपिक फोकस",
    "payNow": "Razorpay से अभी भुगतान करें",
    "payHint": "भुगतान से मेंटर को सूचना मिलती है। UTR ज़रूरी नहीं।",
    "attachPayId": "Payment ID जोड़ें (वैकल्पिक)",
    "paymentHistory": "भुगतान और सत्र इतिहास",
    "personalWorkspace": "व्यक्तिगत वर्कस्पेस",
    "selectRecording": "देखने के लिए रिकॉर्डिंग चुनें",
    "bookMore": "और घंटे बुक करें",
    "chooseTrack": "ट्रैक चुनें",
    "programTopic": "प्रोग्राम / टॉपिक",
    "packageLabel": "पैकेज",
    "hour1": "1 घंटा",
    "hours3": "3 घंटे",
    "hours5": "5 घंटे",
    "off5": "~5% छूट",
    "off10": "~10% छूट",
    "totalLabel": "कुल",
    "payAfterHint": "भुगतान के बाद मेंटर को सूचना मिलती है। Payment ID वैकल्पिक है।",


    "share": "साझा करें",
    "choosePath": "अपना पथ चुनें",
    "choosePathSub": "अंदर मुफ़्त मॉड्यूल · पेड 1:1 बुक करें · रिकॉर्डिंग और डाउट चैट",
    "packaging": "फ्लेक्सिबल पैकेजिंग",
    "packagingTag": "मुफ़्त मॉड्यूल + पेड 1:1 · ₹799/घंटा",
    "packagingDesc": "मुफ़्त प्लांट मॉड्यूल और कैलकुलेटर खोलें। असली प्लांट समस्या (कैपेसिटी, यील्ड, मेटलाइज़र, 5S, कॉस्ट/sqm) पर मदद चाहिए तब पेड 1:1 बुक करें।",
    "packagingOpen": "पैकेजिंग खोलें — अंदर मुफ़्त मॉड्यूल",
    "career": "करियर और AI गाइडेंस",
    "careerTag": "पेड 1:1 · ₹699/घंटा",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, फ्रीलांसिंग, ITR, रिज़्यूमे, पर्सनल फाइनेंस आदि — एक-से-एक सत्र।",
    "careerOpen": "करियर और AI खोलें — 1:1 बुक करें",
    "logout": "लॉगआउट",
    "language": "भाषा",
    "langTitle": "देश और भाषा",
    "langHint": "ऐप UI पूरी तरह English और हिंदी में है। बेहतर अनुभव के लिए Hindi या English चुनें।",
    "country": "1. देश",
    "languageSection": "2. भाषा",
    "english": "English",
    "hindi": "हिंदी",
    "done": "हो गया",
    "closeApp": "Mentor ऐप बंद करें?",
    "runningInstalled": "Mentor ऐप इंस्टॉल मोड में चल रहा है।",
    "shareTitle": "ऐप साझा करें",
    "choosePlatform": "प्लेटफ़ॉर्म चुनें",
    "cancel": "रद्द",
    "systemShare": "सिस्टम शेयर…",
    "missingNote": "पूरा ऐप: English और हिंदी। अन्य भाषा में न हो तो English दिखेगा।",
    "viewAsStudent": "विद्यार्थी के रूप में देखें:",
    "selectStudent": "— विद्यार्थी मोबाइल चुनें —",
    "refreshList": "सूची ताज़ा करें"
  },
  "gu": {
    "appSubtitle": "વન-ટુ-વન માર્ગદર્શન",
    "payments": "પેમેન્ટ્સ",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "શેર",
    "choosePath": "તમારો માર્ગદર્શન માર્ગ પસંદ કરો",
    "choosePathSub": "ફ્રી પ્લાન્ટ મોડ્યુલ + પેડ વન-ટુ-વન સેશન • રેકોર્ડિંગ અને ડાઉટ ચેટ",
    "packaging": "ફ્લેક્સિબલ પેકેજિંગ",
    "packagingTag": "પ્લાન્ટ નોલેજ · ફ્રી + પેડ · ₹799 / કલાક",
    "packagingDesc": "ફ્રી મોડ્યુલ અને કેલ્ક્યુલેટર + અસલી પ્લાન્ટ સમસ્યાઓ માટે પેડ વન-ટુ-વન।",
    "packagingOpen": "પેકેજિંગ ખોલો → ₹799 / કલાક",
    "career": "કેરિયર અને AI માર્ગદર્શન",
    "careerTag": "15 સેશન · ₹699/કલાક",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, ફ્રીલાન્સિંગ, ITR, રેઝ્યુમે અને વધુ — વન-ટુ-વન।",
    "careerOpen": "કેરિયર અને AI ખોલો →",
    "logout": "લૉગ આઉટ",
    "language": "ભાષા",
    "langTitle": "દેશ અને ભાષા",
    "langHint": "Man Power જેવી પસંદગી. દેશ પસંદ કરો, પછી ભાષા.",
    "country": "1. દેશ",
    "languageSection": "2. ભાષા",
    "english": "English",
    "hindi": "હિન્દી",
    "done": "થઈ ગયું",
    "closeApp": "Mentor એપ બંધ કરીએ?",
    "runningInstalled": "ઇન્સ્ટોલ થયેલ Mentor એપ તરીકે ચાલી રહી છે.",
    "shareTitle": "એપ શેર કરો",
    "choosePlatform": "પ્લેટફોર્મ પસંદ કરો",
    "cancel": "રદ",
    "systemShare": "સિસ્ટમ શેર…",
    "missingNote": "અનુવાદ ન હોય તો English.",
    "viewAsStudent": "વિદ્યાર્થી તરીકે જુઓ:",
    "selectStudent": "— વિદ્યાર્થી મોબાઇલ પસંદ કરો —",
    "refreshList": "યાદી રિફ્રેશ"
  },
  "ta": {
    "appSubtitle": "ஒன்றுக்கு ஒன்று வழிகாட்டல்",
    "payments": "கட்டணங்கள்",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "பகிர்",
    "choosePath": "உங்கள் வழிகாட்டல் பாதையைத் தேர்ந்தெடுங்கள்",
    "choosePathSub": "இலவச ஆலை தொகுதிகள் + கட்டண ஒருவருக்கு ஒருவர் அமர்வுகள் • பதிவுகள் மற்றும் சந்தேக அரட்டை",
    "packaging": "நெகிழ் பேக்கேஜிங்",
    "packagingTag": "ஆலை அறிவு · இலவசம் + கட்டணம் · ₹799 / மணி",
    "packagingDesc": "இலவச தொகுதிகள் மற்றும் கணிப்பான்கள் + உண்மையான ஆலை சிக்கல்களுக்கு கட்டண mentorship.",
    "packagingOpen": "பேக்கேஜிங் திற · ₹799 / மணி",
    "career": "தொழில் மற்றும் AI வழிகாட்டல்",
    "careerTag": "15 அமர்வுகள் · ₹699/மணி",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, ஃப்ரீலான்சிங், ITR, ரெஸ்யூமே மற்றும் மேலும் — ஒருவருக்கு ஒருவர்.",
    "careerOpen": "தொழில் மற்றும் AI திற →",
    "logout": "வெளியேறு",
    "language": "மொழி",
    "langTitle": "நாடு மற்றும் மொழி",
    "langHint": "Man Power போன்ற தேர்வு. நாட்டைத் தேர்ந்தெடுத்து, பிறகு மொழி.",
    "country": "1. நாடு",
    "languageSection": "2. மொழி",
    "english": "English",
    "hindi": "இந்தி",
    "done": "முடிந்தது",
    "closeApp": "Mentor பயன்பாட்டை மூடவா?",
    "runningInstalled": "நிறுவப்பட்ட Mentor பயன்பாட்டாக இயங்குகிறது.",
    "shareTitle": "பயன்பாட்டைப் பகிர்",
    "choosePlatform": "தளத்தைத் தேர்ந்தெடு",
    "cancel": "ரத்து",
    "systemShare": "கணினி பகிர்வு…",
    "missingNote": "மொழிபெயர்ப்பு இல்லை எனில் English.",
    "viewAsStudent": "மாணவராகப் பார்:",
    "selectStudent": "— மாணவர் மொபைலைத் தேர்ந்தெடு —",
    "refreshList": "பட்டியலைப் புதுப்பி"
  },
  "te": {
    "appSubtitle": "వన్-టు-వన్ మార్గదర్శకత్వం",
    "payments": "పేమెంట్స్",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "షేర్",
    "choosePath": "మీ మార్గదర్శక మార్గాన్ని ఎంచుకోండి",
    "choosePathSub": "ఉచిత ప్లాంట్ మాడ్యూల్స్ + పెయిడ్ వన్-టు-వన్ సెషన్లు • రికార్డింగ్స్ & డౌట్ చాట్",
    "packaging": "ఫ్లెక్సిబుల్ ప్యాకేజింగ్",
    "packagingTag": "ప్లాంట్ నాలెడ్జ్ · ఉచితం + పెయిడ్ · ₹799 / గంట",
    "packagingDesc": "ఉచిత మాడ్యూల్స్ & కాలిక్యులేటర్లు + నిజమైన ప్లాంట్ సమస్యలకు పెయిడ్ mentorship.",
    "packagingOpen": "ప్యాకేజింగ్ తెరవండి → ₹799 / గంట",
    "career": "కెరీర్ & AI మార్గదర్శకత్వం",
    "careerTag": "15 సెషన్లు · ₹699/గంట",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, ఫ్రీలాన్సింగ్, ITR, రెజ్యూమ్ మరియు మరిన్ని — వన్-టు-వన్.",
    "careerOpen": "కెరీర్ & AI తెరవండి →",
    "logout": "లాగ్ అవుట్",
    "language": "భాష",
    "langTitle": "దేశం & భాష",
    "langHint": "Man Power లాంటి ఎంపిక. దేశం ఎంచుకుని, తర్వాత భాష.",
    "country": "1. దేశం",
    "languageSection": "2. భాష",
    "english": "English",
    "hindi": "హిందీ",
    "done": "పూర్తి",
    "closeApp": "Mentor యాప్ మూసేయాలా?",
    "runningInstalled": "ఇన్‌స్టాల్ చేసిన Mentor యాప్‌గా నడుస్తోంది.",
    "shareTitle": "యాప్ షేర్ చేయండి",
    "choosePlatform": "ప్లాట్‌ఫారమ్ ఎంచుకోండి",
    "cancel": "రద్దు",
    "systemShare": "సిస్టమ్ షేర్…",
    "missingNote": "అనువాదం లేకపోతే English.",
    "viewAsStudent": "విద్యార్థిగా చూడండి:",
    "selectStudent": "— విద్యార్థి మొబైల్ ఎంచుకోండి —",
    "refreshList": "జాబితా రిఫ్రెష్"
  },
  "kn": {
    "appSubtitle": "ವನ್-ಟು-ವನ್ ಮಾರ್ಗದರ್ಶನ",
    "payments": "ಪಾವತಿಗಳು",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "ಹಂಚಿಕೊಳ್ಳಿ",
    "choosePath": "ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶನ ಮಾರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "choosePathSub": "ಉಚಿತ ಪ್ಲಾಂಟ್ ಮಾಡ್ಯೂಲ್‌ಗಳು + ಪಾವತಿ ವನ್-ಟು-ವನ್ ಸೆಷನ್‌ಗಳು • ರೆಕಾರ್ಡಿಂಗ್ ಮತ್ತು ಸಂಶಯ ಚಾಟ್",
    "packaging": "ಫ್ಲೆಕ್ಸಿಬಲ್ ಪ್ಯಾಕೇಜಿಂಗ್",
    "packagingTag": "ಪ್ಲಾಂಟ್ ಜ್ಞಾನ · ಉಚಿತ + ಪಾವತಿ · ₹799 / ಗಂಟೆ",
    "packagingDesc": "ಉಚಿತ ಮಾಡ್ಯೂಲ್‌ಗಳು ಮತ್ತು ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು + ನಿಜವಾದ ಪ್ಲಾಂಟ್ ಸಮಸ್ಯೆಗಳಿಗೆ ಪಾವತಿ mentorship.",
    "packagingOpen": "ಪ್ಯಾಕೇಜಿಂಗ್ ತೆರೆಯಿರಿ → ₹799 / ಗಂಟೆ",
    "career": "ವೃತ್ತಿ ಮತ್ತು AI ಮಾರ್ಗದರ್ಶನ",
    "careerTag": "15 ಸೆಷನ್‌ಗಳು · ₹699/ಗಂಟೆ",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, ಫ್ರೀಲಾನ್ಸಿಂಗ್, ITR, ರೆಸ್ಯೂಮ್ ಮತ್ತು ಇನ್ನಷ್ಟು — ವನ್-ಟು-ವನ್.",
    "careerOpen": "ವೃತ್ತಿ ಮತ್ತು AI ತೆರೆಯಿರಿ →",
    "logout": "ಲಾಗ್ ಔಟ್",
    "language": "ಭಾಷೆ",
    "langTitle": "ದೇಶ ಮತ್ತು ಭಾಷೆ",
    "langHint": "Man Power ರೀತಿಯ ಆಯ್ಕೆ. ದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ, ನಂತರ ಭಾಷೆ.",
    "country": "1. ದೇಶ",
    "languageSection": "2. ಭಾಷೆ",
    "english": "English",
    "hindi": "ಹಿಂದಿ",
    "done": "ಮುಗಿದಿದೆ",
    "closeApp": "Mentor ಅಪ್ಲಿಕೇಶನ್ ಮುಚ್ಚುವುದೇ?",
    "runningInstalled": "ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿದ Mentor ಅಪ್ಲಿಕೇಶನ್ ಆಗಿ ಚಲಿಸುತ್ತಿದೆ.",
    "shareTitle": "ಅಪ್ಲಿಕೇಶನ್ ಹಂಚಿಕೊಳ್ಳಿ",
    "choosePlatform": "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಆಯ್ಕೆಮಾಡಿ",
    "cancel": "ರದ್ದು",
    "systemShare": "ಸಿಸ್ಟಮ್ ಹಂಚಿಕೆ…",
    "missingNote": "ಅನುವಾದವಿಲ್ಲದಿದ್ದರೆ English.",
    "viewAsStudent": "ವಿದ್ಯಾರ್ಥಿಯಾಗಿ ನೋಡಿ:",
    "selectStudent": "— ವಿದ್ಯಾರ್ಥಿ ಮೊಬೈಲ್ ಆಯ್ಕೆಮಾಡಿ —",
    "refreshList": "ಪಟ್ಟಿ ರಿಫ್ರೆಶ್"
  },
  "bn": {
    "appSubtitle": "ওয়ান-টু-ওয়ান গাইডেন্স",
    "payments": "পেমেন্টস",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "শেয়ার",
    "choosePath": "আপনার গাইডেন্স পথ বেছে নিন",
    "choosePathSub": "ফ্রি প্ল্যান্ট মডিউল + পেইড ওয়ান-টু-ওয়ান সেশন • রেকর্ডিং ও ডাউট চ্যাট",
    "packaging": "ফ্লেক্সিবল প্যাকেজিং",
    "packagingTag": "প্ল্যান্ট নলেজ · ফ্রি + পেইড · ₹799 / ঘণ্টা",
    "packagingDesc": "ফ্রি মডিউল ও ক্যালকুলেটর + আসল প্ল্যান্ট সমস্যার জন্য পেইড mentorship।",
    "packagingOpen": "প্যাকেজিং খুলুন → ₹799 / ঘণ্টা",
    "career": "ক্যারিয়ার ও AI গাইডেন্স",
    "careerTag": "১৫ সেশন · ₹699/ঘণ্টা",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, ফ্রিল্যান্সিং, ITR, রেজ্যুমে এবং আরও — ওয়ান-টু-ওয়ান।",
    "careerOpen": "ক্যারিয়ার ও AI খুলুন →",
    "logout": "লগ আউট",
    "language": "ভাষা",
    "langTitle": "দেশ ও ভাষা",
    "langHint": "Man Power-এর মতো বেছে নিন। দেশ, তারপর ভাষা।",
    "country": "1. দেশ",
    "languageSection": "2. ভাষা",
    "english": "English",
    "hindi": "হিন্দি",
    "done": "হয়ে গেছে",
    "closeApp": "Mentor অ্যাপ বন্ধ করবেন?",
    "runningInstalled": "ইনস্টল করা Mentor অ্যাপ হিসেবে চলছে।",
    "shareTitle": "অ্যাপ শেয়ার করুন",
    "choosePlatform": "প্ল্যাটফর্ম বেছে নিন",
    "cancel": "বাতিল",
    "systemShare": "সিস্টেম শেয়ার…",
    "missingNote": "অনুবাদ না থাকলে English।",
    "viewAsStudent": "ছাত্র হিসেবে দেখুন:",
    "selectStudent": "— ছাত্র মোবাইল বেছে নিন —",
    "refreshList": "তালিকা রিফ্রেশ"
  },
  "mr": {
    "appSubtitle": "एक-से-एक मार्गदर्शन",
    "payments": "भुगतान",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "शेअर",
    "choosePath": "तुमचा मार्गदर्शन मार्ग निवडा",
    "choosePathSub": "मोफत प्लांट मॉड्यूल्स + पेड वन-टू-वन सेशन्स • रेकॉर्डिंग आणि डाउट चॅट",
    "packaging": "फ्लेक्सिबल पॅकेजिंग",
    "packagingTag": "प्लांट नॉलेज · मोफत + पेड · ₹799 / तास",
    "packagingDesc": "मोफत मॉड्यूल्स आणि कॅल्क्युलेटर्स + खऱ्या प्लांट समस्यांसाठी पेड mentorship.",
    "packagingOpen": "पॅकेजिंग उघडा → ₹799 / तास",
    "career": "करिअर आणि AI मार्गदर्शन",
    "careerTag": "15 सेशन्स · ₹699/तास",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, फ्रीलान्सिंग, ITR, रेझ्युमे आणि अधिक — वन-टू-वन.",
    "careerOpen": "करिअर आणि AI उघडा →",
    "logout": "लॉगआउट",
    "language": "भाषा",
    "langTitle": "देश आणि भाषा",
    "langHint": "Man Power सारची निवड. देश निवडा, नंतर भाषा.",
    "country": "1. देश",
    "languageSection": "2. भाषा",
    "english": "English",
    "hindi": "हिंदी",
    "done": "झाले",
    "closeApp": "Mentor अॅप बंद करायचे?",
    "runningInstalled": "इंस्टॉल केलेल्या Mentor अॅप म्हणून चालू आहे.",
    "shareTitle": "अॅप शेअर करा",
    "choosePlatform": "प्लॅटफॉर्म निवडा",
    "cancel": "रद्द",
    "systemShare": "सिस्टम शेअर…",
    "missingNote": "भाषांतर नसल्यास English.",
    "viewAsStudent": "विद्यार्थी म्हणून पहा:",
    "selectStudent": "— विद्यार्थी मोबाइल निवडा —",
    "refreshList": "यादी रिफ्रेश"
  },
  "ml": {
    "appSubtitle": "വൺ-ടു-വൺ ഗൈഡൻസ്",
    "payments": "പേയ്‌മെന്റുകൾ",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "ഷെയർ",
    "choosePath": "നിങ്ങളുടെ ഗൈഡൻസ് പാത തിരഞ്ഞെടുക്കുക",
    "choosePathSub": "സൗജന്യ പ്ലാന്റ് മൊഡ്യൂളുകൾ + പെയ്ഡ് വൺ-ടു-വൺ സെഷനുകൾ • റെക്കോർഡിംഗും ഡൗട്ട് ചാറ്റും",
    "packaging": "ഫ്ലെക്സിബിൾ പാക്കേജിംഗ്",
    "packagingTag": "പ്ലാന്റ് നോളജ് · സൗജന്യം + പെയ്ഡ് · ₹799 / മണിക്കൂർ",
    "packagingDesc": "സൗജന്യ മൊഡ്യൂളുകളും കാൽക്കുലേറ്ററുകളും + യഥാർത്ഥ പ്ലാന്റ് പ്രശ്നങ്ങൾക്ക് പെയ്ഡ് mentorship.",
    "packagingOpen": "പാക്കേജിംഗ് തുറക്കുക → ₹799 / മണിക്കൂർ",
    "career": "കരിയർ & AI ഗൈഡൻസ്",
    "careerTag": "15 സെഷനുകൾ · ₹699/മണിക്കൂർ",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, ഫ്രീലാൻസിംഗ്, ITR, റെസ്യൂമെ എന്നിവയും കൂടുതലും — വൺ-ടു-വൺ.",
    "careerOpen": "കരിയർ & AI തുറക്കുക →",
    "logout": "ലോഗ് ഔട്ട്",
    "language": "ഭാഷ",
    "langTitle": "രാജ്യവും ഭാഷയും",
    "langHint": "Man Power പോലുള്ള തിരഞ്ഞെടുപ്പ്. രാജ്യം, പിന്നെ ഭാഷ.",
    "country": "1. രാജ്യം",
    "languageSection": "2. ഭാഷ",
    "english": "English",
    "hindi": "ഹിന്ദി",
    "done": "കഴിഞ്ഞു",
    "closeApp": "Mentor ആപ്പ് അടയ്ക്കണോ?",
    "runningInstalled": "ഇൻസ്റ്റാൾ ചെയ്ത Mentor ആപ്പായി പ്രവർത്തിക്കുന്നു.",
    "shareTitle": "ആപ്പ് ഷെയർ ചെയ്യുക",
    "choosePlatform": "പ്ലാറ്റ്‌ഫോം തിരഞ്ഞെടുക്കുക",
    "cancel": "റദ്ദാക്കുക",
    "systemShare": "സിസ്റ്റം ഷെയർ…",
    "missingNote": "വിവർത്തനമില്ലെങ്കിൽ English.",
    "viewAsStudent": "വിദ്യാർത്ഥിയായി കാണുക:",
    "selectStudent": "— വിദ്യാർത്ഥി മൊബൈൽ തിരഞ്ഞെടുക്കുക —",
    "refreshList": "ലിസ്റ്റ് റിഫ്രഷ്"
  },
  "pa": {
    "appSubtitle": "ਵਨ-ਟੂ-ਵਨ ਮਾਰਗਦਰਸ਼ਨ",
    "payments": "ਭੁਗਤਾਨ",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "ਸਾਂਝਾ ਕਰੋ",
    "choosePath": "ਆਪਣਾ ਮਾਰਗਦਰਸ਼ਨ ਰਾਹ ਚੁਣੋ",
    "choosePathSub": "ਮੁਫ਼ਤ ਪਲਾਂਟ ਮੋਡੀਊਲ + ਪੇਡ ਵਨ-ਟੂ-ਵਨ ਸੈਸ਼ਨ • ਰਿਕਾਰਡਿੰਗ ਅਤੇ ਡਾਊਟ ਚੈਟ",
    "packaging": "ਫਲੈਕਸੀਬਲ ਪੈਕੇਜਿੰਗ",
    "packagingTag": "ਪਲਾਂਟ ਗਿਆਨ · ਮੁਫ਼ਤ + ਪੇਡ · ₹799 / ਘੰਟਾ",
    "packagingDesc": "ਮੁਫ਼ਤ ਮੋਡੀਊਲ ਅਤੇ ਕੈਲਕੂਲੇਟਰ + ਅਸਲ ਪਲਾਂਟ ਸਮੱਸਿਆਵਾਂ ਲਈ ਪੇਡ mentorship।",
    "packagingOpen": "ਪੈਕੇਜਿੰਗ ਖੋਲ੍ਹੋ → ₹799 / ਘੰਟਾ",
    "career": "ਕਰੀਅਰ ਅਤੇ AI ਮਾਰਗਦਰਸ਼ਨ",
    "careerTag": "15 ਸੈਸ਼ਨ · ₹699/ਘੰਟਾ",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, ਫ੍ਰੀਲਾਂਸਿੰਗ, ITR, ਰਿਜ਼ਿਊਮੇ ਅਤੇ ਹੋਰ — ਵਨ-ਟੂ-ਵਨ।",
    "careerOpen": "ਕਰੀਅਰ ਅਤੇ AI ਖੋਲ੍ਹੋ →",
    "logout": "ਲਾਗ ਆਉਟ",
    "language": "ਭਾਸ਼ਾ",
    "langTitle": "ਦੇਸ਼ ਅਤੇ ਭਾਸ਼ਾ",
    "langHint": "Man Power ਵਰਗੀ ਚੋਣ। ਦੇਸ਼ ਚੁਣੋ, ਫਿਰ ਭਾਸ਼ਾ।",
    "country": "1. ਦੇਸ਼",
    "languageSection": "2. ਭਾਸ਼ਾ",
    "english": "English",
    "hindi": "ਹਿੰਦੀ",
    "done": "ਹੋ ਗਿਆ",
    "closeApp": "Mentor ਐਪ ਬੰਦ ਕਰਨੀ ਹੈ?",
    "runningInstalled": "ਇੰਸਟਾਲ ਕੀਤੀ Mentor ਐਪ ਵਜੋਂ ਚੱਲ ਰਹੀ ਹੈ।",
    "shareTitle": "ਐਪ ਸਾਂਝੀ ਕਰੋ",
    "choosePlatform": "ਪਲੇਟਫਾਰਮ ਚੁਣੋ",
    "cancel": "ਰੱਦ",
    "systemShare": "ਸਿਸਟਮ ਸ਼ੇਅਰ…",
    "missingNote": "ਅਨੁਵਾਦ ਨਾ ਹੋਵੇ ਤਾਂ English।",
    "viewAsStudent": "ਵਿਦਿਆਰਥੀ ਵਜੋਂ ਵੇਖੋ:",
    "selectStudent": "— ਵਿਦਿਆਰਥੀ ਮੋਬਾਈਲ ਚੁਣੋ —",
    "refreshList": "ਸੂਚੀ ਰਿਫ੍ਰੈਸ਼"
  },
  "ar": {
    "appSubtitle": "إرشاد فردي",
    "payments": "المدفوعات",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "مشاركة",
    "choosePath": "اختر مسار الإرشاد",
    "choosePathSub": "وحدات مصنع مجانية + جلسات فردية مدفوعة • تسجيلات ودردشة للأسئلة",
    "packaging": "التعبئة المرنة",
    "packagingTag": "معرفة المصنع · مجاني + مدفوع · ₹799 / ساعة",
    "packagingDesc": "وحدات وآلات حاسبة مجانية + إرشاد مدفوع لمشكلات المصنع الحقيقية.",
    "packagingOpen": "افتح التعبئة → ₹799 / ساعة",
    "career": "المسار المهني والذكاء الاصطناعي",
    "careerTag": "15 جلسة · ₹699/ساعة",
    "careerDesc": "Gemini وClaude وGrok وChatGPT وExcel+AI والعمل الحر وITR والسيرة الذاتية والمزيد — بشكل فردي.",
    "careerOpen": "افتح المسار المهني والذكاء الاصطناعي →",
    "logout": "تسجيل الخروج",
    "language": "اللغة",
    "langTitle": "البلد واللغة",
    "langHint": "نفس أسلوب Man Power. اختر البلد ثم اللغة.",
    "country": "1. البلد",
    "languageSection": "2. اللغة",
    "english": "English",
    "hindi": "الهندية",
    "done": "تم",
    "closeApp": "إغلاق تطبيق Mentor؟",
    "runningInstalled": "يعمل كتطبيق Mentor مثبت.",
    "shareTitle": "مشاركة التطبيق",
    "choosePlatform": "اختر المنصة",
    "cancel": "إلغاء",
    "systemShare": "مشاركة النظام…",
    "missingNote": "إن نقصت الترجمة يُعرض English.",
    "viewAsStudent": "عرض كطالب:",
    "selectStudent": "— اختر جوال الطالب —",
    "refreshList": "تحديث القائمة"
  },
  "ur": {
    "appSubtitle": "ون ٹو ون رہنمائی",
    "payments": "ادائیگیاں",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "شیئر",
    "choosePath": "اپنا رہنمائی راستہ منتخب کریں",
    "choosePathSub": "مفت پلانٹ ماڈیولز + ادا شدہ ون ٹو ون سیشنز • ریکارڈنگ اور ڈاؤٹ چیٹ",
    "packaging": "فلیکسیبل پیکیجنگ",
    "packagingTag": "پلانٹ نالج · مفت + ادا شدہ · ₹799 / گھنٹہ",
    "packagingDesc": "مفت ماڈیولز اور کیلکولیٹرز + حقیقی پلانٹ مسائل کے لیے ادا شدہ mentorship۔",
    "packagingOpen": "پیکیجنگ کھولیں → ₹799 / گھنٹہ",
    "career": "کیریئر اور AI رہنمائی",
    "careerTag": "15 سیشنز · ₹699/گھنٹہ",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, فری لانسنگ، ITR، ریزیومے اور مزید — ون ٹو ون۔",
    "careerOpen": "کیریئر اور AI کھولیں →",
    "logout": "لاگ آؤٹ",
    "language": "زبان",
    "langTitle": "ملک اور زبان",
    "langHint": "Man Power جیسا انتخاب۔ ملک منتخب کریں، پھر زبان۔",
    "country": "1. ملک",
    "languageSection": "2. زبان",
    "english": "English",
    "hindi": "ہندی",
    "done": "ہو گیا",
    "closeApp": "Mentor ایپ بند کریں؟",
    "runningInstalled": "انسٹال شدہ Mentor ایپ کے طور پر چل رہا ہے۔",
    "shareTitle": "ایپ شیئر کریں",
    "choosePlatform": "پلیٹ فارم منتخب کریں",
    "cancel": "منسوخ",
    "systemShare": "سسٹم شیئر…",
    "missingNote": "ترجمہ نہ ہو تو English۔",
    "viewAsStudent": "طالب علم کے طور پر دیکھیں:",
    "selectStudent": "— طالب علم موبائل منتخب کریں —",
    "refreshList": "فہرست تازہ کریں"
  },
  "zh": {
    "appSubtitle": "一对一指导",
    "payments": "付款",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "分享",
    "choosePath": "选择您的指导路径",
    "choosePathSub": "免费工厂模块 + 付费一对一课程 • 录播与答疑",
    "packaging": "软包装",
    "packagingTag": "工厂知识 · 免费+付费 · ₹799/小时",
    "packagingDesc": "免费模块与计算器 + 针对真实工厂问题的付费一对一辅导。",
    "packagingOpen": "打开软包装 → ₹799/小时",
    "career": "职业与 AI 指导",
    "careerTag": "15 节课 · ₹699/小时",
    "careerDesc": "Gemini、Claude、Grok、ChatGPT、Excel+AI、自由职业、ITR、简历等 — 一对一。",
    "careerOpen": "打开职业与 AI →",
    "logout": "退出登录",
    "language": "语言",
    "langTitle": "国家与语言",
    "langHint": "与 Man Power 相同的选择方式。先选国家，再选语言。",
    "country": "1. 国家",
    "languageSection": "2. 语言",
    "english": "English",
    "hindi": "印地语",
    "done": "完成",
    "closeApp": "关闭 Mentor 应用？",
    "runningInstalled": "正在以已安装的 Mentor 应用运行。",
    "shareTitle": "分享应用",
    "choosePlatform": "选择平台",
    "cancel": "取消",
    "systemShare": "系统分享…",
    "missingNote": "若缺少翻译则显示 English。",
    "viewAsStudent": "以学生身份查看：",
    "selectStudent": "— 选择学生手机号 —",
    "refreshList": "刷新列表"
  },
  "de": {
    "appSubtitle": "1:1-Begleitung",
    "payments": "Zahlungen",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "Teilen",
    "choosePath": "Wählen Sie Ihren Lernpfad",
    "choosePathSub": "Kostenlose Werkmodule + bezahlte 1:1-Sitzungen • Aufzeichnungen & Fragen-Chat",
    "packaging": "Flexible Packaging",
    "packagingTag": "WERKSWISSEN · KOSTENLOS + BEZAHLT · ₹799 / STUNDE",
    "packagingDesc": "Kostenlose Module & Rechner + bezahltes 1:1 zu echten Werkproblemen.",
    "packagingOpen": "Packaging öffnen → ₹799 / Stunde",
    "career": "Karriere- & KI-Begleitung",
    "careerTag": "15 SITZUNGEN · ₹699/STDE",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+KI, Freelancing, ITR, Lebenslauf und mehr — 1:1.",
    "careerOpen": "Karriere & KI öffnen →",
    "logout": "Abmelden",
    "language": "Sprache",
    "langTitle": "Land & Sprache",
    "langHint": "Wie bei Man Power: zuerst Land, dann Sprache wählen.",
    "country": "1. Land",
    "languageSection": "2. Sprache",
    "english": "English",
    "hindi": "Hindi",
    "done": "Fertig",
    "closeApp": "Mentor-App schließen?",
    "runningInstalled": "Läuft als installierte Mentor-App.",
    "shareTitle": "App teilen",
    "choosePlatform": "Plattform wählen",
    "cancel": "Abbrechen",
    "systemShare": "System teilen…",
    "missingNote": "Fehlende Texte → English.",
    "viewAsStudent": "Als Student anzeigen:",
    "selectStudent": "— Student-Handy wählen —",
    "refreshList": "Liste aktualisieren"
  },
  "fr": {
    "appSubtitle": "Accompagnement en tête-à-tête",
    "payments": "Paiements",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "Partager",
    "choosePath": "Choisissez votre parcours",
    "choosePathSub": "Modules usine gratuits + sessions 1:1 payantes • Enregistrements et chat questions",
    "packaging": "Emballage flexible",
    "packagingTag": "SAVOIR USINE · GRATUIT + PAYANT · ₹799 / HEURE",
    "packagingDesc": "Modules et calculateurs gratuits + mentorat payant pour de vrais problèmes d’usine.",
    "packagingOpen": "Ouvrir Packaging → ₹799 / heure",
    "career": "Carrière et IA",
    "careerTag": "15 SÉANCES · ₹699/H",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+IA, freelancing, ITR, CV et plus — en 1:1.",
    "careerOpen": "Ouvrir Carrière et IA →",
    "logout": "Déconnexion",
    "language": "Langue",
    "langTitle": "Pays et langue",
    "langHint": "Comme Man Power : choisissez le pays, puis la langue.",
    "country": "1. Pays",
    "languageSection": "2. Langue",
    "english": "English",
    "hindi": "Hindi",
    "done": "Terminé",
    "closeApp": "Fermer l’application Mentor ?",
    "runningInstalled": "Exécution en tant qu’application Mentor installée.",
    "shareTitle": "Partager l’application",
    "choosePlatform": "Choisir la plateforme",
    "cancel": "Annuler",
    "systemShare": "Partage système…",
    "missingNote": "Traduction manquante → English.",
    "viewAsStudent": "Voir en tant qu’étudiant :",
    "selectStudent": "— Choisir le mobile de l’étudiant —",
    "refreshList": "Actualiser la liste"
  },
  "es": {
    "appSubtitle": "Orientación uno a uno",
    "payments": "Pagos",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "Compartir",
    "choosePath": "Elige tu ruta de orientación",
    "choosePathSub": "Módulos de planta gratis + sesiones 1:1 de pago • Grabaciones y chat de dudas",
    "packaging": "Embalaje flexible",
    "packagingTag": "CONOCIMIENTO DE PLANTA · GRATIS + PAGO · ₹799 / HORA",
    "packagingDesc": "Módulos y calculadoras gratis + mentoría de pago para problemas reales de planta.",
    "packagingOpen": "Abrir Packaging → ₹799 / hora",
    "career": "Carrera e IA",
    "careerTag": "15 SESIONES · ₹699/H",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+IA, freelancing, ITR, currículum y más — uno a uno.",
    "careerOpen": "Abrir Carrera e IA →",
    "logout": "Cerrar sesión",
    "language": "Idioma",
    "langTitle": "País e idioma",
    "langHint": "Igual que Man Power: elige país y luego idioma.",
    "country": "1. País",
    "languageSection": "2. Idioma",
    "english": "English",
    "hindi": "Hindi",
    "done": "Listo",
    "closeApp": "¿Cerrar la app Mentor?",
    "runningInstalled": "Ejecutándose como app Mentor instalada.",
    "shareTitle": "Compartir app",
    "choosePlatform": "Elegir plataforma",
    "cancel": "Cancelar",
    "systemShare": "Compartir del sistema…",
    "missingNote": "Si falta traducción → English.",
    "viewAsStudent": "Ver como estudiante:",
    "selectStudent": "— Seleccionar móvil del estudiante —",
    "refreshList": "Actualizar lista"
  },
  "tr": {
    "appSubtitle": "Bire bir rehberlik",
    "payments": "Ödemeler",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "Paylaş",
    "choosePath": "Rehberlik yolunuzu seçin",
    "choosePathSub": "Ücretsiz tesis modülleri + ücretli bire bir oturumlar • Kayıtlar ve soru sohbeti",
    "packaging": "Esnek ambalaj",
    "packagingTag": "TESİS BİLGİSİ · ÜCRETSİZ + ÜCRETLİ · ₹799 / SAAT",
    "packagingDesc": "Ücretsiz modüller ve hesaplayıcılar + gerçek tesis sorunları için ücretli mentorluk.",
    "packagingOpen": "Ambalajı aç → ₹799 / saat",
    "career": "Kariyer ve Yapay Zeka",
    "careerTag": "15 OTURUM · ₹699/SAAT",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+YZ, serbest çalışma, ITR, özgeçmiş ve daha fazlası — bire bir.",
    "careerOpen": "Kariyer ve YZ aç →",
    "logout": "Çıkış",
    "language": "Dil",
    "langTitle": "Ülke ve dil",
    "langHint": "Man Power gibi: önce ülke, sonra dil.",
    "country": "1. Ülke",
    "languageSection": "2. Dil",
    "english": "English",
    "hindi": "Hintçe",
    "done": "Tamam",
    "closeApp": "Mentor uygulaması kapatılsın mı?",
    "runningInstalled": "Yüklü Mentor uygulaması olarak çalışıyor.",
    "shareTitle": "Uygulamayı paylaş",
    "choosePlatform": "Platform seç",
    "cancel": "İptal",
    "systemShare": "Sistem paylaşımı…",
    "missingNote": "Çeviri yoksa English.",
    "viewAsStudent": "Öğrenci olarak gör:",
    "selectStudent": "— Öğrenci telefonunu seç —",
    "refreshList": "Listeyi yenile"
  },
  "it": {
    "appSubtitle": "Orientamento one-to-one",
    "payments": "Pagamenti",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "Condividi",
    "choosePath": "Scegli il tuo percorso",
    "choosePathSub": "Moduli di stabilimento gratuiti + sessioni 1:1 a pagamento • Registrazioni e chat dubbi",
    "packaging": "Imballaggio flessibile",
    "packagingTag": "CONOSCENZA DI STABILIMENTO · GRATIS + A PAGAMENTO · ₹799 / ORA",
    "packagingDesc": "Moduli e calcolatori gratuiti + mentorship a pagamento per problemi reali di stabilimento.",
    "packagingOpen": "Apri Packaging → ₹799 / ora",
    "career": "Carriera e IA",
    "careerTag": "15 SESSIONI · ₹699/ORA",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+IA, freelancing, ITR, curriculum e altro — one-to-one.",
    "careerOpen": "Apri Carriera e IA →",
    "logout": "Esci",
    "language": "Lingua",
    "langTitle": "Paese e lingua",
    "langHint": "Come Man Power: scegli il paese, poi la lingua.",
    "country": "1. Paese",
    "languageSection": "2. Lingua",
    "english": "English",
    "hindi": "Hindi",
    "done": "Fatto",
    "closeApp": "Chiudere l’app Mentor?",
    "runningInstalled": "In esecuzione come app Mentor installata.",
    "shareTitle": "Condividi app",
    "choosePlatform": "Scegli piattaforma",
    "cancel": "Annulla",
    "systemShare": "Condivisione di sistema…",
    "missingNote": "Traduzione mancante → English.",
    "viewAsStudent": "Visualizza come studente:",
    "selectStudent": "— Seleziona cellulare studente —",
    "refreshList": "Aggiorna elenco"
  },
  "pt": {
    "appSubtitle": "Orientação individual",
    "payments": "Pagamentos",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "Compartilhar",
    "choosePath": "Escolha seu caminho de orientação",
    "choosePathSub": "Módulos de fábrica grátis + sessões 1:1 pagas • Gravações e chat de dúvidas",
    "packaging": "Embalagem flexível",
    "packagingTag": "CONHECIMENTO DE FÁBRICA · GRÁTIS + PAGO · ₹799 / HORA",
    "packagingDesc": "Módulos e calculadoras grátis + mentoria paga para problemas reais de fábrica.",
    "packagingOpen": "Abrir Packaging → ₹799 / hora",
    "career": "Carreira e IA",
    "careerTag": "15 SESSÕES · ₹699/H",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+IA, freelancing, ITR, currículo e mais — individual.",
    "careerOpen": "Abrir Carreira e IA →",
    "logout": "Sair",
    "language": "Idioma",
    "langTitle": "País e idioma",
    "langHint": "Como o Man Power: escolha o país e depois o idioma.",
    "country": "1. País",
    "languageSection": "2. Idioma",
    "english": "English",
    "hindi": "Hindi",
    "done": "Concluído",
    "closeApp": "Fechar o app Mentor?",
    "runningInstalled": "Em execução como app Mentor instalado.",
    "shareTitle": "Compartilhar app",
    "choosePlatform": "Escolher plataforma",
    "cancel": "Cancelar",
    "systemShare": "Compartilhar do sistema…",
    "missingNote": "Sem tradução → English.",
    "viewAsStudent": "Ver como aluno:",
    "selectStudent": "— Selecionar celular do aluno —",
    "refreshList": "Atualizar lista"
  },
  "th": {
    "appSubtitle": "คำปรึกษาตัวต่อตัว",
    "payments": "การชำระเงิน",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "แชร์",
    "choosePath": "เลือกเส้นทางคำปรึกษาของคุณ",
    "choosePathSub": "โมดูลโรงงานฟรี + เซสชันตัวต่อตัวแบบชำระเงิน • บันทึกและแชทถามข้อสงสัย",
    "packaging": "บรรจุภัณฑ์ยืดหยุ่น",
    "packagingTag": "ความรู้โรงงาน · ฟรี + ชำระเงิน · ₹799 / ชั่วโมง",
    "packagingDesc": "โมดูลและเครื่องคิดเลขฟรี + การให้คำปรึกษาแบบชำระเงินสำหรับปัญหาโรงงานจริง",
    "packagingOpen": "เปิด Packaging → ₹799 / ชั่วโมง",
    "career": "อาชีพและ AI",
    "careerTag": "15 เซสชัน · ₹699/ชม.",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, ฟรีแลนซ์, ITR, เรซูเม่ และอื่น ๆ — ตัวต่อตัว",
    "careerOpen": "เปิดอาชีพและ AI →",
    "logout": "ออกจากระบบ",
    "language": "ภาษา",
    "langTitle": "ประเทศและภาษา",
    "langHint": "เหมือน Man Power: เลือกประเทศแล้วเลือกภาษา",
    "country": "1. ประเทศ",
    "languageSection": "2. ภาษา",
    "english": "English",
    "hindi": "ฮินดี",
    "done": "เสร็จสิ้น",
    "closeApp": "ปิดแอป Mentor หรือไม่?",
    "runningInstalled": "ทำงานในฐานะแอป Mentor ที่ติดตั้งแล้ว",
    "shareTitle": "แชร์แอป",
    "choosePlatform": "เลือกแพลตฟอร์ม",
    "cancel": "ยกเลิก",
    "systemShare": "แชร์ของระบบ…",
    "missingNote": "ถ้าไม่มีคำแปลจะแสดง English",
    "viewAsStudent": "ดูในฐานะนักเรียน:",
    "selectStudent": "— เลือกเบอร์นักเรียน —",
    "refreshList": "รีเฟรชรายการ"
  },
  "id": {
    "appSubtitle": "Bimbingan satu-satu",
    "payments": "Pembayaran",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "Bagikan",
    "choosePath": "Pilih jalur bimbingan Anda",
    "choosePathSub": "Modul pabrik gratis + sesi satu-satu berbayar • Rekaman & chat pertanyaan",
    "packaging": "Kemasan fleksibel",
    "packagingTag": "PENGETAHUAN PABRIK · GRATIS + BERBAYAR · ₹799 / JAM",
    "packagingDesc": "Modul & kalkulator gratis + mentoring berbayar untuk masalah pabrik nyata.",
    "packagingOpen": "Buka Packaging → ₹799 / jam",
    "career": "Karier & AI",
    "careerTag": "15 SESI · ₹699/JAM",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, freelancing, ITR, resume, dan lainnya — satu-satu.",
    "careerOpen": "Buka Karier & AI →",
    "logout": "Keluar",
    "language": "Bahasa",
    "langTitle": "Negara & bahasa",
    "langHint": "Seperti Man Power: pilih negara, lalu bahasa.",
    "country": "1. Negara",
    "languageSection": "2. Bahasa",
    "english": "English",
    "hindi": "Hindi",
    "done": "Selesai",
    "closeApp": "Tutup aplikasi Mentor?",
    "runningInstalled": "Berjalan sebagai aplikasi Mentor terpasang.",
    "shareTitle": "Bagikan aplikasi",
    "choosePlatform": "Pilih platform",
    "cancel": "Batal",
    "systemShare": "Bagikan sistem…",
    "missingNote": "Tanpa terjemahan → English.",
    "viewAsStudent": "Lihat sebagai siswa:",
    "selectStudent": "— Pilih ponsel siswa —",
    "refreshList": "Segarkan daftar"
  },
  "vi": {
    "appSubtitle": "Hướng dẫn 1:1",
    "payments": "Thanh toán",
    "playStore": "Play Store · Android",
    "ios": "iPhone / iPad",
    "windows": "Windows / Desktop",
    "share": "Chia sẻ",
    "choosePath": "Chọn lộ trình hướng dẫn của bạn",
    "choosePathSub": "Module nhà máy miễn phí + buổi 1:1 trả phí • Bản ghi & chat hỏi đáp",
    "packaging": "Bao bì linh hoạt",
    "packagingTag": "KIẾN THỨC NHÀ MÁY · MIỄN PHÍ + TRẢ PHÍ · ₹799 / GIỜ",
    "packagingDesc": "Module & máy tính miễn phí + mentoring trả phí cho vấn đề nhà máy thực tế.",
    "packagingOpen": "Mở Packaging → ₹799 / giờ",
    "career": "Sự nghiệp & AI",
    "careerTag": "15 BUỔI · ₹699/GIỜ",
    "careerDesc": "Gemini, Claude, Grok, ChatGPT, Excel+AI, freelance, ITR, CV và hơn thế — 1:1.",
    "careerOpen": "Mở Sự nghiệp & AI →",
    "logout": "Đăng xuất",
    "language": "Ngôn ngữ",
    "langTitle": "Quốc gia & ngôn ngữ",
    "langHint": "Giống Man Power: chọn quốc gia, rồi ngôn ngữ.",
    "country": "1. Quốc gia",
    "languageSection": "2. Ngôn ngữ",
    "english": "English",
    "hindi": "Tiếng Hindi",
    "done": "Xong",
    "closeApp": "Đóng ứng dụng Mentor?",
    "runningInstalled": "Đang chạy dưới dạng ứng dụng Mentor đã cài.",
    "shareTitle": "Chia sẻ ứng dụng",
    "choosePlatform": "Chọn nền tảng",
    "cancel": "Hủy",
    "systemShare": "Chia sẻ hệ thống…",
    "missingNote": "Thiếu bản dịch → English.",
    "viewAsStudent": "Xem với tư cách học viên:",
    "selectStudent": "— Chọn SĐT học viên —",
    "refreshList": "Làm mới danh sách"
  }
};

  function normalizeLang(l) {
    l = String(l || 'en').toLowerCase();
    if (l === 'hindi' || l === 'hin') return 'hi';
    return l || 'en';
  }

  function getCountry() {
    try {
      var c = localStorage.getItem(MP_COUNTRY) || 'IN';
      if (!MG.MENTOR_LOCALES[c]) c = 'IN';
      return c;
    } catch (e) { return 'IN'; }
  }

  function setCountry(c) {
    if (!MG.MENTOR_LOCALES[c]) c = 'IN';
    try { localStorage.setItem(MP_COUNTRY, c); } catch (e) {}
    return c;
  }

  function getLang() {
    try {
      var l = normalizeLang(localStorage.getItem(LANG_KEY) || localStorage.getItem(MP_LANG) || 'en');
      return l;
    } catch (e) { return 'en'; }
  }

  function setLang(lang) {
    lang = normalizeLang(lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
      localStorage.setItem(MP_LANG, lang);
    } catch (e) {}
    MG.lang = lang;
    return lang;
  }

  /** Use selected language pack when present; else English */
  function uiLang() {
    var l = getLang();
    if (STR[l]) return l;
    if (l === 'hin' || l === 'hindi') return 'hi';
    return 'en';
  }

  MG.lang = getLang();
  MG.country = getCountry();

  MG.t = function (key) {
    var pack = STR[uiLang()] || STR.en;
    if (pack[key] != null) return pack[key];
    return STR.en[key] != null ? STR.en[key] : key;
  };

  MG.L = function (hi, en) {
    return uiLang() === 'hi' ? (hi || en) : (en || hi);
  };

  function langLabel() {
    var l = getLang();
    if (l === 'hi') return 'हिं';
    if (l === 'en') return 'EN';
    // show code uppercase for other langs
    return String(l).slice(0, 2).toUpperCase();
  }

  MG.applyLang = function () {
    MG.lang = getLang();
    MG.country = getCountry();
    document.documentElement.setAttribute('lang', uiLang() === 'hi' ? 'hi' : 'en');
    var t = MG.t;

    // Login screen (EN/HI)
    try {
      var map = [
        ['loginTitle', 'loginTitle'],
        ['loginSub', 'loginSub'],
        ['loginInstallTitle', 'installApp'],
        ['loginShareOnly', 'shareApp'],
        ['loginInstallHint', 'installHint']
      ];
      map.forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        if (el) el.textContent = t(pair[1]);
      });
      var ms = document.getElementById('mobileSubmit');
      if (ms) {
        var icon = ms.querySelector('i');
        ms.textContent = '';
        if (icon) ms.appendChild(icon);
        ms.appendChild(document.createTextNode(' ' + t('continueBtn')));
        if (!ms.querySelector('i') && icon) { ms.insertBefore(icon, ms.firstChild); }
      }
      // fix continue button innerHTML more safely
      if (ms) ms.innerHTML = '<i class="fas fa-arrow-right mr-1.5"></i> ' + t('continueBtn');
      var lab = document.querySelector('label[for="mobileInput"], #mobileLabel');
      if (lab) lab.textContent = t('mobileLabel');
      var signed = document.querySelector('#mobileBadge .uppercase, #mobileBadge span.text-\[9px\]');
      // signed-in micro label
      document.querySelectorAll('#mobileBadge span').forEach(function (s) {
        if (/signed in|साइन इन/i.test(s.textContent || '')) s.textContent = t('signedIn');
      });
      var ant = document.getElementById('addNameTitle');
      if (ant) ant.textContent = t('addNameTitle');
      var anb = document.getElementById('addNameBody');
      if (anb) anb.textContent = t('addNameBody');
      var anbtn = document.getElementById('addNameBtn');
      if (anbtn) anbtn.textContent = t('addNameBtn');
      var anl = document.getElementById('addNameLater');
      if (anl) anl.textContent = t('addNameLater');
    } catch (eLoginI18n) {}

    // Workspace + booking chrome
    try {
      var bt = document.getElementById('backToCatalog');
      if (bt) {
        var btxt = bt.querySelector('span') || bt;
        if (btxt && btxt !== bt) btxt.textContent = t('backToPaths');
        else if (!bt.querySelector('i')) bt.textContent = t('backToPaths');
      }
      var chatIn = document.getElementById('chatInput');
      if (chatIn) chatIn.placeholder = t('chatPlaceholder');
      var histH = document.querySelector('#historyModal h3');
      if (histH) histH.textContent = t('paymentHistory');
      var bookH = document.querySelector('#bookingModal h3, #bookingModal .font-bold.text-lg');
      if (bookH && /book|सत्र|1:1/i.test(bookH.textContent || '')) bookH.textContent = t('bookingTitle');
      var payBtn = document.querySelector('#bookingModal button[id*="pay"], #payRazorpayBtn, #bookingPayBtn');
      // pay button by icon lock
      document.querySelectorAll('#bookingModal button').forEach(function (b) {
        if (/Pay Now|भुगतान/i.test(b.textContent || '')) {
          b.innerHTML = '<i class="fas fa-lock"></i> ' + t('payNow');
        }
        if (/Attach Payment|Payment ID/i.test(b.textContent || '') && /optional|वैकल्पिक/i.test(b.textContent || '')) {
          b.innerHTML = '<i class="fas fa-paper-plane mr-1.5"></i> ' + t('attachPayId');
        }
      });
      var selRec = document.querySelector('#workspaceView .text-sm');
      // soft: recording empty handled in JS
      var wsSub = document.querySelector('#workspaceView p.text-xs, #workspaceView .text-slate-500');
    } catch (eWs) {}

    try {
      var bm = document.getElementById('bookingModal');
      if (bm) {
        bm.querySelectorAll('p.text-xs.font-semibold, p.text-xs.font-bold').forEach(function (p) {
          var tx = (p.textContent || '').trim();
          if (/Program|प्रोग्राम/i.test(tx)) p.textContent = t('programTopic');
          if (/Choose track|ट्रैक/i.test(tx)) p.textContent = t('chooseTrack');
          if (/^Package$|पैकेज/i.test(tx)) p.textContent = t('packageLabel');
        });
        bm.querySelectorAll('.hrs-btn').forEach(function (b) {
          var h = b.getAttribute('data-hrs');
          if (h === '1') b.innerHTML = t('hour1');
          if (h === '3') b.innerHTML = t('hours3') + '<br><span class="text-[10px] font-normal text-emerald-600">' + t('off5') + '</span>';
          if (h === '5') b.innerHTML = t('hours5') + '<br><span class="text-[10px] font-normal text-emerald-600">' + t('off10') + '</span>';
        });
      }
    } catch (eBookI18n) {}




    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      var val = t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.placeholder != null) el.placeholder = val;
      } else {
        el.textContent = val;
      }
    });

    var payBtn = document.getElementById('paymentHistoryBtn') || document.querySelector('button[title="Payment History"]');
    if (payBtn) {
      var span = payBtn.querySelector('span.hidden, span.sm\\:inline');
      if (span) span.textContent = t('payments');
      payBtn.setAttribute('title', t('payments'));
    }
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.setAttribute('title', t('logout'));
      logoutBtn.querySelectorAll('span').forEach(function (s) {
        if (/logout|लॉग/i.test(s.textContent)) s.textContent = t('logout');
      });
    }
    var h1 = document.querySelector('header h1');
    if (h1 && /Mentor/i.test(h1.textContent)) {
      var p = h1.parentElement && h1.parentElement.querySelector('p');
      if (p) p.textContent = t('appSubtitle');
    }
    var ps = document.getElementById('mentorPlayStoreBtn');
    if (ps) {
      var spans = ps.querySelectorAll('span');
      if (spans.length) spans[spans.length - 1].textContent = t('playStore');
    }
    var ios = document.getElementById('mentorInstallIosBtn');
    if (ios) {
      var spans2 = ios.querySelectorAll('span');
      if (spans2.length) spans2[spans2.length - 1].textContent = t('ios');
    }
    var desk = document.getElementById('mentorInstallDesktopBtn');
    if (desk) {
      var spans3 = desk.querySelectorAll('span');
      if (spans3.length) spans3[spans3.length - 1].textContent = t('windows');
    }
    var share = document.getElementById('mentorShareBtn');
    if (share) share.innerHTML = '<i class="fas fa-share-nodes"></i> ' + t('share');

    var pathH = document.querySelector('#catalogView h2, .mb-6 h2, .mb-8 h2');
    if (pathH) pathH.textContent = t('choosePath');
    if (pathH && pathH.parentElement) {
      var pathP = pathH.parentElement.querySelector('p');
      if (pathP) pathP.textContent = t('choosePathSub');
    }

    document.querySelectorAll('#categoryPicker h3, #categoryPicker .font-bold, [class*="category"] h3').forEach(function (el) {
      var tx = el.textContent.trim();
      if (/Flexible Packaging|फ्लेक्सिबल/i.test(tx)) el.textContent = t('packaging');
      if (/Career & AI|करियर और AI/i.test(tx)) el.textContent = t('career');
    });
    // tags / descriptions under cards
    document.querySelectorAll('#categoryPicker p, #categoryPicker .text-xs, #categoryPicker .text-sm').forEach(function (el) {
      var tx = (el.textContent || '').trim();
      if (/PLANT KNOWLEDGE|प्लांट नॉलेज/i.test(tx)) el.textContent = t('packagingTag');
      if (/15 SESSIONS|15 सेशन/i.test(tx)) el.textContent = t('careerTag');
      if (/Free modules & calculators|फ्री मॉड्यूल और/i.test(tx)) el.textContent = t('packagingDesc');
      if (/Gemini, Claude|Gemini, Claude, Grok/i.test(tx)) el.textContent = t('careerDesc');
      if (/Open Packaging|पैकेजिंग खोलें/i.test(tx)) el.textContent = t('packagingOpen');
      if (/Open Career|करियर और AI खोलें/i.test(tx)) el.textContent = t('careerOpen');
    });

    document.querySelectorAll('#mentorInstallBar *').forEach(function (el) {
      if (el.children && el.children.length) return;
      var tx = (el.textContent || '').trim();
      if (/Running as installed|इंस्टॉल/i.test(tx)) el.textContent = t('runningInstalled');
    });

    var langBtn = document.getElementById('mentorLangBtn');
    if (langBtn) {
      var lb = langBtn.querySelector('[data-lang-label]');
      if (lb) lb.textContent = langLabel();
      langBtn.setAttribute('title', t('language'));
    }
  };

  MG.openLangPicker = function () {
    try {
      var old = document.getElementById('mentorLangModal');
      if (old) old.remove();
    } catch (e) {}

    var curC = getCountry();
    var curL = getLang();
    var t = MG.t;

    var cHtml = MG.MENTOR_COUNTRY_ORDER.map(function (c) {
      var loc = MG.MENTOR_LOCALES[c];
      if (!loc) return '';
      var on = c === curC;
      return (
        '<button type="button" data-country="' + c + '" class="p-3 rounded-xl text-center text-sm font-semibold transition border ' +
        (on ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-400' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800') +
        '"><div class="text-base mb-0.5">' + (loc.flag || c) + '</div><div class="text-xs opacity-70">' + c + '</div><div>' + loc.name + '</div></button>'
      );
    }).join('');

    function langButtons(country) {
      var langs = ((MG.MENTOR_LOCALES[country] || MG.MENTOR_LOCALES.IN).langs || []).slice();
      // Full UI languages (en/hi) first
      langs.sort(function (a, b) {
        var pa = (MG.PRIMARY_LANGS || ['en', 'hi']).indexOf(normalizeLang(a.code));
        var pb = (MG.PRIMARY_LANGS || ['en', 'hi']).indexOf(normalizeLang(b.code));
        if (pa === -1) pa = 99;
        if (pb === -1) pb = 99;
        return pa - pb;
      });
      return langs.map(function (L) {
        var code = normalizeLang(L.code);
        var on = code === normalizeLang(curL);
        var full = (MG.PRIMARY_LANGS || ['en', 'hi']).indexOf(code) >= 0;
        return (
          '<button type="button" data-lang="' + L.code + '" class="px-3 py-2 rounded-xl border text-sm font-bold min-w-[3.25rem] ' +
          (on ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400' : 'border-slate-200 dark:border-slate-600') +
          '" title="' + (L.title || L.code) + (full ? ' — full app UI' : ' — partial / English fallback') + '">' +
          '<div>' + L.label + '</div>' +
          '<div class="text-[10px] font-medium opacity-70">' + (L.title || '') + '</div>' +
          (full ? '<div class="text-[9px] font-extrabold text-emerald-700 mt-0.5">Full UI</div>' : '<div class="text-[9px] opacity-50 mt-0.5">Partial</div>') +
          '</button>'
        );
      }).join('');
    }

    var modal = document.createElement('div');
    modal.id = 'mentorLangModal';
    modal.className = 'fixed inset-0 z-[100000] flex items-end sm:items-center justify-center bg-black/50 p-3';
    modal.innerHTML =
      '<div class="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-5 border border-slate-200 dark:border-slate-600 max-h-[90vh] overflow-y-auto">' +
      '<div class="text-lg font-bold text-slate-900 dark:text-white mb-1">🌐 ' + t('langTitle') + '</div>' +
      '<div class="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">' + t('langHint') + '</div>' +
      '<div class="text-xs font-bold text-slate-600 mb-2">' + t('country') + '</div>' +
      '<div class="grid grid-cols-3 gap-2 mb-4" id="mentorCountryGrid">' + cHtml + '</div>' +
      '<div class="text-xs font-bold text-slate-600 mb-2">' + t('languageSection') + '</div>' +
      '<div class="flex flex-wrap gap-2 mb-3" id="mentorLangGrid">' + langButtons(curC) + '</div>' +
      '<div class="text-[11px] text-slate-500 mb-4">' + t('missingNote') + '</div>' +
      '<button type="button" id="mentorLangDone" class="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold">✅ ' + t('done') + '</button>' +
      '</div>';

    document.body.appendChild(modal);

    function close() {
      try { modal.remove(); } catch (e) {}
    }

    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });

    var gridC = document.getElementById('mentorCountryGrid');
    if (gridC) {
      gridC.querySelectorAll('[data-country]').forEach(function (btn) {
        btn.addEventListener('click', function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          curC = setCountry(btn.getAttribute('data-country'));
          // refresh modal content for langs
          close();
          MG.openLangPicker();
        });
      });
    }
    var gridL = document.getElementById('mentorLangGrid');
    if (gridL) {
      gridL.querySelectorAll('[data-lang]').forEach(function (btn) {
        btn.addEventListener('click', function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          setLang(btn.getAttribute('data-lang'));
          MG.applyLang();
          close();
        });
      });
    }
    var done = document.getElementById('mentorLangDone');
    if (done) done.addEventListener('click', function (ev) {
      ev.preventDefault();
      close();
    });
  };

  function bindLangButton() {
    var btn = document.getElementById('mentorLangBtn');
    if (!btn) return;
    btn.onclick = function (e) {
      try {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        MG.openLangPicker();
      } catch (err) {
        console.warn('[Mentor lang]', err);
        alert('Language picker error');
      }
    };
  }

  function boot() {
    setCountry(getCountry());
    setLang(getLang());
    bindLangButton();
    try { MG.applyLang(); } catch (e) {}
    setTimeout(function () { try { MG.applyLang(); bindLangButton(); } catch (e) {} }, 400);
    setTimeout(function () { try { MG.applyLang(); } catch (e) {} }, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // expose for landing / debug
  window.MG = MG;
})(window.MG = window.MG || {});

try {
  window.openMentorLangPicker = function () {
    if (window.MG && typeof MG.openLangPicker === 'function') return MG.openLangPicker();
    alert('Language picker is loading… try again in a second.');
  };
} catch (e) {}
