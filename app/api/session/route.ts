import { storage } from "@/lib/local/storage";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, readJson } from "@/lib/local/api";
import { authenticate, sessionCookie, sessionMaxAge } from "@/lib/local/session";

const credentials = z.object({
  email: z.string().max(254),
  password: z.string().max(256),
});

export async function POST(request: NextRequest) {
  const input = credentials.safeParse(await readJson(request));
  const account = input.success ? authenticate(input.data.email, input.data.password) : null;
  if (!account) return apiError("Incorrect email or password.", 401);

  const profile = account.role === "asha" ? null : await storage("getProfile", account);
  const destination = account.role === "asha" ? "/asha" : profile ? "/dashboard" : "/onboarding";
  const response = NextResponse.json({ destination });
  const priorToken = request.cookies.get(sessionCookie)?.value;
  if (priorToken) await storage("removeSession", priorToken);
  response.cookies.set(sessionCookie, await storage("createSession", account), {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: sessionMaxAge,
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  const priorToken = request.cookies.get(sessionCookie)?.value;
  if (priorToken) await storage("removeSession", priorToken);
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(sessionCookie);
  return response;
}
