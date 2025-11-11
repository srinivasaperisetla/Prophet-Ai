import React from "react";
import { getUser } from "@/lib/user-actions";
import { ApiKeyDisplay } from "@/components/ApiKeyDisplay";

const Dashboard = async () => {
  try {
    const user = await getUser();

    if (!user) {
      return (
        <div className="text-red-400">
          Please sign in to view your dashboard.
        </div>
      );
    }

    // Extract API key data for display
    const apiKeyData = user.api_keys
      ? {
          id: user.api_keys.id,
          rawKey: user.api_keys.rawKey,
          created_at: user.api_keys.created_at,
        }
      : null;

    return (
      <div className="w-full">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="px-2 text-2xl font-bold text-white">Overview</h1>
        </div>
        <ApiKeyDisplay apiKey={apiKeyData} />
      </div>
    );
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return (
      <div className="text-red-400">
        Failed to load dashboard. Please try again.
      </div>
    );
  }
};

export default Dashboard;
