import { Terminal } from '@/components/terminal/terminal'

export default function TerminalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">
          {">"} TERMINAL
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Your hacking workspace. Connect to targets and execute commands.
        </p>
      </div>
      
      <Terminal className="h-[calc(100vh-200px)]" />
    </div>
  )
}
