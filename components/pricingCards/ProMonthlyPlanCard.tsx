"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Coins, Check, Loader2 } from "lucide-react";
import { checkoutCredits } from "@/lib/transaction.action";
import { useRouter } from "next/navigation";

export const ProMonthlyPlanCard = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    setIsLoading(true);
    try {
      await checkoutCredits({
        plan: "pro",
        userId: userId,
      });
    } catch (error) {
      // Don't show error for redirects - they're expected
      // Redirect errors have a specific digest or message pattern
      if (
        error instanceof Error &&
        (error.message === "NEXT_REDIRECT" ||
          (error as any).digest?.includes("NEXT_REDIRECT"))
      ) {
        return; // Let the redirect happen
      }
      console.error("Error initiating checkout:", error);
      alert("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative rounded-lg border border-purple-500/50 bg-gradient-to-br from-purple-800/30 to-purple-900/30 p-6 transition-colors hover:border-purple-400">
      <div className="absolute -top-2 -right-2 rounded-full bg-purple-600 px-2 py-1 text-xs text-white">
        Popular
      </div>
      <div className="mt-2 text-center">
        <div className="mb-4 flex justify-center gap-4">
          <Coins className="h-8 w-8 rounded-full text-purple-400" />
          <Coins className="h-8 w-8 rounded-full text-purple-400" />
          <Coins className="h-8 w-8 rounded-full text-purple-400" />
        </div>
        <h3 className="mt-2 mb-2 text-2xl font-bold text-white">
          Pro Plan (Monthly)
        </h3>
        <div className="mb-2 rounded-full px-3 py-1 text-4xl font-bold text-purple-400">
          $19<span className="text-lg text-zinc-400">/month</span>
        </div>

        <div className="font-xl mb-6 rounded-full px-3 py-1 font-bold text-zinc-400">
          2,500 Tokens/month
        </div>

        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-white">2,500 Tokens/month</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-white">$0.0076 per Token</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-white">Priority support, token rollover</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-white">
              Best For: Active users with steady usage
            </span>
          </div>
          <div className="mt-4 text-center text-sm text-zinc-400"></div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="mt-6 w-full cursor-pointer rounded-lg bg-purple-600 px-4 py-3 font-bold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            "Subscribe"
          )}
        </button>
      </div>
    </div>
  );
};
