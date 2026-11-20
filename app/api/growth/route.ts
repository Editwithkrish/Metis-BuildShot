import { storage } from "@/lib/local/storage";
import { type NextRequest } from "next/server";
import { apiError, familyAccount, readJson } from "@/lib/local/api";
import { growthInput } from "@/lib/local/records";

export async function GET(request: NextRequest) {
  const account = await familyAccount(request);
  if (!account) return apiError("Sign in with a family workspace account.", 401);

  const patientId = request.nextUrl.searchParams.get("patient_id");
  if (!patientId || !(await storage("ownsPatient", account.id, patientId))) return apiError("Patient not found.", 404);

  return Response.json(await storage("growthHistory", patientId));
}

export async function POST(request: NextRequest) {
  const account = await familyAccount(request);
  if (!account) return apiError("Sign in with a family workspace account.", 401);

  const input = growthInput.safeParse(await readJson(request));
  if (!input.success) return apiError("Enter a positive weight and, if provided, a positive height.", 400);
  if (!(await storage("ownsPatient", account.id, input.data.patient_id))) return apiError("Patient not found.", 404);

  await storage("addGrowth", input.data);
  return new Response(null, { status: 204 });
}
