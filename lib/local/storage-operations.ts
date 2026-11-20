import * as data from "./data";
import { createSession, getAccount, removeSession } from "./session";

export const storageOperations = {
  getProfile: data.getProfile,
  completeProfile: data.completeProfile,
  listPatients: data.listPatients,
  createPatient: data.createPatient,
  ownsPatient: data.ownsPatient,
  growthHistory: data.growthHistory,
  addGrowth: data.addGrowth,
  nutritionHistory: data.nutritionHistory,
  addNutrition: data.addNutrition,
  createSession,
  getAccount,
  removeSession,
};
