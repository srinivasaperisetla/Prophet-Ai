import React from "react";
import { getUser } from "@/lib/user-actions";
import { SettingsClient } from "@/components/SettingsClient";
import { UserData } from "@/lib/types";

const SettingsPage = async () => {
  try {
    const user = await getUser();

    if (!user) {
      return (
        <div className="text-red-400">Please sign in to view settings.</div>
      );
    }

    const userData: UserData = {
      id: user.id,
      email: user.email,
      billing_model: user.billing_model,
      created_at: user.created_at,
    };

    return <SettingsClient userData={userData} />;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return <div className="text-red-400">Failed to load settings.</div>;
  }
};

export default SettingsPage;
