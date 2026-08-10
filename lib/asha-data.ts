export type RiskLevel = "high" | "moderate" | "low";

export type ChildRecord = {
  id: string;
  name: string;
  ageMonths: number;
  sex: "Female" | "Male";
  village: string;
  guardian: string;
  lastVisit: string;
  risk: RiskLevel;
  riskScore: number;
  muac: number;
  weight: number;
  followUpDays: number;
  flags: string[];
};

export const ASHA_REGISTRY_STORAGE_KEY = "metis_asha_children";
export const ASHA_SYNC_STORAGE_KEY = "metis_asha_pending_sync";

export const ashaSeedChildren: ChildRecord[] = [
  {
    id: "CH-0241",
    name: "Aarav Jadhav",
    ageMonths: 18,
    sex: "Male",
    village: "Kondhwa",
    guardian: "Meera Jadhav",
    lastVisit: "Today, 09:20",
    risk: "high",
    riskScore: 82,
    muac: 11.1,
    weight: 7.8,
    followUpDays: 0,
    flags: ["MUAC below 11.5 cm", "Poor feeding", "Bilateral oedema"],
  },
  {
    id: "CH-0238",
    name: "Sana Shaikh",
    ageMonths: 9,
    sex: "Female",
    village: "Undri",
    guardian: "Rukhsar Shaikh",
    lastVisit: "Yesterday, 16:40",
    risk: "moderate",
    riskScore: 54,
    muac: 12.2,
    weight: 6.4,
    followUpDays: 2,
    flags: ["Growth faltering", "Vaccination overdue"],
  },
  {
    id: "CH-0234",
    name: "Ishani More",
    ageMonths: 26,
    sex: "Female",
    village: "Mohammadwadi",
    guardian: "Kavita More",
    lastVisit: "03 Aug, 11:15",
    risk: "low",
    riskScore: 18,
    muac: 13.8,
    weight: 11.2,
    followUpDays: 18,
    flags: [],
  },
  {
    id: "CH-0229",
    name: "Vihaan Pawar",
    ageMonths: 14,
    sex: "Male",
    village: "Handewadi",
    guardian: "Anita Pawar",
    lastVisit: "01 Aug, 14:05",
    risk: "moderate",
    riskScore: 47,
    muac: 12.4,
    weight: 7.1,
    followUpDays: 4,
    flags: ["Diarrhoea for 3 days", "Weight below trend"],
  },
  {
    id: "CH-0225",
    name: "Myra Kamble",
    ageMonths: 32,
    sex: "Female",
    village: "Pisoli",
    guardian: "Rani Kamble",
    lastVisit: "30 Jul, 10:10",
    risk: "low",
    riskScore: 12,
    muac: 14.1,
    weight: 12.5,
    followUpDays: 24,
    flags: [],
  },
];
