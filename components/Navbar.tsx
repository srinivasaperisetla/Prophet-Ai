import React from "react";
import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const Navbar = () => {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-b from-black/50 via-black/20 to-transparent p-4">
      <div className="rounded-lg p-4">
        {/* Desktop Layout */}
        <div className="hidden items-center md:flex">
          <div className="flex-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <Trophy className="transition-color h-7 w-7 duration-300" />
              <span className="text-2xl font-bold text-white">Prophet AI</span>
            </Link>
          </div>

          <nav className="text-md flex flex-1 justify-center space-x-2 font-bold text-zinc-300/70">
            <Link
              href="#features"
              className="rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/10 hover:text-purple-400"
            >
              Features
            </Link>
            <Link
              href="#reviews"
              className="rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/10 hover:text-purple-400"
            >
              Reviews
            </Link>
            <Link
              href="#pricing"
              className="rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/10 hover:text-purple-400"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/10 hover:text-purple-400"
            >
              Docs
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <SignedOut>
              <SignInButton>
                <button className="cursor-pointer rounded-lg px-5 py-2 font-bold text-zinc-300 transition-colors duration-300 hover:bg-white/10 hover:text-white">
                  Login
                </button>
              </SignInButton>

              <SignUpButton>
                <button className="cursor-pointer rounded-lg border border-purple-600 px-5 py-2 font-bold text-zinc-300 transition-all duration-300 hover:bg-purple-700 hover:text-white">
                  Start betting
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-4">
                <UserButton />
                <Link href="/dashboard">
                  <button className="flex cursor-pointer items-center gap-2 rounded-lg border border-purple-600 px-4 py-2 font-bold text-zinc-300 transition-all duration-200 hover:bg-purple-700 hover:text-white">
                    Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </SignedIn>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Row: Logo and Buttons */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <Trophy className="transition-color h-6 w-6 duration-300" />
              <span className="text-xl font-bold text-white">Prophet AI</span>
            </Link>

            <div className="flex items-center space-x-3">
              <SignedOut>
                <SignInButton>
                  <button className="cursor-pointer rounded-lg px-3 py-2 text-sm font-bold text-zinc-300 transition-colors duration-300 hover:bg-white/10 hover:text-white">
                    Login
                  </button>
                </SignInButton>

                <SignUpButton>
                  <button className="cursor-pointer rounded-lg border border-purple-600 px-3 py-2 text-sm font-bold text-zinc-300 transition-all duration-300 hover:bg-purple-700 hover:text-white">
                    Start betting
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <div className="flex items-center gap-3">
                  <UserButton />
                  <Link href="/dashboard">
                    <button className="flex cursor-pointer items-center gap-1 rounded-lg border border-purple-600 px-3 py-2 text-sm font-bold text-zinc-300 transition-all duration-200 hover:bg-purple-700 hover:text-white">
                      Dashboard
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </Link>
                </div>
              </SignedIn>
            </div>
          </div>

          {/* Bottom Row: Navigation */}
          <nav className="flex flex-wrap justify-center gap-1 text-sm font-bold text-zinc-300/70">
            <Link
              href="#features"
              className="rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/10 hover:text-purple-400"
            >
              Features
            </Link>
            <Link
              href="#reviews"
              className="rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/10 hover:text-purple-400"
            >
              Reviews
            </Link>
            <Link
              href="#pricing"
              className="rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/10 hover:text-purple-400"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/10 hover:text-purple-400"
            >
              Docs
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};
export default Navbar;
