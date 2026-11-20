import { storage } from "@/lib/local/storage";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionCookie } from "@/lib/local/session";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const account = await storage("getAccount", (await cookies()).get(sessionCookie)?.value);
  if (!account) redirect("/auth");
  if (account.role === "asha") redirect("/asha");

  return <OnboardingForm role={account.role} />;
}
