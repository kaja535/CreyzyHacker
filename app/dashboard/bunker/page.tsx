'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Radio, 
  Shield, 
  Wifi, 
  AlertTriangle, 
  CheckCircle,
  Monitor,
  Server,
  Activity,
  Volume2,
  VolumeX
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NetworkDevice {
  ip: string
  mac: string
  hostname: string
  status: 'trusted' | 'unknown' | 'threat'
  lastSeen: Date
  ports?: number[]
}

// Simulated network data - in production this would come from the Python agent
const mockDevices: NetworkDevice[] = [
  { ip: '192.168.1.1', mac: 'AA:BB:CC:DD:EE:01', hostname: 'Router', status: 'trusted', lastSeen: new Date() },
  { ip: '192.168.1.100', mac: 'AA:BB:CC:DD:EE:02', hostname: 'Main-PC', status: 'trusted', lastSeen: new Date() },
  { ip: '192.168.1.101', mac: 'AA:BB:CC:DD:EE:03', hostname: 'Phone-User', status: 'trusted', lastSeen: new Date() },
  { ip: '192.168.1.105', mac: 'AA:BB:CC:DD:EE:04', hostname: 'Unknown-Device', status: 'unknown', lastSeen: new Date(), ports: [22, 80] },
]

export default function BunkerPage() {
  const [devices, setDevices] = useState<NetworkDevice[]>(mockDevices)
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<Date | null>(null)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [alerts, setAlerts] = useState<string[]>([])

  const startScan = () => {
    setIsScanning(true)
    setAlerts([])
    
    // Simulate scanning
    setTimeout(() => {
      // Randomly add a new device sometimes
      if (Math.random() > 0.7) {
        const newDevice: NetworkDevice = {
          ip: `192.168.1.${Math.floor(Math.random() * 50) + 150}`,
          mac: `XX:XX:XX:${Math.random().toString(16).substring(2, 8).toUpperCase()}`,
          hostname: 'New-Unknown-Device',
          status: 'unknown',
          lastSeen: new Date(),
          ports: [22, 80, 443].filter(() => Math.random() > 0.5)
        }
        setDevices(prev => [...prev, newDevice])
        setAlerts(prev => [...prev, `New device detected: ${newDevice.ip}`])
      }
      
      setIsScanning(false)
      setLastScan(new Date())
    }, 3000)
  }

  const markAsTrusted = (ip: string) => {
    setDevices(prev => prev.map(d => 
      d.ip === ip ? { ...d, status: 'trusted' as const } : d
    ))
  }

  const markAsThreat = (ip: string) => {
    setDevices(prev => prev.map(d => 
      d.ip === ip ? { ...d, status: 'threat' as const } : d
    ))
    setAlerts(prev => [...prev, `Device ${ip} marked as threat - isolation recommended`])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trusted':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'unknown':
        return 'bg-terminal-warning/20 text-terminal-warning border-terminal-warning/30'
      case 'threat':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const trustedCount = devices.filter(d => d.status === 'trusted').length
  const unknownCount = devices.filter(d => d.status === 'unknown').length
  const threatCount = devices.filter(d => d.status === 'threat').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-foreground flex items-center gap-3">
            <Radio className="h-7 w-7 text-primary animate-pulse" />
            {">"} BUNKER_GUARDIAN
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            AI-powered network security monitoring system
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={cn(
              "font-mono",
              voiceEnabled && "border-primary text-primary"
            )}
          >
            {voiceEnabled ? (
              <><Volume2 className="h-4 w-4 mr-2" /> Voice ON</>
            ) : (
              <><VolumeX className="h-4 w-4 mr-2" /> Voice OFF</>
            )}
          </Button>
          
          <Button
            onClick={startScan}
            disabled={isScanning}
            className="font-mono bg-primary text-primary-foreground"
          >
            {isScanning ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-pulse" />
                SCANNING...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                SCAN_NETWORK
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-terminal-warning/10 border border-terminal-warning/30 rounded-lg"
            >
              <AlertTriangle className="h-5 w-5 text-terminal-warning flex-shrink-0" />
              <span className="text-sm font-mono text-foreground">{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold font-mono text-foreground">
                  {devices.length}
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  Total Devices
                </p>
              </div>
              <Monitor className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold font-mono text-primary">
                  {trustedCount}
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  Trusted
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold font-mono text-terminal-warning">
                  {unknownCount}
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  Unknown
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-terminal-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold font-mono text-destructive">
                  {threatCount}
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  Threats
                </p>
              </div>
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network devices */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-mono flex items-center gap-2">
              <Wifi className="h-5 w-5 text-primary" />
              Network Devices
            </CardTitle>
            {lastScan && (
              <span className="text-xs text-muted-foreground font-mono">
                Last scan: {lastScan.toLocaleTimeString()}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.ip}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border",
                  device.status === 'threat' && "border-destructive/50 bg-destructive/5",
                  device.status === 'unknown' && "border-terminal-warning/50 bg-terminal-warning/5",
                  device.status === 'trusted' && "border-border bg-card"
                )}
              >
                <div className="flex items-center gap-4">
                  <Server className={cn(
                    "h-8 w-8",
                    device.status === 'trusted' && "text-primary",
                    device.status === 'unknown' && "text-terminal-warning",
                    device.status === 'threat' && "text-destructive"
                  )} />
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-foreground">
                        {device.hostname}
                      </p>
                      <Badge variant="outline" className={getStatusColor(device.status)}>
                        {device.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {device.ip} | {device.mac}
                    </p>
                    {device.ports && device.ports.length > 0 && (
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        Open ports: {device.ports.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {device.status !== 'trusted' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsTrusted(device.ip)}
                      className="font-mono text-primary border-primary/30 hover:bg-primary/10"
                    >
                      TRUST
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsThreat(device.ip)}
                      className="font-mono text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      BLOCK
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Python agent instructions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-mono text-lg">Setup Python Agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To enable real network scanning, run the Bunker Guardian agent on your local machine or Termux:
          </p>
          <div className="bg-terminal-bg p-4 rounded-lg font-mono text-sm">
            <p className="text-muted-foreground"># Install dependencies</p>
            <p className="text-terminal-prompt">pip install scapy python-nmap elevenlabs</p>
            <p className="text-muted-foreground mt-2"># Run the agent</p>
            <p className="text-terminal-prompt">python bunker_guardian.py</p>
          </div>
          <p className="text-xs text-muted-foreground">
            The agent will automatically scan your network and report findings to this dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
