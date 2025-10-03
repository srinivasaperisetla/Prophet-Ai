"use client";
import React from "react";
import { Settings, Crown, Coins } from "lucide-react";
import { SettingsClientProps } from "@/lib/types";

export const SettingsClient = ({ userData }: SettingsClientProps) => {
  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-3">
        <Settings className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
      </div>

      {userData ? (
        <div className="space-y-4">
          {/* Current Plan */}
          <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
            <h2 className="mb-3 text-lg font-semibold text-white">
              Current Plan
            </h2>
            <div className="rounded-lg bg-zinc-900 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {userData.billing_model === "pro" ? (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Coins className="h-5 w-5 text-purple-400" />
                  )}
                  <div>
                    <h3 className="text-base font-medium text-white">
                      {userData.billing_model === "pro"
                        ? "Pro Plan"
                        : "Pay-per-Token Plan"}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {userData.billing_model === "pro"
                        ? "Unlimited API calls with monthly subscription"
                        : "Pay only for the tokens you use"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {userData.billing_model === "pro" ? (
                    <>
                      <div className="text-xl font-bold text-white">
                        Unlimited
                      </div>
                      <div className="text-xs text-zinc-400">
                        Monthly billing
                      </div>
                    </>
                  ) : (
                    <button className="cursor-pointer rounded-full px-3 py-1 font-bold text-zinc-300/70 transition-all duration-300 hover:bg-white/10 hover:text-purple-400">
                      Upgrade to Pro
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
            <h2 className="mb-3 text-lg font-semibold text-white">
              Account Information
            </h2>
            <div className="space-y-2 rounded-lg bg-zinc-900 p-3">
              <div className="flex items-center justify-between border-b border-zinc-700/50 py-1">
                <span className="text-sm text-zinc-400">Email Address</span>
                <span className="text-sm font-medium text-white">
                  {userData.email}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-700/50 py-1">
                <span className="text-sm text-zinc-400">Account ID</span>
                <span className="font-mono text-xs text-white">
                  {userData.id}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">Member Since</span>
                <span className="text-sm text-white">
                  {new Date(userData.created_at || "").toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-zinc-400">
          Failed to load user data. Please try again.
        </div>
      )}
    </div>
  );
};
