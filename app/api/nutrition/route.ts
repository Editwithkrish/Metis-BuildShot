import { storage } from "@/lib/local/storage";
import { type NextRequest } from "next/server";
import { apiError, familyAccount, readJson } from "@/lib/local/api";
import { nutritionInput, nutritionQuery } from "@/lib/local/records";

export async function GET(request: NextRequest) {
  const account = await familyAccount(request);
  if (!account) return apiError("Sign in with a family workspace account.", 401);

  const query = nutritionQuery.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!query.success) return apiError("Invalid nutrition filters.", 400);
  if (query.data.patient_id && !(await storage("ownsPatient", account.id, query.data.patient_id))) return apiError("Patient not found.", 404);

  return Response.json(await storage("nutritionHistory", account.id, query.data));
}

export async function POST(request: NextRequest) {
  const account = await familyAccount(request);
  if (!account) return apiError("Sign in with a family workspace account.", 401);

  const input = nutritionInput.safeParse(await readJson(request));
  if (!input.success) return apiError("Check the nutrition entries and try again.", 400);
  if (!(await storage("ownsPatient", account.id, input.data.patient_id))) return apiError("Patient not found.", 404);

  await storage("addNutrition", input.data);
  return new Response(null, { status: 204 });
}
