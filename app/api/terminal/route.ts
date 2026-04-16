import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Challenge {
  id: string
  name: string
  machine_ip: string
  filesystem: Record<string, unknown>
  ports: Array<{ port: number; service: string; banner: string; credentials?: string }>
  flag: string
  hints: string[]
}

interface TerminalState {
  currentPath: string[]
  connectedMachine: string | null
  challengeId: string | null
}

// Parse filesystem path
function navigatePath(filesystem: Record<string, unknown>, pathParts: string[]): unknown {
  let current: unknown = filesystem
  for (const part of pathParts) {
    if (typeof current === 'object' && current !== null && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return null
    }
  }
  return current
}

// Process terminal commands
function processCommand(
  command: string,
  state: TerminalState,
  challenge: Challenge | null
): { output: string; newState: TerminalState; flagFound?: string } {
  const parts = command.trim().split(/\s+/)
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)
  
  let output = ''
  const newState = { ...state }
  let flagFound: string | undefined

  // Commands available without connection
  if (!state.connectedMachine) {
    switch (cmd) {
      case 'help':
        output = `Available commands:
  help          - Show this help message
  clear         - Clear terminal
  nmap <ip>     - Scan target for open ports
  ssh <ip>      - Connect to target via SSH
  nc <ip> <port>- Connect to specific port
  curl <url>    - Make HTTP request
  
When connected:
  ls [path]     - List directory contents
  cd <path>     - Change directory
  cat <file>    - Read file contents
  pwd           - Print working directory
  whoami        - Show current user
  id            - Show user identity
  exit          - Disconnect from machine
  submit <flag> - Submit a flag`
        break
        
      case 'nmap':
        if (!args[0]) {
          output = 'Usage: nmap <target_ip>'
        } else if (challenge && args[0] === challenge.machine_ip) {
          const ports = challenge.ports
          output = `Starting Nmap scan on ${args[0]}...
Host is up (0.0023s latency).

PORT     STATE SERVICE   VERSION
${ports.map(p => 
  `${String(p.port).padEnd(8)} open  ${p.service.padEnd(9)} ${p.banner}`
).join('\n')}

Nmap done: 1 IP address (1 host up)`
        } else {
          output = `Host ${args[0]} seems down or not responding.`
        }
        break
        
      case 'ssh':
        if (!args[0]) {
          output = 'Usage: ssh <target_ip>'
        } else if (challenge && args[0] === challenge.machine_ip) {
          newState.connectedMachine = args[0]
          newState.currentPath = ['home', 'user']
          newState.challengeId = challenge.id
          output = `Connecting to ${args[0]}...
Last login: ${new Date().toUTCString()}
Welcome to ${challenge.name}

user@${challenge.name.toLowerCase().replace(/\s+/g, '-')}:~$`
        } else {
          output = `ssh: connect to host ${args[0]}: Connection refused`
        }
        break
        
      case 'nc':
      case 'netcat':
        if (args.length < 2) {
          output = 'Usage: nc <ip> <port>'
        } else if (challenge && args[0] === challenge.machine_ip) {
          const port = parseInt(args[1])
          const portInfo = challenge.ports.find(p => p.port === port)
          if (portInfo) {
            output = `Connected to ${args[0]} port ${port}
${portInfo.banner}
Connection closed.`
          } else {
            output = `nc: connect to ${args[0]} port ${port}: Connection refused`
          }
        } else {
          output = `nc: connect to ${args[0]}: Network unreachable`
        }
        break
        
      case 'curl':
        if (!args[0]) {
          output = 'Usage: curl <url>'
        } else if (challenge) {
          const url = args[0]
          if (url.includes(challenge.machine_ip) || url.includes('localhost')) {
            // Check if there's web content in filesystem
            const webContent = navigatePath(challenge.filesystem as Record<string, unknown>, ['var', 'www', 'html'])
            if (webContent && typeof webContent === 'object') {
              const indexFile = (webContent as Record<string, string>)['index.html'] || (webContent as Record<string, string>)['index.php']
              if (indexFile) {
                output = indexFile
              } else {
                output = '<!DOCTYPE html><html><body><h1>It works!</h1></body></html>'
              }
            } else {
              output = 'curl: (7) Failed to connect: Connection refused'
            }
          } else {
            output = 'curl: (6) Could not resolve host'
          }
        } else {
          output = 'curl: (6) Could not resolve host'
        }
        break
        
      case 'clear':
        output = '__CLEAR__'
        break
        
      default:
        output = `Command not found: ${cmd}. Type 'help' for available commands.`
    }
  } else {
    // Commands when connected to a machine
    const filesystem = challenge?.filesystem as Record<string, unknown> || {}
    
    switch (cmd) {
      case 'help':
        output = `Available commands:
  ls [path]     - List directory contents
  cd <path>     - Change directory
  cat <file>    - Read file contents
  pwd           - Print working directory
  whoami        - Show current user
  id            - Show user identity
  sudo -l       - List sudo privileges
  find <path>   - Find files
  strings <file>- Show strings in file
  exit          - Disconnect from machine
  submit <flag> - Submit a flag`
        break
        
      case 'pwd':
        output = '/' + state.currentPath.join('/')
        break
        
      case 'whoami':
        output = 'user'
        break
        
      case 'id':
        output = 'uid=1000(user) gid=1000(user) groups=1000(user),27(sudo)'
        break
        
      case 'sudo':
        if (args[0] === '-l') {
          output = `User user may run the following commands:
    (ALL) NOPASSWD: /usr/bin/vim
    (ALL) NOPASSWD: /usr/bin/less`
        } else {
          output = 'sudo: command not found or not permitted'
        }
        break
        
      case 'ls':
        const lsPath = args[0] ? [...state.currentPath, ...args[0].split('/').filter(Boolean)] : state.currentPath
        const lsTarget = navigatePath(filesystem, lsPath)
        if (lsTarget && typeof lsTarget === 'object') {
          const entries = Object.keys(lsTarget as Record<string, unknown>)
          output = entries.map(e => {
            const isDir = typeof (lsTarget as Record<string, unknown>)[e] === 'object'
            return isDir ? `\x1b[34m${e}/\x1b[0m` : e
          }).join('  ') || '(empty directory)'
        } else if (lsTarget) {
          output = args[0] || '.'
        } else {
          output = `ls: cannot access '${args[0] || '.'}': No such file or directory`
        }
        break
        
      case 'cd':
        if (!args[0] || args[0] === '~') {
          newState.currentPath = ['home', 'user']
        } else if (args[0] === '..') {
          if (state.currentPath.length > 0) {
            newState.currentPath = state.currentPath.slice(0, -1)
          }
        } else if (args[0] === '/') {
          newState.currentPath = []
        } else if (args[0].startsWith('/')) {
          const newPath = args[0].split('/').filter(Boolean)
          const target = navigatePath(filesystem, newPath)
          if (target && typeof target === 'object') {
            newState.currentPath = newPath
          } else {
            output = `cd: ${args[0]}: No such directory`
          }
        } else {
          const newPath = [...state.currentPath, ...args[0].split('/').filter(Boolean)]
          const target = navigatePath(filesystem, newPath)
          if (target && typeof target === 'object') {
            newState.currentPath = newPath
          } else {
            output = `cd: ${args[0]}: No such directory`
          }
        }
        break
        
      case 'cat':
        if (!args[0]) {
          output = 'Usage: cat <filename>'
        } else {
          const filePath = args[0].startsWith('/') 
            ? args[0].split('/').filter(Boolean)
            : [...state.currentPath, args[0]]
          const fileContent = navigatePath(filesystem, filePath)
          if (fileContent && typeof fileContent === 'string') {
            output = fileContent
            // Check if flag is in the output
            const flagMatch = fileContent.match(/FLAG\{[^}]+\}/)
            if (flagMatch) {
              flagFound = flagMatch[0]
            }
          } else if (fileContent && typeof fileContent === 'object') {
            output = `cat: ${args[0]}: Is a directory`
          } else {
            output = `cat: ${args[0]}: No such file or directory`
          }
        }
        break
        
      case 'strings':
        if (!args[0]) {
          output = 'Usage: strings <filename>'
        } else {
          const filePath = args[0].startsWith('/')
            ? args[0].split('/').filter(Boolean)
            : [...state.currentPath, args[0]]
          const fileContent = navigatePath(filesystem, filePath)
          if (fileContent && typeof fileContent === 'string') {
            // Simulate strings output - show flag if present
            const flagMatch = fileContent.match(/FLAG\{[^}]+\}/)
            if (flagMatch) {
              output = `__libc_start_main\nGCC: (Ubuntu 9.3.0)\n.rodata\n${flagMatch[0]}\n.data`
              flagFound = flagMatch[0]
            } else {
              output = fileContent
            }
          } else {
            output = `strings: ${args[0]}: No such file`
          }
        }
        break
        
      case 'find':
        if (!args[0]) {
          output = 'Usage: find <path> [-name pattern]'
        } else {
          // Simplified find - just list some paths
          output = `.
./user
./user/notes.txt
./user/.secret`
        }
        break
        
      case 'exit':
        newState.connectedMachine = null
        newState.currentPath = []
        newState.challengeId = null
        output = 'Connection closed.'
        break
        
      case 'submit':
        if (!args[0]) {
          output = 'Usage: submit <flag>'
        } else {
          const submittedFlag = args.join(' ')
          if (challenge && submittedFlag === challenge.flag) {
            flagFound = submittedFlag
            output = `\x1b[32m[SUCCESS]\x1b[0m Flag accepted! +${challenge.name} completed!`
          } else {
            output = '\x1b[31m[FAILED]\x1b[0m Incorrect flag. Keep trying!'
          }
        }
        break
        
      case 'clear':
        output = '__CLEAR__'
        break
        
      default:
        output = `${cmd}: command not found`
    }
  }
  
  return { output, newState, flagFound }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { command, state, challengeId } = await request.json()
    
    // Get challenge data if we have a challengeId
    let challenge: Challenge | null = null
    if (challengeId) {
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single()
      challenge = data
    }
    
    // Process the command
    const result = processCommand(command, state, challenge)
    
    // Log command to history
    await supabase.from('command_history').insert({
      user_id: user.id,
      challenge_id: challengeId || null,
      command,
      output: result.output.substring(0, 1000), // Limit output size
    })
    
    // If flag was found, update user progress
    if (result.flagFound && challenge) {
      // Check if already completed
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challenge.id)
        .single()
      
      if (!existingProgress || existingProgress.status !== 'completed') {
        // Update or insert progress
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          challenge_id: challenge.id,
          status: 'completed',
          completed_at: new Date().toISOString(),
          points_earned: challenge.points,
        }, {
          onConflict: 'user_id,challenge_id'
        })
        
        // Update total points in profile
        await supabase.rpc('increment_user_points', { 
          user_id: user.id, 
          points: challenge.points 
        }).catch(() => {
          // RPC might not exist, fallback to manual update
          supabase
            .from('profiles')
            .select('total_points')
            .eq('id', user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                supabase
                  .from('profiles')
                  .update({ total_points: (profile.total_points || 0) + challenge.points })
                  .eq('id', user.id)
              }
            })
        })
      }
    }
    
    return NextResponse.json({
      output: result.output,
      newState: result.newState,
      flagFound: result.flagFound,
    })
    
  } catch (error) {
    console.error('Terminal API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
