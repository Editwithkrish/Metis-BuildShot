import { z } from "zod";
import { type Account } from "./session";

const dateSchema = z.string().date();
const timestampSchema = z.string().datetime();
const text = z.string().trim().max(200);

export const profileInput = z.object({
  name: text.min(1),
  detail: text,
  language: text,
  alertType: text,
  dataSource: text,
  weight: text,
  height: text,
  dob: z.union([dateSchema, z.literal("")]),
  feedingStatus: text,
  clinicalLoad: text,
  babyName: text,
  gender: text,
  goal: text.nullable(),
});

export const patientInput = z.object({
  full_name: text.min(1),
  dob: dateSchema.nullable(),
  gender: text,
  initial_weight: text,
  initial_height: text,
  relationship_type: z.enum(["self", "child", "patient", "subject"]),
});

export const growthInput = z.object({
  patient_id: z.string().uuid(),
  weight: z.number().finite().positive(),
  height: z.number().finite().positive().nullable(),
  logged_at: dateSchema,
});

export const nutritionInput = z.object({
  patient_id: z.string().uuid(),
  entries: z.array(z.object({
    meal_type: text.min(1),
    food_name: text,
    quantity: text,
    calories: z.number().finite().nonnegative(),
    protein: z.number().finite().nonnegative(),
    carbs: z.number().finite().nonnegative(),
    fats: z.number().finite().nonnegative(),
  })).min(1),
  logged_at: timestampSchema,
});

export const nutritionQuery = z.object({
  patient_id: z.string().uuid().optional(),
  since: timestampSchema.optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type Profile = { full_name: string; role: Exclude<Account["role"], "asha"> };
export type Patient = z.infer<typeof patientInput> & { id: string };
export type GrowthEntry = Omit<z.infer<typeof growthInput>, "patient_id"> & { id: number };
export type NutritionEntry = z.infer<typeof nutritionInput>["entries"][number] & {
  id: number;
  logged_at: string;
};
