"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Clock,
  Settings,
  CreditCard,
  BookOpen,
  HelpCircle,
  ShoppingCart,
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useUser();

  const navigationItems = [
    { name: "Overview", href: "/dashboard", icon: Clock },
    {
      name: "Purchase Tokens",
      href: "/dashboard/purchase-tokens",
      icon: ShoppingCart,
    },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    {
      name: "Billing & Invoices",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
    { name: "Docs", href: "/docs", icon: BookOpen },
    { name: "Support", href: "/support", icon: HelpCircle },
  ];

  return (
    <div className="mr-16 flex h-screen w-64 flex-col">
      {/* User Section */}
      <div className="">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-white">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="mt-1 mb-1 text-sm text-zinc-400">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            const isExternalLink =
              item.href === "/docs" || item.href === "/support";

            return (
              <Link
                key={item.name}
                href={item.href}
                target={isExternalLink ? "_blank" : undefined}
                rel={isExternalLink ? "noopener noreferrer" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-300/70 hover:bg-zinc-800/50 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
