export type Language = 'en' | 'hi' | 'mr' | 'bn';

export interface TranslationStrings {
  nav: {
    features: string;
    howItWorks: string;
    impact: string;
    resources: string;
    security: string;
    signIn: string;
    launchApp: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: {
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
  };
  footer: {
    description: string;
    rights: string;
  };
  dashboard: {
    welcome: string;
    riskScore: string;
    lowRisk: string;
    healthTip: string;
    consultations: string;
  };
  onboarding: {
    welcome: string;
    continue: string;
    launchDashboard: string;
  };
}

export const translations: Record<Language, TranslationStrings> = {
  en: {
    nav: {
      features: "Features",
      howItWorks: "How It Works",
      impact: "Impact",
      resources: "Resources",
      security: "Security",
      signIn: "Sign in",
      launchApp: "Launch App",
    },
    hero: {
      badge: "MIT-ADT AI Grand Challenge 2026 | Team BuildShot",
      titleLine1: "Intelligent health,",
      titleLine2: "AI that will ",
      titleLine3: "care",
      subtitle: "AI-powered nutrition and health monitoring for all ages. Early detection, personalized guidance, and global clinical impact tracking.",
      ctaPrimary: "Launch App",
      ctaSecondary: "Watch Demo",
    },
    stats: {
      stat1Value: "70%",
      stat1Label: "malnutrition cases are preventable",
      stat2Value: "40%",
      stat2Label: "linked to awareness gaps",
      stat3Value: "35%",
      stat3Label: "due to infrastructure gaps",
    },
    footer: {
      description: "AI-powered nutrition and health monitoring for all ages. Early detection, personalized guidance, and global clinical impact tracking.",
      rights: "METIS by Team BuildShot. All rights reserved.",
    },
    dashboard: {
      welcome: "Welcome back",
      riskScore: "Malnutrition Risk Score",
      lowRisk: "LOW RISK",
      healthTip: "Health Tip",
      consultations: "Consultations",
    },
    onboarding: {
      welcome: "Welcome to",
      continue: "Continue",
      launchDashboard: "Launch Dashboard",
    }
  },
  hi: {
    nav: {
      features: "विशेषताएं",
      howItWorks: "यह कैसे काम करता है",
      impact: "प्रभाव",
      resources: "संसाधन",
      security: "सुरक्षा",
      signIn: "लॉग इन करें",
      launchApp: "ऐप शुरू करें",
    },
    hero: {
      badge: "क्लिनिकल-ग्रेड मातृत्व AI",
      titleLine1: "बुद्धिमान स्वास्थ्य,",
      titleLine2: "AI जो करेगा ",
      titleLine3: "देखभाल",
      subtitle: "सभी उम्र के लिए AI-संचालित पोषण और स्वास्थ्य निगरानी। शीघ्र पहचान, व्यक्तिगत मार्गदर्शन और वैश्विक नैदानिक प्रभाव ट्रैकिंग।",
      ctaPrimary: "ऐप शुरू करें",
      ctaSecondary: "डेमो देखें",
    },
    stats: {
      stat1Value: "70%",
      stat1Label: "कुपोषण के मामलों को रोका जा सकता है",
      stat2Value: "40%",
      stat2Label: "जागरूकता की कमी से जुड़े",
      stat3Value: "35%",
      stat3Label: "बुनियादी ढांचे की कमी के कारण",
    },
    footer: {
      description: "सभी उम्र के लिए AI-संचालित पोषण और स्वास्थ्य निगरानी। शीघ्र पहचान, व्यक्तिगत मार्गदर्शन और वैश्विक नैदानिक प्रभाव ट्रैकिंग।",
      rights: "Team BuildShot द्वारा METIS। सर्वाधिकार सुरक्षित।",
    },
    dashboard: {
      welcome: "स्वागत है",
      riskScore: "कुपोषण जोखिम स्कोर",
      lowRisk: "कम जोखिम",
      healthTip: "स्वास्थ्य सुझाव",
      consultations: "परामर्श",
    },
    onboarding: {
      welcome: "स्वागत है",
      continue: "जारी रखें",
      launchDashboard: "डैशबोर्ड शुरू करें",
    }
  },
  mr: {
    nav: {
      features: "वैशिष्ट्ये",
      howItWorks: "हे कसे कार्य करते",
      impact: "प्रभाव",
      resources: "संसाधने",
      security: "सुरक्षा",
      signIn: "साइन इन करा",
      launchApp: "अॅप लाँच करा",
    },
    hero: {
      badge: "क्लिनिकल-ग्रेड मातृत्व AI",
      titleLine1: "बुद्धिमान आरोग्य,",
      titleLine2: "AI जो करेल ",
      titleLine3: "काळजी",
      subtitle: "सर्व वयोगटांसाठी AI-आधारित पोषण आणि आरोग्य देखरेख. लवकर निदान, वैयक्तिक मार्गदर्शन आणि जागतिक क्लिनिकल प्रभाव ट्रॅकिंग.",
      ctaPrimary: "अॅप लाँच करा",
      ctaSecondary: "डेमो पहा",
    },
    stats: {
      stat1Value: "70%",
      stat1Label: "कुपोषण प्रकरणे टाळता येतात",
      stat2Value: "40%",
      stat2Label: "जागरूकतेच्या अभावाशी संबंधित",
      stat3Value: "35%",
      stat3Label: "पायाभूत सुविधांच्या अभावामुळे",
    },
    footer: {
      description: "सर्व वयोगटांसाठी AI-आधारित पोषण आणि आरोग्य देखरेख. लवकर निदान, वैयक्तिक मार्गदर्शन आणि जागतिक क्लिनिकल प्रभाव ट्रॅकिंग.",
      rights: "Team BuildShot द्वारे METIS. सर्व हक्क राखीव.",
    },
    dashboard: {
      welcome: "स्वागत आहे",
      riskScore: "कुपोषण जोखीम स्कोर",
      lowRisk: "कमी जोखीम",
      healthTip: "आरोग्य टीप",
      consultations: "परामर्श",
    },
    onboarding: {
      welcome: "मध्ये आपले स्वागत आहे",
      continue: "पुढे जा",
      launchDashboard: "डैशबोर्ड सुरू करा",
    }
  },
  bn: {
    nav: {
      features: "বৈশিষ্ট্য",
      howItWorks: "কিভাবে কাজ করে",
      impact: "প্রভাব",
      resources: "সম্পদ",
      security: "নিরাপত্তা",
      signIn: "সাইন ইন করুন",
      launchApp: "অ্যাপ শুরু করুন",
    },
    hero: {
      badge: "ক্লিনিকাল-গ্রেড মাতৃত্ব AI",
      titleLine1: "বুদ্ধিমান স্বাস্থ্য,",
      titleLine2: "AI যা করবে ",
      titleLine3: "যত্ন",
      subtitle: "সব বয়সের জন্য AI-চালিত পুষ্টি এবং স্বাস্থ্য পর্যবেক্ষণ। প্রাথমিক সনাক্তকরণ, ব্যক্তিগত নির্দেশিকা এবং বিশ্বব্যাপী ক্লিনিকাল প্রভাব ট্র্যাকিং।",
      ctaPrimary: "অ্যাপ শুরু করুন",
      ctaSecondary: "ডেমো দেখুন",
    },
    stats: {
      stat1Value: "70%",
      stat1Label: "অপুষ্টির ঘটনা প্রতিরোধযোগ্য",
      stat2Value: "40%",
      stat2Label: "সচেতনতার অভাবের সাথে যুক্ত",
      stat3Value: "35%",
      stat3Label: "পরিকাঠামো অভাবের কারণে",
    },
    footer: {
      description: "সব বয়সের জন্য AI-চালিত পুষ্টি এবং স্বাস্থ্য পর্যবেক্ষণ। প্রাথমিক সনাক্তকরণ, ব্যক্তিগত নির্দেশিকা এবং বিশ্বব্যাপী ক্লিনিকাল প্রভাব ট্র্যাকিং।",
      rights: "Team BuildShot দ্বারা METIS। সমস্ত অধিকার সংরক্ষিত।",
    },
    dashboard: {
      welcome: "স্বাগতম",
      riskScore: "অপুষ্টির ঝুঁকির স্কোর",
      lowRisk: "স্বল্প ঝুঁকি",
      healthTip: "স্বাস্থ্য টিপ",
      consultations: "পরামর্শ",
    },
    onboarding: {
      welcome: "স্বাগতম",
      continue: "চালিয়ে যান",
      launchDashboard: "ড্যাশবোর্ড চালু করুন",
    }
  }
};
