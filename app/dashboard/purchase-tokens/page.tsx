"use client";

import React, { useState } from "react";
import { StarterBundleCard } from "@/components/pricingCards/StarterBundleCard";
import { BaseTokenPackCard } from "@/components/pricingCards/BaseTokenPackCard";
import { ValueBundleCard } from "@/components/pricingCards/ValueBundleCard";
import { ProMonthlyPlanCard } from "@/components/pricingCards/ProMonthlyPlanCard";
import { HighRollerBundleCard } from "@/components/pricingCards/HighRollerBundleCard";
import { EnterprisePlanCard } from "@/components/pricingCards/EnterprisePlanCard";

const PurchaseTokensPage = () => {
  const [activeTab, setActiveTab] = useState<"on-demand" | "monthly">(
    "on-demand",
  );

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2 px-2">
        <h1 className="text-2xl font-bold text-white">Purchase Tokens</h1>
      </div>

      {/* Tabs */}
      <div className="text-md flex justify-center space-x-2 font-bold text-zinc-300/70">
        <button
          onClick={() => setActiveTab("on-demand")}
          className={`cursor-pointer rounded-full px-3 py-1 transition-all hover:bg-white/10 hover:text-purple-400 ${
            activeTab === "on-demand" ? "text-white" : ""
          }`}
        >
          On-Demand Tokens
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`cursor-pointer rounded-full px-3 py-1 transition-all hover:bg-white/10 hover:text-purple-400 ${
            activeTab === "monthly" ? "text-white" : ""
          }`}
        >
          Monthly Subscriptions
        </button>
      </div>

      {/* On-Demand Token Packs */}
      {activeTab === "on-demand" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="w-80">
              <StarterBundleCard />
            </div>
            <div className="w-80">
              <BaseTokenPackCard />
            </div>
            <div className="w-80">
              <ValueBundleCard />
            </div>
            <div className="w-80">
              <HighRollerBundleCard />
            </div>
          </div>
        </div>
      )}

      {/* Monthly Subscriptions */}
      {activeTab === "monthly" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="w-95">
              <ProMonthlyPlanCard />
            </div>
            <div className="w-95">
              <EnterprisePlanCard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseTokensPage;
