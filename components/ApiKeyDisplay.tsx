"use client";
import React, { useState } from "react";
import { Copy, RefreshCw, Key, Check } from "lucide-react";
import { regenerateApiKey as regenerateApiKeyAction } from "@/lib/user-actions";
import { ApiKeyDisplayData, ApiKeyDisplayProps } from "@/lib/types";

export const ApiKeyDisplay: React.FC<ApiKeyDisplayProps> = ({ apiKey }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<ApiKeyDisplayData | null>(
    apiKey,
  );

  const copyToClipboard = async () => {
    if (currentApiKey?.rawKey) {
      try {
        await navigator.clipboard.writeText(currentApiKey.rawKey);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 5000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  const regenerateApiKey = async () => {
    try {
      setRegenerating(true);

      // Call the server action
      const result = await regenerateApiKeyAction();

      if (result.success && result.apiKey) {
        setCurrentApiKey(result.apiKey);
      } else {
        console.error("Failed to regenerate API key:", result.error);
      }
    } catch (error) {
      console.error("Error regenerating API key:", error);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg bg-zinc-800/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Key className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-white">Your API Key</h2>
      </div>

      {currentApiKey && currentApiKey.rawKey ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-zinc-900 p-3">
            <code className="font-mono text-sm break-all text-purple-400">
              {currentApiKey.rawKey}
            </code>
            <button
              onClick={copyToClipboard}
              className="cursor-pointer rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              title="Copy API key"
            >
              {copySuccess ? (
                <Check className="h-4 w-4 text-zinc-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              Created: {new Date(currentApiKey.created_at).toLocaleDateString()}
            </span>
            <button
              onClick={regenerateApiKey}
              disabled={regenerating}
              className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 font-bold text-zinc-300/70 transition-all duration-300 hover:bg-white/10 hover:text-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`}
              />
              {regenerating ? "Regenerating..." : "Regenerate Key"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-zinc-900 p-3 text-zinc-400">
          No API key found. Please contact support.
        </div>
      )}
    </div>
  );
};
