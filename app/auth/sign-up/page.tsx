'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Terminal, Shield, AlertCircle, Loader2, CheckCircle } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
          `${window.location.origin}/auth/callback`,
        data: {
          username: username || `hacker_${Math.random().toString(36).substring(2, 10)}`,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,128,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg shadow-primary/5 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/30">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold font-mono text-foreground mb-4">
              REGISTRATION_COMPLETE
            </h2>
            <p className="text-muted-foreground font-mono text-sm mb-6">
              {">"} Check your email to confirm your account and activate your hacker profile.
            </p>
            <Link href="/auth/login">
              <Button className="w-full font-mono bg-primary hover:bg-primary/90 text-primary-foreground">
                RETURN_TO_LOGIN
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,128,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Floating terminal windows in background */}
      <div className="absolute top-20 left-10 w-64 h-32 bg-card/30 border border-border/30 rounded-lg opacity-20 blur-sm" />
      <div className="absolute bottom-32 right-20 w-48 h-24 bg-card/30 border border-border/30 rounded-lg opacity-20 blur-sm" />

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
            {">"} Creating new operative profile...
          </p>
        </div>

        {/* Sign up form */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-terminal-warning" />
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="ml-2 text-xs text-muted-foreground font-mono">
              auth@cyber-academy:~$ register
            </span>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-mono text-muted-foreground">
                {">"} CODENAME <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <Input
                type="text"
                placeholder="shadow_hacker"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="font-mono bg-input border-border focus:border-primary focus:ring-primary"
              />
            </div>

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
                minLength={6}
                className="font-mono bg-input border-border focus:border-primary focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground font-mono">
                Min. 6 characters required
              </p>
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
                  CREATING_PROFILE...
                </>
              ) : (
                'INITIALIZE_ACCOUNT'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground font-mono">
              {">"} Already a member?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                ACCESS_SYSTEM
              </Link>
            </p>
          </div>
        </div>

        {/* Status line */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            <span className="text-primary">●</span> Encrypted registration channel
          </p>
        </div>
      </div>
    </div>
  )
}
