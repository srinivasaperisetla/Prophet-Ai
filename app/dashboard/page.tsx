import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, getUserApiKeys } from "@/lib/actions";
import { ApiKeyDisplay } from "@/components/ApiKeyDisplay";
import { ApiKeyDisplayData } from "@/lib/types";

const Dashboard = async () => {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="text-red-400">Please sign in to view your dashboard.</div>
    );
  }

  const user = await getUserByClerkId(userId);
  const apiKey = await getUserApiKeys(user.id);

  return (
    <div className="w-full">
      <ApiKeyDisplay apiKey={apiKey} userId={user.id} />
    </div>
  );
};

export default Dashboard;
