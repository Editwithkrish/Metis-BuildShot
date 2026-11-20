import { randomUUID } from "node:crypto";
import { type z } from "zod";
import { db, transaction } from "./db";
import { type Account } from "./session";
import {
  type GrowthEntry, type NutritionEntry, type Patient, type Profile,
  type growthInput, type nutritionInput, type nutritionQuery, type patientInput, type profileInput,
} from "./records";

export function getProfile(account: Account): Profile | null {
  const row = db().prepare("SELECT full_name FROM profiles WHERE account_id = ?").get(account.id);
  if (!row || account.role === "asha") return null;
  return { full_name: String(row.full_name), role: account.role };
}

export function completeProfile(account: Account, profile: z.infer<typeof profileInput>) {
  transaction((connection) => {
    const result = connection.prepare("INSERT INTO profiles VALUES (?, ?, ?) ON CONFLICT DO NOTHING")
      .run(account.id, profile.name, JSON.stringify(profile));

    if (result.changes && (account.role === "ind" || account.role === "mother")) {
      createPatient(account.id, {
        full_name: account.role === "ind" ? profile.name : profile.babyName || "Baby",
        dob: profile.dob || null,
        gender: profile.gender,
        initial_weight: profile.weight,
        initial_height: profile.height,
        relationship_type: account.role === "ind" ? "self" : "child",
      });
    }
  });
}

export function listPatients(ownerId: string) {
  return db().prepare(`
    SELECT id, full_name, dob, gender, initial_weight, initial_height, relationship_type
    FROM patients WHERE owner_id = ? ORDER BY rowid
  `).all(ownerId) as Patient[];
}

export function createPatient(ownerId: string, input: z.infer<typeof patientInput>): Patient {
  const patient = { id: randomUUID(), ...input };
  db().prepare("INSERT INTO patients VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(patient.id, ownerId, patient.full_name, patient.dob, patient.gender,
      patient.initial_weight, patient.initial_height, patient.relationship_type);
  return patient;
}

export function ownsPatient(ownerId: string, patientId: string) {
  return Boolean(db().prepare("SELECT 1 FROM patients WHERE owner_id = ? AND id = ?").get(ownerId, patientId));
}

export function growthHistory(patientId: string) {
  return db().prepare(`
    SELECT id, weight, height, logged_at FROM growth_logs WHERE patient_id = ? ORDER BY logged_at, id
  `).all(patientId) as GrowthEntry[];
}

export function addGrowth(input: z.infer<typeof growthInput>) {
  transaction((connection) => {
    connection.prepare("INSERT INTO growth_logs (patient_id, weight, height, logged_at) VALUES (?, ?, ?, ?)")
      .run(input.patient_id, input.weight, input.height, input.logged_at);
    connection.prepare("UPDATE patients SET initial_weight = ?, initial_height = COALESCE(?, initial_height) WHERE id = ?")
      .run(String(input.weight), input.height?.toString() ?? null, input.patient_id);
  });
}

export function nutritionHistory(ownerId: string, query: z.infer<typeof nutritionQuery>) {
  const order = query.order === "asc" ? "ASC" : "DESC";
  return db().prepare(`
    SELECT logs.id, meal_type, food_name, quantity, calories, protein, carbs, fats, logged_at
    FROM nutrition_logs AS logs JOIN patients ON patients.id = logs.patient_id
    WHERE patients.owner_id = ? AND patients.id = COALESCE(?, patients.id) AND logged_at >= ?
    ORDER BY logged_at ${order}, logs.id ${order}
  `).all(ownerId, query.patient_id ?? null, query.since ?? "") as NutritionEntry[];
}

export function addNutrition(input: z.infer<typeof nutritionInput>) {
  transaction((connection) => {
    const insert = connection.prepare(`
      INSERT INTO nutrition_logs (patient_id, meal_type, food_name, quantity, calories, protein, carbs, fats, logged_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const entry of input.entries) {
      insert.run(input.patient_id, entry.meal_type, entry.food_name, entry.quantity,
        entry.calories, entry.protein, entry.carbs, entry.fats, input.logged_at);
    }
  });
}
