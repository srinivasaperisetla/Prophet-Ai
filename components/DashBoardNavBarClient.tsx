"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Coins } from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { TokenDisplayData, DashBoardNavBarClientProps } from "@/lib/types";

const DashBoardNavBarClient = ({ tokenData }: DashBoardNavBarClientProps) => {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  const renderTokenDisplay = () => {
    if (!isLoaded || !isSignedIn) {
      return (
        <div className="flex items-center gap-2 px-3 py-2">
          <Coins className="h-4 w-4 text-zinc-400" />
          <span className="text-zinc-400">Loading...</span>
        </div>
      );
    }

    if (!tokenData) {
      return null;
    }

    const isPro = tokenData.billing_model === "pro";
    const displayText = isPro ? "" : `${tokenData.available}`;
    const IconComponent = Coins;

    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <IconComponent className="h-5 w-5 text-purple-400" />
        <span className="font-bold text-white">{displayText}</span>
        {isPro && <span className="font-bold text-purple-400">Unlimited</span>}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-black/50 via-black/20 to-transparent p-8">
      <div className="rounded-lg p-4">
        {/* Desktop Layout */}
        <div className="hidden items-center justify-between md:flex">
          {/* Left: Logo */}
          <div className="flex flex-1 justify-start">
            <Link
              href="/"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <Trophy className="transition-color h-7 w-7 duration-300" />
              <span className="text-2xl font-bold text-white">Prophet AI</span>
            </Link>
          </div>

          {/* Middle: Navigation Links */}
          <div className="text-md flex flex-1 justify-center space-x-4 font-bold text-zinc-300/70">
            <Link
              href="/api-console"
              className={`rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/10 hover:text-purple-400 ${
                pathname === "/api-console" ? "text-white" : "text-zinc-300/70"
              }`}
            >
              API Console
            </Link>
            <Link
              href="/dashboard"
              className={`rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/10 hover:text-purple-400 ${
                pathname.startsWith("/dashboard")
                  ? "text-white"
                  : "text-zinc-300/70"
              }`}
            >
              Dashboard
            </Link>
          </div>

          {/* Right: Token Display and User Component */}
          <div className="flex flex-1 items-center justify-end gap-3">
            {renderTokenDisplay()}
            <UserButton />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Row: Logo and User */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <Trophy className="transition-color h-6 w-6 duration-300" />
              <span className="text-xl font-bold text-white">Prophet AI</span>
            </Link>

            <div className="flex items-center gap-3">
              {renderTokenDisplay()}
              <UserButton />
            </div>
          </div>

          {/* Bottom Row: Navigation */}
          <nav className="flex justify-center space-x-6 text-sm font-bold text-zinc-300/70">
            <Link
              href="/api-console"
              className={`rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/10 hover:text-purple-400 ${
                pathname === "/api-console" ? "text-white" : "text-zinc-300/70"
              }`}
            >
              API Console
            </Link>
            <Link
              href="/dashboard"
              className={`rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/10 hover:text-purple-400 ${
                pathname.startsWith("/dashboard")
                  ? "text-white"
                  : "text-zinc-300/70"
              }`}
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export { DashBoardNavBarClient };
