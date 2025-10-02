"use client";
import React, { useState } from "react";
import { Settings, Trash2, Crown, Coins, AlertTriangle } from "lucide-react";
import { deleteUserAccount } from "@/lib/server-actions";
import { UserData, SettingsClientProps } from "@/lib/types";

export const SettingsClient = ({ userData }: SettingsClientProps) => {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteUser = async () => {
    try {
      setDeleting(true);
      const result = await deleteUserAccount();

      if (result.success) {
        // Redirect to home page after successful deletion
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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
                    <button className="cursor-pointer rounded-lg border border-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700">
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

          {/* Danger Zone */}
          <div className="rounded-lg border border-red-700/50 bg-red-900/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h2 className="text-lg font-semibold text-red-400">
                Danger Zone
              </h2>
            </div>
            <p className="mb-3 text-sm text-red-300">
              Once you delete your account, there is no going back. This action
              will permanently remove:
            </p>
            <ul className="mb-4 space-y-0.5 text-xs text-red-300">
              <li>• All your API keys and usage data</li>
              <li>• Your billing information and subscription</li>
              <li>• All associated tokens and credits</li>
              <li>• Your account and personal data</li>
            </ul>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>
      ) : (
        <div className="text-zinc-400">
          Failed to load user data. Please try again.
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-lg border border-zinc-700 bg-zinc-800 p-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h3 className="text-base font-semibold text-white">
                Delete Account
              </h3>
            </div>
            <p className="mb-4 text-sm text-zinc-400">
              Are you absolutely sure you want to delete your account? This
              action cannot be undone and will permanently remove all your data,
              API keys, and billing information.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 cursor-pointer rounded-lg bg-zinc-600 px-3 py-2 text-sm text-white transition-colors hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
