import { storage } from "@/lib/local/storage";
import { type NextRequest } from "next/server";
import { apiError, familyAccount, readJson } from "@/lib/local/api";
import { profileInput } from "@/lib/local/records";

export async function POST(request: NextRequest) {
  const account = await familyAccount(request);
  if (!account) return apiError("Sign in with a family workspace account.", 401);

  const input = profileInput.safeParse(await readJson(request));
  if (!input.success) return apiError("Enter your name and check your profile details.", 400);

  await storage("completeProfile", account, input.data);
  return new Response(null, { status: 204 });
}
