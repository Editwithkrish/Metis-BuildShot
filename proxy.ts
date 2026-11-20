import { storage, getRequestAccount } from "@/lib/local/storage";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const account = await getRequestAccount(request);
  const redirect = (destination: string) => NextResponse.redirect(new URL(destination, request.url));

  // Preserve the legacy dashboard links to the field workspace.
  if (path === "/dashboard/asha" || path.startsWith("/dashboard/asha/")) {
    return redirect(path.slice("/dashboard".length));
  }
  if (path === "/asha/login") return NextResponse.next();
  if (path === "/asha" || path.startsWith("/asha/")) {
    return account?.role === "asha" ? NextResponse.next() : redirect("/asha/login");
  }
  if (!account) return redirect("/auth");
  if (account.role === "asha") return redirect("/asha");

  const onboarded = Boolean(await storage("getProfile", account));
  if (path === "/onboarding") {
    return onboarded ? redirect("/dashboard") : NextResponse.next();
  }

  return onboarded ? NextResponse.next() : redirect("/onboarding");
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/asha/:path*"],
};
