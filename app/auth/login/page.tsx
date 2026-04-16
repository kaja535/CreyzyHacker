'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Terminal, Shield, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,128,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Floating terminal windows in background */}
      <div className="absolute top-20 left-10 w-64 h-32 bg-card/30 border border-border/30 rounded-lg opacity-20 blur-sm" />
      <div className="absolute bottom-32 right-20 w-48 h-24 bg-card/30 border border-border/30 rounded-lg opacity-20 blur-sm" />
      <div className="absolute top-1/3 right-1/4 w-56 h-28 bg-card/30 border border-border/30 rounded-lg opacity-15 blur-sm" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <Terminal className="h-8 w-8 text-primary" />
            </div>
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
              <Shield className="h-8 w-8 text-accent" />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-mono text-foreground text-glow-sm">
            CYBER_ACADEMY
          </h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm">
            {">"} Initializing secure connection...
          </p>
        </div>

        {/* Login form */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-terminal-warning" />
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="ml-2 text-xs text-muted-foreground font-mono">
              auth@cyber-academy:~$ login
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-mono text-muted-foreground">
                {">"} EMAIL_ADDRESS
              </label>
              <Input
                type="email"
                placeholder="hacker@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-mono bg-input border-border focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-mono text-muted-foreground">
                {">"} PASSWORD
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-mono bg-input border-border focus:border-primary focus:ring-primary"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="font-mono">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-mono bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                'ACCESS_SYSTEM'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground font-mono">
              {">"} New recruit?{' '}
              <Link href="/auth/sign-up" className="text-primary hover:underline">
                CREATE_ACCOUNT
              </Link>
            </p>
          </div>
        </div>

        {/* Status line */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            <span className="text-primary">●</span> Secure connection established
          </p>
        </div>
      </div>
    </div>
  )
}
