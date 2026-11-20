import { type NextRequest } from "next/server";
import { getRequestAccount } from "./storage";

export async function familyAccount(request: NextRequest) {
  const account = await getRequestAccount(request);
  return account?.role === "asha" ? null : account;
}

export function apiError(error: string, status: number) {
  return Response.json({ error }, { status });
}

export function readJson(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") return null;
  return request.json().catch(() => null);
}
