import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "METIS Dashboard — Personalized Health Monitoring",
  description:
    "Your personalized METIS dashboard for maternal and newborn health tracking, nutrition guidance, and early detection.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
