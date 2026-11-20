import { storage } from "@/lib/local/storage";
import { type NextRequest } from "next/server";
import { apiError, familyAccount, readJson } from "@/lib/local/api";
import { patientInput } from "@/lib/local/records";

export async function GET(request: NextRequest) {
  const account = await familyAccount(request);
  if (!account) return apiError("Sign in with a family workspace account.", 401);

  const [patients, profile] = await Promise.all([
    storage("listPatients", account.id),
    storage("getProfile", account),
  ]);
  return Response.json({ patients, profile });
}

export async function POST(request: NextRequest) {
  const account = await familyAccount(request);
  if (!account) return apiError("Sign in with a family workspace account.", 401);
  if (!(await storage("getProfile", account))) return apiError("Complete onboarding first.", 409);

  const input = patientInput.safeParse(await readJson(request));
  if (!input.success || !input.data.gender) return apiError("Enter a valid patient name, date of birth, and gender.", 400);

  return Response.json(await storage("createPatient", account.id, input.data), { status: 201 });
}
