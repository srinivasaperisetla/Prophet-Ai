"use client";

import React from "react";
import { Coins, Check } from "lucide-react";

export const EnterprisePlanCard = () => {
  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-800/50 p-6 transition-colors hover:border-purple-500/50">
      <div className="mt-2 text-center">
        <div className="mb-4 flex justify-center gap-4">
          <Coins className="h-8 w-8 rounded-full text-purple-400" />
          <Coins className="h-8 w-8 rounded-full text-purple-400" />
          <Coins className="h-8 w-8 rounded-full text-purple-400" />
          <Coins className="h-8 w-8 rounded-full text-purple-400" />
        </div>
        <h3 className="mt-2 mb-2 text-2xl font-bold text-white">
          Enterprise (Custom)
        </h3>
        <div className="mb-2 rounded-full px-3 py-1 text-4xl font-bold text-purple-400">
          Custom pricing
          <span className="text-lg text-zinc-400"> (starting ~$250)</span>
        </div>

        <div className="font-xl mb-6 rounded-full px-3 py-1 font-bold text-zinc-400">
          50,000+ Tokens
        </div>

        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-white">50,000+ Tokens</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-white">
              ~$0.0050 per Token (volume discount)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-white">
              SLA, dedicated support, custom features
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-white">
              Best For: Large-scale operations & partners
            </span>
          </div>
          <div className="mt-4 text-center text-sm text-zinc-400"></div>
        </div>

        <button className="mt-6 w-full cursor-pointer rounded-lg bg-zinc-700 px-4 py-3 font-bold text-white transition-colors hover:bg-zinc-600">
          Contact Sales
        </button>
      </div>
    </div>
  );
};
