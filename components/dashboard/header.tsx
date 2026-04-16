'use client'

import { useEffect, useState } from 'react'
import { Bell, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardHeader() {
  const [time, setTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)
    
    return () => {
      clearInterval(timer)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="text-xs font-mono text-muted-foreground">
          <span className="text-primary">root@cyber-academy</span>
          <span className="text-muted-foreground">:</span>
          <span className="text-accent">~</span>
          <span className="text-muted-foreground">$</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-primary">CONNECTED</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-destructive" />
              <span className="text-destructive">OFFLINE</span>
            </>
          )}
        </div>
        
        {/* Divider */}
        <div className="h-4 w-px bg-border" />
        
        {/* Time display */}
        <div className="text-xs font-mono text-muted-foreground">
          {time.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
          <span className="text-primary ml-2">UTC</span>
        </div>
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>
      </div>
    </header>
  )
}
