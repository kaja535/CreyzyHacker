import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Terminal, 
  Shield, 
  Target, 
  Trophy,
  ChevronRight,
  Zap,
  Users,
  Code
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,128,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold font-mono text-xl text-foreground">
              CYBER_ACADEMY
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-mono">
                Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="font-mono bg-primary text-primary-foreground">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono text-primary">Terminal-First Learning</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-mono text-foreground mb-6 leading-tight">
            Learn to <span className="text-primary text-glow">Hack</span>
            <br />
            The Right Way
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Master cybersecurity through hands-on CTF challenges. 
            Real terminal, real commands, real skills.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="font-mono text-lg bg-primary text-primary-foreground">
                Start Hacking
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="font-mono text-lg">
                Access Terminal
              </Button>
            </Link>
          </div>
        </div>

        {/* Terminal preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="bg-terminal-bg border border-border rounded-lg overflow-hidden shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-2 px-4 py-3 bg-card border-b border-border">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <div className="w-3 h-3 rounded-full bg-terminal-warning" />
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">
                terminal - cyber-academy
              </span>
            </div>
            <div className="p-6 font-mono text-sm space-y-2">
              <p className="text-muted-foreground">{">"} Welcome to Cyber Academy Terminal</p>
              <p><span className="text-terminal-prompt">hacker@cyber-academy:~$</span> <span className="text-terminal-text">nmap 192.168.1.10</span></p>
              <p className="text-terminal-text">Starting Nmap scan...</p>
              <p className="text-terminal-text">PORT     STATE SERVICE</p>
              <p className="text-terminal-text">22/tcp   open  ssh</p>
              <p className="text-terminal-text">80/tcp   open  http</p>
              <p className="text-terminal-text">8080/tcp open  http-proxy</p>
              <p><span className="text-terminal-prompt">hacker@cyber-academy:~$</span> <span className="text-terminal-text">ssh 192.168.1.10</span></p>
              <p className="text-terminal-success">Connected to Shadow Server...</p>
              <p><span className="text-terminal-prompt">user@shadow-server:~$</span> <span className="animate-blink">_</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="relative z-10 border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-24">
          <h2 className="text-3xl font-bold font-mono text-center text-foreground mb-16">
            {">"} Why Cyber Academy?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 w-fit mb-4">
                <Terminal className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-mono text-foreground mb-2">
                Real Terminal
              </h3>
              <p className="text-muted-foreground">
                Practice with a real command-line interface. Run nmap, ssh, and more 
                directly in your browser.
              </p>
            </div>
            
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 w-fit mb-4">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold font-mono text-foreground mb-2">
                CTF Challenges
              </h3>
              <p className="text-muted-foreground">
                Hack simulated machines across categories: Web, Network, Crypto, 
                Forensics, and more.
              </p>
            </div>
            
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="p-3 rounded-lg bg-terminal-warning/10 border border-terminal-warning/30 w-fit mb-4">
                <Trophy className="h-6 w-6 text-terminal-warning" />
              </div>
              <h3 className="text-xl font-bold font-mono text-foreground mb-2">
                Track Progress
              </h3>
              <p className="text-muted-foreground">
                Earn points, climb the leaderboard, and unlock new ranks as you 
                master each skill.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="relative z-10 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold font-mono text-primary">10+</p>
              <p className="text-muted-foreground mt-2">Challenges</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-mono text-accent">5</p>
              <p className="text-muted-foreground mt-2">Categories</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-mono text-terminal-warning">2500+</p>
              <p className="text-muted-foreground mt-2">Total Points</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-mono text-foreground">Free</p>
              <p className="text-muted-foreground mt-2">Forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="relative z-10 border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl font-bold font-mono text-foreground mb-6">
            Ready to become a hacker?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Join the academy and start your cybersecurity journey today. 
            No experience required.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="font-mono text-lg bg-primary text-primary-foreground">
              Create Free Account
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-mono text-sm text-muted-foreground">
                Cyber Academy v2.0.1
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for hackers, by hackers
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
