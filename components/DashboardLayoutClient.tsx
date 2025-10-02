"use client";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { DashboardLayoutClientProps } from "@/lib/types";

export const DashboardLayoutClient = ({
  children,
}: DashboardLayoutClientProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <div className="fixed top-20 left-4 z-50 lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg bg-zinc-800 p-2 text-white transition-colors hover:bg-zinc-700"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="container mx-auto flex px-2 py-8">
        {/* Sidebar */}
        <div
          className={`fixed z-50 transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:block lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="w-full flex-1">{children}</main>
      </div>
    </>
  );
};
