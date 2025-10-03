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
    <div className="mb-6 rounded-lg bg-zinc-800/50 p-6">
      <div className="mb-4 flex items-center gap-3">
        <Key className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-white">Your API Key</h2>
      </div>

      {currentApiKey && currentApiKey.rawKey ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-zinc-900 p-2 px-4">
            <div className="flex items-center justify-between">
              <code className="font-mono text-sm break-all text-purple-400">
                {currentApiKey.rawKey}
              </code>
              <button
                onClick={copyToClipboard}
                className="ml-4 cursor-pointer rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                title="Copy API key"
              >
                {copySuccess ? (
                  <Check className="h-4 w-4 text-zinc-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-white">
            <span className="text-sm">
              Created: {new Date(currentApiKey.created_at).toLocaleDateString()}
            </span>
            <button
              onClick={regenerateApiKey}
              disabled={regenerating}
              className="text-md flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 font-bold text-zinc-300/70 transition-all duration-300 hover:bg-white/10 hover:text-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`}
              />
              {regenerating ? "Regenerating..." : "Regenerate Key"}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-zinc-400">
          No API key found. Please contact support.
        </div>
      )}
    </div>
  );
};
