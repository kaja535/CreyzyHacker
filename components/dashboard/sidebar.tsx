'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Terminal,
  Shield,
  Target,
  Trophy,
  User,
  Radio,
  LogOut,
  Home,
} from 'lucide-react'

interface SidebarProps {
  user: {
    email: string
    username: string
    rank: string
    points: number
    avatar_url?: string | null
  }
}

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Command Center' },
  { href: '/dashboard/challenges', icon: Target, label: 'Challenges' },
  { href: '/dashboard/terminal', icon: Terminal, label: 'Terminal' },
  { href: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/dashboard/bunker', icon: Radio, label: 'Bunker Status' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
]

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold font-mono text-foreground text-lg">
              CYBER
            </h1>
            <p className="text-xs text-muted-foreground font-mono -mt-1">
              ACADEMY
            </p>
          </div>
        </Link>
      </div>

      {/* User profile section */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary/30">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-mono">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono text-foreground truncate">
              {user.username}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary font-mono">
                {user.rank}
              </span>
              <span className="text-xs text-muted-foreground">
                {user.points} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 font-mono text-sm",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/30" 
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 font-mono text-sm text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
        
        <div className="mt-4 text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            System Online
          </div>
          <p className="mt-1 opacity-50">v2.0.1</p>
        </div>
      </div>
    </aside>
  )
}
