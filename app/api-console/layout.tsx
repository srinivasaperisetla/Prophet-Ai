import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getUserWithTokenLedger } from "@/lib/actions";
import { DashBoardNavBarClient } from "@/components/DashBoardNavBarClient";
import { TokenDisplayData } from "@/lib/types";

export default async function ApiConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  let tokenData: TokenDisplayData | null = null;
  if (userId) {
    try {
      const user = await getUserWithTokenLedger(userId);
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
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <DashBoardNavBarClient tokenData={tokenData} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
