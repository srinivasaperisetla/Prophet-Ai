import React from "react";
import { getUser } from "@/lib/user-actions";
import { DashBoardNavBarClient } from "@/components/DashBoardNavBarClient";
import { TokenDisplayData } from "@/lib/types";

export default async function ApiConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let tokenData: TokenDisplayData | null = null;

  try {
    const user = await getUser();
    if (user && user.token_ledger) {
      tokenData = {
        available: user.token_ledger.available || 0,
        used: user.token_ledger.used || 0,
        billing_model: user.billing_model || "pay-per-token",
      };
    }
  } catch (error) {
    console.error("Error fetching token data:", error);
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <DashBoardNavBarClient tokenData={tokenData} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
