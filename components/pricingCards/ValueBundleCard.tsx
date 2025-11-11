"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Coins, Check, Loader2 } from "lucide-react";
import { checkoutCredits } from "@/lib/transaction.action";
import { useRouter } from "next/navigation";

export const ValueBundleCard = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    setIsLoading(true);
    try {
      await checkoutCredits({
        plan: "value-pack",
        userId: userId,
      });
    } catch (error) {
      console.error("Error initiating checkout:", error);
      alert("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-800/50 p-6 transition-colors hover:border-purple-500/50">
      <div className="mt-2 text-center">
        <div className="mb-4 flex justify-center gap-4">
          <Coins className="h-8 w-8 rounded-full text-purple-400" />
          <Coins className="h-8 w-8 rounded-full text-purple-400" />
          <Coins className="h-8 w-8 rounded-full text-purple-400" />
        </div>
        <h3 className="mt-2 mb-2 text-2xl font-bold text-white">Value Pack</h3>
        <div className="mb-2 rounded-full px-3 py-1 text-4xl font-bold text-purple-400">
          $20
        </div>

        <div className="font-xl mb-6 rounded-full px-3 py-1 font-bold text-zinc-400">
          2,500 Tokens
        </div>

        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-white">2,500 Tokens</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-white">$0.008 per Token</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-white">
              Best For: Regular users and Lower rates
            </span>
          </div>
          <div className="mt-4 text-center text-sm text-zinc-400"></div>
        </div>

        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="mt-6 w-full cursor-pointer rounded-lg bg-purple-600 px-4 py-3 font-bold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            "Purchase"
          )}
        </button>
      </div>
    </div>
  );
};
