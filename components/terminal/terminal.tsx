'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TerminalState {
  currentPath: string[]
  connectedMachine: string | null
  challengeId: string | null
}

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'system'
  content: string
  timestamp: Date
}

interface TerminalProps {
  challengeId?: string
  machineName?: string
  machineIp?: string
  onFlagFound?: (flag: string) => void
  className?: string
}

export function Terminal({ 
  challengeId, 
  machineName = 'cyber-academy',
  machineIp,
  onFlagFound,
  className 
}: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { 
      type: 'system', 
      content: `CYBER_ACADEMY Terminal v2.0.1
Type 'help' for available commands.
${machineIp ? `Target: ${machineIp}` : ''}
`, 
      timestamp: new Date() 
    }
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [state, setState] = useState<TerminalState>({
    currentPath: [],
    connectedMachine: null,
    challengeId: challengeId || null,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  // Focus input on click
  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  // Get prompt string
  const getPrompt = () => {
    if (state.connectedMachine) {
      const path = state.currentPath.length > 0 
        ? '/' + state.currentPath.join('/') 
        : '~'
      return `user@${machineName.toLowerCase().replace(/\s+/g, '-')}:${path}$`
    }
    return 'hacker@cyber-academy:~$'
  }

  // Process command
  const executeCommand = async (command: string) => {
    if (!command.trim()) return

    // Add input line
    setLines(prev => [...prev, {
      type: 'input',
      content: `${getPrompt()} ${command}`,
      timestamp: new Date()
    }])

    // Add to history
    setCommandHistory(prev => [...prev, command])
    setHistoryIndex(-1)
    setCurrentInput('')
    setIsProcessing(true)

    try {
      const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          state,
          challengeId: state.challengeId || challengeId,
        }),
      })

      const result = await response.json()

      if (result.error) {
        setLines(prev => [...prev, {
          type: 'error',
          content: result.error,
          timestamp: new Date()
        }])
      } else {
        // Handle clear command
        if (result.output === '__CLEAR__') {
          setLines([{
            type: 'system',
            content: 'Terminal cleared.',
            timestamp: new Date()
          }])
        } else if (result.output) {
          // Parse ANSI colors (simplified)
          const outputType = result.output.includes('[SUCCESS]') ? 'success' 
            : result.output.includes('[FAILED]') ? 'error' 
            : 'output'
          
          setLines(prev => [...prev, {
            type: outputType,
            content: result.output.replace(/\x1b\[[0-9;]*m/g, ''), // Strip ANSI codes for display
            timestamp: new Date()
          }])
        }

        // Update state
        if (result.newState) {
          setState(result.newState)
        }

        // Handle flag found
        if (result.flagFound && onFlagFound) {
          onFlagFound(result.flagFound)
        }
      }
    } catch {
      setLines(prev => [...prev, {
        type: 'error',
        content: 'Error: Failed to execute command. Check your connection.',
        timestamp: new Date()
      }])
    }

    setIsProcessing(false)
  }

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      executeCommand(currentInput)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 
          ? historyIndex + 1 
          : historyIndex
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '')
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentInput('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Simple tab completion for common commands
      const commands = ['help', 'clear', 'nmap', 'ssh', 'nc', 'curl', 'ls', 'cd', 'cat', 'pwd', 'whoami', 'exit', 'submit']
      const match = commands.find(cmd => cmd.startsWith(currentInput.toLowerCase()))
      if (match) {
        setCurrentInput(match)
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      setCurrentInput('')
      setLines(prev => [...prev, {
        type: 'system',
        content: '^C',
        timestamp: new Date()
      }])
    }
  }

  return (
    <div 
      className={cn(
        "flex flex-col bg-terminal-bg rounded-lg border border-border overflow-hidden",
        className
      )}
      onClick={focusInput}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-card border-b border-border">
        <div className="w-3 h-3 rounded-full bg-destructive" />
        <div className="w-3 h-3 rounded-full bg-terminal-warning" />
        <div className="w-3 h-3 rounded-full bg-primary" />
        <span className="ml-2 text-xs text-muted-foreground font-mono">
          {state.connectedMachine 
            ? `ssh - ${machineName} [${state.connectedMachine}]`
            : 'terminal - cyber-academy'
          }
        </span>
      </div>

      {/* Terminal content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-sm min-h-[300px] max-h-[600px]"
      >
        {lines.map((line, index) => (
          <div 
            key={index} 
            className={cn(
              "whitespace-pre-wrap break-all mb-1",
              line.type === 'input' && "text-terminal-prompt",
              line.type === 'output' && "text-terminal-text",
              line.type === 'error' && "text-terminal-error",
              line.type === 'success' && "text-terminal-success",
              line.type === 'system' && "text-muted-foreground italic"
            )}
          >
            {line.content}
          </div>
        ))}

        {/* Current input line */}
        <div className="flex items-center text-terminal-prompt">
          <span className="mr-2">{getPrompt()}</span>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              className="w-full bg-transparent outline-none text-terminal-text font-mono"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
            />
            {/* Cursor */}
            <span 
              className={cn(
                "absolute top-0 w-2 h-5 bg-terminal-prompt",
                isProcessing ? "opacity-50" : "animate-blink"
              )}
              style={{ left: `${currentInput.length * 0.6}em` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
