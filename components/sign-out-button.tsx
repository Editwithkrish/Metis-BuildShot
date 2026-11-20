"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { localRequest } from "@/lib/local/request";

export function SignOutButton({ className, destination = "/auth" }: { className: string; destination?: string }) {
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await localRequest("/api/session", { method: "DELETE" });
      window.location.assign(destination);
    } catch {
      toast.error("Could not sign out. Please try again.");
      setPending(false);
    }
  }

  return (
    <button type="button" title="Sign out" aria-label="Sign out" className={className} onClick={signOut} disabled={pending}>
      <LogOut className="w-[18px] h-[18px]" />
    </button>
  );
}
