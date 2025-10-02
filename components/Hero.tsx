import React from 'react'
import Link from 'next/link'
import { ArrowRight, BarChart3, TrendingUp, Zap } from 'lucide-react'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 " />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-24 lg:py-24">
        <div className="text-center">
          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6">
            Smarter AI Sports Betting
            <span className="block text-purple-400">
              Predictions API
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-md sm:text-lg lg:text-xl text-zinc-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            Access our proven sports betting models through simple APIs. 
            Make data-driven predictions and enhance your betting analysis with our machine learning algorithms.
          </p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-12 px-4">
            <div className="flex items-center gap-2 text-zinc-400 text-sm sm:text-base">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span>Advanced Analytics</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span>Proven Models</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm sm:text-base">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span>Real-time Data</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <SignedOut>
              <SignUpButton>
                <button className="cursor-pointer group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg transform hover:scale-105 text-sm sm:text-base">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </SignUpButton>
            </SignedOut>
            
            <SignedIn>
              <Link href="/dashboard">
                <button className="cursor-pointer group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg transform hover:scale-105 text-sm sm:text-base">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </Link>
            </SignedIn>
            
            <Link href="/docs">
              <button className="cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 border border-purple-600 text-purple-400 font-bold rounded-lg hover:bg-purple-600 hover:text-white transition-all duration-300 text-sm sm:text-base">
                View API Docs
              </button>
            </Link>
          </div>
          
          {/* Social proof / stats */}
          <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 px-4">
            <p className="text-zinc-500 mb-4 sm:mb-6 text-sm sm:text-base">Trusted by developers and analysts</p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">99.9%</div>
                <div className="text-xs sm:text-sm text-zinc-400">Uptime</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">50ms</div>
                <div className="text-xs sm:text-sm text-zinc-400">Avg Response</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">10+</div>
                <div className="text-xs sm:text-sm text-zinc-400">Sports Covered</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero