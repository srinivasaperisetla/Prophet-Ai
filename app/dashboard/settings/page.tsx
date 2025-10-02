import React from "react";
import { Settings, Trash2, Crown, Coins, AlertTriangle } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getUserWithTokenLedger } from "@/lib/actions";
import { SettingsClient } from "@/components/SettingsClient";
import { UserData } from "@/lib/types";

const SettingsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    return <div className="text-red-400">Please sign in to view settings.</div>;
  }

  let userData: UserData | null = null;
  try {
    const user = await getUserWithTokenLedger(userId);
    if (user) {
      userData = {
        id: user.id,
        email: user.email,
        billing_model: user.billing_model,
        created_at: user.created_at,
      };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  return <SettingsClient userData={userData} />;
};

export default SettingsPage;
