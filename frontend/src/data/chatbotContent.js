// RAKHSHA Assistant Chatbot Content & Guidance Definitions
// Supports both English and Hindi deterministic responses

export const CHATBOT_CONTENT = {
  en: {
    header: {
      title: "RAKHSHA Assistant",
      subtitle: "Here to help you get started",
      minimizeAria: "Minimize chatbot",
      closeAria: "Close chatbot",
      switchLangAria: "Switch language to Hindi"
    },
    initial: {
      greeting: "Hello. How can I help you today?",
      options: [
        {
          id: "complaint_help",
          text: "Help with complaint registration",
          icon: "FileText"
        },
        {
          id: "officer_help",
          text: "Help with officer login",
          icon: "Shield"
        }
      ]
    },
    flows: {
      complaint_help: {
        messages: [
          "Of course. I can guide you through the complaint registration process step by step.",
          "First, you will need to log in or create your complainant account using your name and email address. After logging in, you can provide the details of your case and submit your complaint.",
          "Here is the usual process:\n1. Login / Create account\n2. Enter your basic details\n3. Provide case information\n4. Add location and other relevant details\n5. Review your complaint\n6. Submit the complaint"
        ],
        actionButton: {
          text: "Continue to complaint registration",
          action: "OPEN_CITIZEN_AUTH"
        },
        secondaryActions: [
          { text: "How do I fill the complaint?", target: "complaint_form_info" },
          { text: "Help with officer login", target: "officer_help" }
        ]
      },
      complaint_login_info: {
        messages: [
          "To register a complaint, you first need to log in with your complainant account.",
          "You may be asked for:\n• Your name\n• Your email address\n• Your account/login details"
        ],
        actionButton: {
          text: "Go to complaint login",
          action: "OPEN_CITIZEN_AUTH"
        },
        secondaryActions: [
          { text: "Continue to complaint registration", target: "complaint_help" },
          { text: "Help with officer login", target: "officer_help" }
        ]
      },
      complaint_form_info: {
        messages: [
          "You can describe your case in your own words. Depending on the form, you may be asked for details such as:\n\n• Your name\n• Location\n• Date/time of the incident\n• What happened\n• People involved\n• Relevant supporting information\n\nPlease provide only information you are comfortable sharing and that is requested by the form."
        ],
        actionButton: {
          text: "Go to complaint form",
          action: "NAVIGATE_COMPLAINT_FORM"
        },
        secondaryActions: [
          { text: "Help with officer login", target: "officer_help" }
        ]
      },
      officer_help: {
        messages: [
          "Officer access is restricted to authorized personnel.",
          "To access the officer portal, you need an officer login email and password that has been created or provided by the appropriate higher authority.",
          "If you have not received your officer credentials, please contact your higher authority or system administrator."
        ],
        actionButton: {
          text: "Go to officer login",
          action: "OPEN_OFFICER_AUTH"
        },
        secondaryActions: [
          { text: "Help with complaint registration", target: "complaint_help" }
        ]
      },
      officer_credentials_denied: {
        messages: [
          "Officer credentials are restricted to authorized personnel. Please contact your higher authority or system administrator for access or password assistance."
        ],
        actionButton: {
          text: "Go to officer login",
          action: "OPEN_OFFICER_AUTH"
        },
        secondaryActions: [
          { text: "Help with complaint registration", target: "complaint_help" }
        ]
      },
      emergency: {
        messages: [
          "If you are in immediate danger, please prioritize your safety and contact your local emergency service or a trusted person who can help you immediately."
        ],
        actionButton: {
          text: "Get Immediate Help (Call 14566)",
          action: "CALL_14566"
        },
        secondaryActions: [
          { text: "Call Police SOS (112)", action: "CALL_112" },
          { text: "Continue to complaint registration", target: "complaint_help" }
        ]
      },
      fallback: {
        messages: [
          "I'm currently here to help with complaint registration and officer login. Please choose one of the options below."
        ],
        options: [
          { id: "complaint_help", text: "Complaint registration", icon: "FileText" },
          { id: "officer_help", text: "Officer login", icon: "Shield" }
        ]
      }
    },
    inputPlaceholder: "Ask about complaint filing or officer login..."
  },
  hi: {
    header: {
      title: "रक्षा सहायक",
      subtitle: "आपकी सहायता के लिए यहाँ उपस्थित हैं",
      minimizeAria: "चैटबॉट छोटा करें",
      closeAria: "चैटबॉट बंद करें",
      switchLangAria: "अंग्रेजी में बदलें"
    },
    initial: {
      greeting: "नमस्ते। आज मैं आपकी क्या सहायता कर सकता हूँ?",
      options: [
        {
          id: "complaint_help",
          text: "शिकायत पंजीकरण में सहायता",
          icon: "FileText"
        },
        {
          id: "officer_help",
          text: "अधिकारी लॉगिन में सहायता",
          icon: "Shield"
        }
      ]
    },
    flows: {
      complaint_help: {
        messages: [
          "बिल्कुल। मैं शिकायत पंजीकरण प्रक्रिया के माध्यम से आपका चरण-दर-चरण मार्गदर्शन कर सकता हूँ।",
          "सबसे पहले, आपको अपने नाम और ईमेल पते का उपयोग करके अपना शिकायतकर्ता खाता लॉगिन या बनाना होगा। लॉगिन करने के बाद, आप अपने मामले का विवरण प्रदान कर सकते हैं और अपनी शिकायत दर्ज कर सकते हैं।",
          "सामान्य प्रक्रिया इस प्रकार है:\n1. लॉगिन / खाता बनाएं\n2. अपनी मूल जानकारी दर्ज करें\n3. मामले की जानकारी प्रदान करें\n4. स्थान और अन्य प्रासंगिक विवरण जोड़ें\n5. अपनी शिकायत की समीक्षा करें\n6. शिकायत दर्ज करें"
        ],
        actionButton: {
          text: "शिकायत पंजीकरण पर जाएँ",
          action: "OPEN_CITIZEN_AUTH"
        },
        secondaryActions: [
          { text: "शिकायत कैसे भरें?", target: "complaint_form_info" },
          { text: "अधिकारी लॉगिन में सहायता", target: "officer_help" }
        ]
      },
      complaint_login_info: {
        messages: [
          "शिकायत दर्ज करने के लिए, आपको सबसे पहले अपने शिकायतकर्ता खाते से लॉगिन करना होगा।",
          "आपसे निम्नलिखित जानकारी माँगी जा सकती है:\n• आपका नाम\n• आपका ईमेल पता\n• आपका खाता/लॉगिन विवरण"
        ],
        actionButton: {
          text: "शिकायत लॉगिन पर जाएँ",
          action: "OPEN_CITIZEN_AUTH"
        },
        secondaryActions: [
          { text: "शिकायत पंजीकरण जारी रखें", target: "complaint_help" },
          { text: "अधिकारी लॉगिन में सहायता", target: "officer_help" }
        ]
      },
      complaint_form_info: {
        messages: [
          "आप अपने शब्दों में अपने मामले का वर्णन कर सकते हैं। फ़ॉर्म के आधार पर, आपसे विवरण माँगे जा सकते हैं जैसे:\n\n• आपका नाम\n• स्थान\n• घटना की तिथि/समय\n• क्या हुआ\n• शामिल लोग\n• प्रासंगिक सहायक जानकारी\n\nकृपया केवल वही जानकारी प्रदान करें जिसे साझा करने में आप सहज हैं और जो फ़ॉर्म द्वारा मांगी गई है।"
        ],
        actionButton: {
          text: "शिकायत फ़ॉर्म पर जाएँ",
          action: "NAVIGATE_COMPLAINT_FORM"
        },
        secondaryActions: [
          { text: "अधिकारी लॉगिन में सहायता", target: "officer_help" }
        ]
      },
      officer_help: {
        messages: [
          "अधिकारी पहुंच केवल अधिकृत कर्मियों तक सीमित है।",
          "अधिकारी पोर्टल तक पहुँचने के लिए, आपको उपयुक्त उच्च अधिकारी द्वारा प्रदान किया गया अधिकारी लॉगिन ईमेल और पासवर्ड चाहिए।",
          "यदि आपको अपने अधिकारी क्रेडेंशियल प्राप्त नहीं हुए हैं, तो कृपया अपने उच्च अधिकारी या सिस्टम प्रशासक से संपर्क करें।"
        ],
        actionButton: {
          text: "अधिकारी लॉगिन पर जाएँ",
          action: "OPEN_OFFICER_AUTH"
        },
        secondaryActions: [
          { text: "शिकायत पंजीकरण में सहायता", target: "complaint_help" }
        ]
      },
      officer_credentials_denied: {
        messages: [
          "अधिकारी क्रेडेंशियल केवल अधिकृत कर्मियों तक सीमित हैं। पहुंच या पासवर्ड सहायता के लिए कृपया अपने उच्च अधिकारी या सिस्टम प्रशासक से संपर्क करें।"
        ],
        actionButton: {
          text: "अधिकारी लॉगिन पर जाएँ",
          action: "OPEN_OFFICER_AUTH"
        },
        secondaryActions: [
          { text: "शिकायत पंजीकरण में सहायता", target: "complaint_help" }
        ]
      },
      emergency: {
        messages: [
          "यदि आप तत्काल खतरे में हैं, तो कृपया अपनी सुरक्षा को प्राथमिकता दें और स्थानीय आपातकालीन सेवा या किसी विश्वसनीय व्यक्ति से तुरंत संपर्क करें।"
        ],
        actionButton: {
          text: "तुरंत सहायता प्राप्त करें (14566 कॉल करें)",
          action: "CALL_14566"
        },
        secondaryActions: [
          { text: "पुलिस आपातकालीन सहायता (112)", action: "CALL_112" },
          { text: "शिकायत पंजीकरण जारी रखें", target: "complaint_help" }
        ]
      },
      fallback: {
        messages: [
          "मैं वर्तमान में शिकायत पंजीकरण और अधिकारी लॉगिन में मदद करने के लिए यहाँ हूँ। कृपया नीचे दिए गए विकल्पों में से चुनें।"
        ],
        options: [
          { id: "complaint_help", text: "शिकायत पंजीकरण", icon: "FileText" },
          { id: "officer_help", text: "अधिकारी लॉगिन", icon: "Shield" }
        ]
      }
    },
    inputPlaceholder: "शिकायत दर्ज करने या अधिकारी लॉगिन के बारे में पूछें..."
  }
};

// Keyword Matcher for user typed messages
export const detectIntent = (text) => {
  if (!text || typeof text !== 'string') return 'fallback';
  const lower = text.toLowerCase().trim();

  // Emergency keywords
  const emergencyKeywords = [
    'danger', 'attacking', 'attack', 'not safe', 'unsafe', 'threatening', 'threat', 
    'help me', 'kill', 'weapon', 'khatra', 'hamla', 'madad', 'bachao', 'mar raha', 
    'emergency', 'police'
  ];
  if (emergencyKeywords.some(kw => lower.includes(kw))) {
    return 'emergency';
  }

  // Officer password / credentials request keywords
  const officerCredKeywords = [
    'password', 'credentials', 'officer login id', 'officer password', 'give me login',
    'forgot password', 'create officer', 'passcode', 'credential', 'पासवर्ड', 'क्रेडेंशियल'
  ];
  if (officerCredKeywords.some(kw => lower.includes(kw)) && (lower.includes('officer') || lower.includes('अधिकारी') || lower.includes('password') || lower.includes('pass'))) {
    return 'officer_credentials_denied';
  }

  // Officer login keywords
  const officerKeywords = ['officer', 'duty officer', 'officer login', 'portal access', 'अधिकारी', 'ऑफ़िसर'];
  if (officerKeywords.some(kw => lower.includes(kw))) {
    return 'officer_help';
  }

  // Complaint login specific keywords
  if (lower.includes('how do i login') || lower.includes('complainant login') || lower.includes('citizen login') || lower.includes('login kaise kare') || lower.includes('लॉगिन')) {
    return 'complaint_login_info';
  }

  // Complaint form / how to fill keywords
  if (lower.includes('how do i fill') || lower.includes('form') || lower.includes('information needed') || lower.includes('what to write') || lower.includes('फ़ॉर्म')) {
    return 'complaint_form_info';
  }

  // Complaint registration keywords
  const complaintKeywords = ['complaint', 'register', 'file', 'grievance', 'report', 'atrocity', 'शिकायत', 'पंजीकरण', 'रिपोर्ट'];
  if (complaintKeywords.some(kw => lower.includes(kw))) {
    return 'complaint_help';
  }

  return 'fallback';
};
