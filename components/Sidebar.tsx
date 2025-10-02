"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { 
  Clock, 
  Settings, 
  FileText, 
  CreditCard, 
  BookOpen, 
  HelpCircle,
  Edit3
} from 'lucide-react'

const Sidebar = () => {
  const pathname = usePathname()
  const { user } = useUser()

  const navigationItems = [
    { name: 'Overview', href: '/dashboard', icon: Clock },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Billing & Invoices', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Docs', href: '/docs', icon: BookOpen },
    { name: 'Support', href: '/support', icon: HelpCircle },
  ]

  return (
    <div className="w-64 h-screen flex flex-col mr-16">
      {/* User Section */}
      <div className="">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-white font-semibold">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-zinc-400 text-sm mt-1 mb-1">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            const isExternalLink = item.href === '/docs' || item.href === '/support'
            
            return (
              <Link
                key={item.name}
                href={item.href}
                target={isExternalLink ? "_blank" : undefined}
                rel={isExternalLink ? "noopener noreferrer" : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default Sidebar 