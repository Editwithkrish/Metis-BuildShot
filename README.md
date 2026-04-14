# 🌿 METIS — Motherhood & Newborn Care Intelligence Platform

> **MIT-ADT AI Grand Challenge 2026**
> Problem Statement ID: **Healthcare-3**
> Theme: Healthcare | Category: Software | Team: **BuildShot**

---

## 📌 Overview

**METIS** is an AI-powered nutrition and health monitoring platform designed to detect malnutrition early and provide personalized nutrition guidance with continuous health tracking. It serves children, adults, and the elderly — with special focus on maternal and newborn care.

The platform combines **image-based AI analysis** with **growth and health data** to generate real-time malnutrition risk scores, deliver localized diet recommendations, and connect users with healthcare resources and government schemes.

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| 🧠 **Hybrid AI Detection** | Malnutrition detection using image analysis + health data (BMI, growth, symptoms) |
| 📊 **Early Risk Alerts & Dashboards** | Real-time risk scoring with health insights and trend tracking |
| 👶 **AI Cry Detection** | Infant cry analysis with reason prediction for early care intervention |
| 🥗 **Personalized Nutrition Planning** | Local food-based diet recommendations tailored to user profile |
| 🚨 **Smart Healthcare Access** | SOS alerts, doctor consultation & govt scheme eligibility support |
| 🌐 **Multilingual & Offline Support** | Voice chatbot + SMS reminders for low-internet/rural areas |
| 📱 **PWA / Mobile Support** | Progressive Web App accessible on web and mobile devices |

---

## 🏗️ System Architecture

```
User
 └─► Next.js Frontend (PWA)
       └─► Express REST API
             ├─► AI Processing (TensorFlow.js + Gemini LLM)
             ├─► MongoDB Storage (User Records, Growth Data, Nutrition Data)
             ├─► Real-time Alerts (Socket.io)
             └─► External Services
                   ├─► Email & Notification Service
                   ├─► SMS Gateway (Offline Alerts)
                   ├─► Govt. Health Scheme API Integration
                   ├─► Cloud Deployment
                   └─► Web Analytics
```

### Role-Based Access

| Role | Capabilities |
|---|---|
| **Individuals / Parents** | Malnutrition risk score view, personalized nutrition recommendations, AI cry detection insights, health reminders & alerts |
| **Doctors** | Patient monitoring dashboard, early warning alerts & reports, consultation & chat access |
| **Admin** | Database management, user roles & permissions, analytics & reporting dashboard |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js**, **React.js** — Fast, scalable, SEO-friendly UI
- **TypeScript** — Type safety
- **Tailwind CSS**, **Framer Motion** — Responsive UI and animations
- **Redux** — Global state management (user profiles, health data, AI results)
- **Axios** — Backend API communication

### Backend
- **Node.js**, **Express.js** — REST API server
- **MongoDB**, **Mongoose** — Database for user profiles, nutrition records, growth data
- **Socket.io** — Real-time alerts and risk notifications

### AI & Machine Learning
- **TensorFlow.js** — Client/server-side malnutrition detection from images and health data
- **Gemini LLM** — Multilingual chatbot, nutrition recommendations, health guidance
- **PyTorch** *(optional)* — Fine-tuning detection models for improved accuracy

### API & External Services
- **Clerk** — Secure authentication and role-based access
- **Cloudinary** — Image uploads for AI analysis
- **Gmail API** — Email notifications and reports
- **LinkedIn API**, **GitHub API** — Extended integrations

### Deployment & DevOps
- **Vercel** — Frontend deployment
- **GitHub / Git** — Version control
- **Docker** *(optional)* — Containerization

### Tools & Utilities
- **Postman** — API testing
- **Jest** — Unit testing
- **ESLint**, **Prettier** — Code quality
- **Figma** — UI/UX design
- **Trello / Jira** — Project management

### Analytics & Monitoring
- **Google Analytics**, **LogRocket**, **Sentry**

---

## 📋 Use Cases

1. Individual nutrition monitoring for families
2. Anganwadi worker child screening
3. School health checkup programs
4. Rural healthcare centers for early malnutrition detection
5. NGO-driven malnutrition awareness campaigns
6. Elderly nutrition monitoring at home

---

## ✅ Feasibility

- Uses **accessible AI + web technologies** — no special hardware required
- Works with **existing public health datasets**
- **Scalable cloud-based architecture**
- Usable by individuals, NGOs, hospitals, and government bodies
- **Low-cost deployment** with modular architecture for future healthcare integration

---

## ⚠️ Challenges

1. Limited availability of high-quality malnutrition image datasets
2. Ensuring AI accuracy across diverse age groups and body types
3. User data privacy and healthcare compliance requirements
4. Adoption barriers in rural areas due to digital literacy
5. Real-time AI processing performance on low-end devices

---

## 🏛️ Government & Social Impact Potential

- Integration with **national health & nutrition programs**
- Partnerships with **NGOs & public healthcare networks**
- **Data-driven policymaking** using nutrition analytics
- **Reduced healthcare costs** through early detection

### Impact Statistics

- **70%** of severe malnutrition cases are preventable with awareness & basic care
- **40%** of cases are linked to lack of maternal awareness & delayed care
- **35%** are attributed to healthcare infrastructure gaps
- **25%** involve high-risk medical conditions requiring advanced intervention

---

## 📚 Research & References

### Primary Research
- Consulted practicing **pediatricians and maternal health doctors**
- Discussed real challenges faced by new mothers
- Validated baby tracking, vaccination, and monitoring features with clinical feedback

### Secondary Research
- Referred to national immunization schedules
- Studied WHO child growth standards
- Analyzed existing motherhood care platforms

### Key References
- [WHO Child Growth Standards](https://www.who.int/tools/child-growth-standards)
- [National Immunization Schedule (India)](https://nhm.gov.in)
- [UNICEF Newborn Care Resources](https://www.unicef.org/health/newborn-care)
- Ministry of Health & Family Welfare (India)

---

## 👥 Team & Contributors

**Team BuildShot** — MIT-ADT University, Pune, India

- **Krishna** — Lead Architect & Ecosystem Integration
- **Pratik** — AI Research & Core Backend Developer
- **Varad** — Product Design & Frontend Development

---

## 📄 License

This project was developed as part of the **MIT-ADT AI Grand Challenge 2026** under the Healthcare theme. All rights reserved by Team BuildShot.
