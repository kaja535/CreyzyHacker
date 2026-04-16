#!/usr/bin/env python3
"""
BUNKER GUARDIAN - AI Security Agent
====================================
Network scanner and vulnerability detector with voice alerts.
Designed to run on Linux/Termux for real-time network monitoring.

Requirements:
    pip install scapy python-nmap requests elevenlabs

Usage:
    python bunker_guardian.py [--api-key YOUR_API_KEY] [--voice-enabled]

Author: Cyber Academy
Version: 2.0.1
"""

import argparse
import json
import os
import socket
import struct
import subprocess
import sys
import threading
import time
from datetime import datetime
from typing import Dict, List, Optional, Set

# Optional imports with fallbacks
try:
    from scapy.all import ARP, Ether, srp, conf
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False
    print("[!] Scapy not installed. Install with: pip install scapy")

try:
    import nmap
    NMAP_AVAILABLE = True
except ImportError:
    NMAP_AVAILABLE = False
    print("[!] python-nmap not installed. Install with: pip install python-nmap")

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("[!] requests not installed. Install with: pip install requests")

try:
    from elevenlabs import ElevenLabs
    ELEVENLABS_AVAILABLE = True
except ImportError:
    ELEVENLABS_AVAILABLE = False
    print("[!] elevenlabs not installed. Install with: pip install elevenlabs")


class BunkerGuardian:
    """AI Security Agent for network monitoring and threat detection."""
    
    def __init__(
        self,
        interface: str = None,
        api_key: str = None,
        voice_enabled: bool = False,
        dashboard_url: str = None
    ):
        self.interface = interface or self._get_default_interface()
        self.api_key = api_key or os.environ.get('ELEVENLABS_API_KEY')
        self.voice_enabled = voice_enabled and ELEVENLABS_AVAILABLE and self.api_key
        self.dashboard_url = dashboard_url
        
        self.known_devices: Dict[str, dict] = {}
        self.trusted_macs: Set[str] = set()
        self.blocked_macs: Set[str] = set()
        self.scan_history: List[dict] = []
        
        # ElevenLabs client for voice alerts
        self.eleven_client = None
        if self.voice_enabled:
            try:
                self.eleven_client = ElevenLabs(api_key=self.api_key)
            except Exception as e:
                print(f"[!] Failed to initialize ElevenLabs: {e}")
                self.voice_enabled = False
        
        # Vulnerability database (common insecure ports)
        self.vulnerable_ports = {
            21: ("FTP", "File Transfer Protocol - often unencrypted"),
            22: ("SSH", "Secure Shell - check for weak passwords"),
            23: ("Telnet", "Unencrypted remote access - HIGH RISK"),
            25: ("SMTP", "Mail server - check for open relay"),
            53: ("DNS", "Domain Name System - check for zone transfer"),
            80: ("HTTP", "Web server - check for vulnerabilities"),
            110: ("POP3", "Email retrieval - often unencrypted"),
            135: ("RPC", "Windows RPC - potential exploit target"),
            139: ("NetBIOS", "Windows file sharing - security risk"),
            443: ("HTTPS", "Secure web server"),
            445: ("SMB", "Windows file sharing - common attack target"),
            1433: ("MSSQL", "Microsoft SQL Server"),
            1521: ("Oracle", "Oracle Database"),
            3306: ("MySQL", "MySQL Database"),
            3389: ("RDP", "Remote Desktop - brute force target"),
            5432: ("PostgreSQL", "PostgreSQL Database"),
            5900: ("VNC", "Virtual Network Computing - often weak"),
            6379: ("Redis", "Redis Database - often no auth"),
            8080: ("HTTP-Alt", "Alternative web server"),
            27017: ("MongoDB", "MongoDB - often no auth"),
        }
        
        print(self._banner())
        print(f"[*] Interface: {self.interface}")
        print(f"[*] Voice alerts: {'Enabled' if self.voice_enabled else 'Disabled'}")
    
    def _banner(self) -> str:
        """Return ASCII art banner."""
        return """
╔═══════════════════════════════════════════════════════════════╗
║   ____  _   _ _   _ _  _______ ____     ____ _   _    _    ____║
║  | __ )| | | | \ | | |/ / ____|  _ \   / ___| | | |  / \  |  _ \\║
║  |  _ \| | | |  \| | ' /|  _| | |_) | | |  _| | | | / _ \ | | | |║
║  | |_) | |_| | |\  | . \| |___|  _ <  | |_| | |_| |/ ___ \| |_| |║
║  |____/ \___/|_| \_|_|\_\_____|_| \_\  \____|\___/_/   \_\____/║
║                                                               ║
║                 AI SECURITY AGENT v2.0.1                      ║
║                     CYBER ACADEMY                             ║
╚═══════════════════════════════════════════════════════════════╝
"""
    
    def _get_default_interface(self) -> str:
        """Get the default network interface."""
        try:
            # Try to get the default interface
            if sys.platform == 'linux':
                result = subprocess.run(
                    ['ip', 'route', 'show', 'default'],
                    capture_output=True,
                    text=True
                )
                if result.stdout:
                    parts = result.stdout.split()
                    if 'dev' in parts:
                        return parts[parts.index('dev') + 1]
            return 'wlan0'  # Default for mobile/WiFi
        except Exception:
            return 'wlan0'
    
    def _get_local_ip(self) -> str:
        """Get the local IP address."""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "192.168.1.1"
    
    def _get_network_range(self) -> str:
        """Get the network range for scanning."""
        local_ip = self._get_local_ip()
        # Assume /24 subnet
        parts = local_ip.split('.')
        parts[3] = '0/24'
        return '.'.join(parts)
    
    def speak(self, message: str, voice: str = "Rachel"):
        """Speak a message using ElevenLabs TTS."""
        if not self.voice_enabled or not self.eleven_client:
            return
        
        try:
            # Generate audio
            audio = self.eleven_client.text_to_speech.convert(
                text=message,
                voice_id=voice,
                model_id="eleven_multilingual_v2"
            )
            
            # Save and play audio
            audio_path = "/tmp/bunker_alert.mp3"
            with open(audio_path, "wb") as f:
                for chunk in audio:
                    f.write(chunk)
            
            # Play audio (cross-platform)
            if sys.platform == 'linux':
                # Try different players
                for player in ['mpv', 'ffplay', 'aplay', 'play']:
                    try:
                        subprocess.run(
                            [player, audio_path],
                            capture_output=True,
                            timeout=30
                        )
                        break
                    except (FileNotFoundError, subprocess.TimeoutExpired):
                        continue
            elif sys.platform == 'darwin':
                subprocess.run(['afplay', audio_path], capture_output=True)
            
        except Exception as e:
            print(f"[!] Voice alert failed: {e}")
    
    def scan_network(self) -> List[dict]:
        """Scan the local network for devices using ARP."""
        if not SCAPY_AVAILABLE:
            print("[!] Scapy not available, using fallback method")
            return self._scan_network_fallback()
        
        print(f"\n[*] Scanning network: {self._get_network_range()}")
        
        try:
            # Suppress scapy warnings
            conf.verb = 0
            
            # Create ARP request
            network_range = self._get_network_range()
            arp = ARP(pdst=network_range)
            ether = Ether(dst="ff:ff:ff:ff:ff:ff")
            packet = ether / arp
            
            # Send packets and receive responses
            result = srp(packet, timeout=3, verbose=0, iface=self.interface)[0]
            
            devices = []
            for sent, received in result:
                device = {
                    'ip': received.psrc,
                    'mac': received.hwsrc.upper(),
                    'hostname': self._get_hostname(received.psrc),
                    'last_seen': datetime.now().isoformat(),
                    'status': 'trusted' if received.hwsrc.upper() in self.trusted_macs else 'unknown'
                }
                devices.append(device)
                
                # Check for new devices
                if received.hwsrc.upper() not in self.known_devices:
                    self._handle_new_device(device)
                
                self.known_devices[received.hwsrc.upper()] = device
            
            return devices
            
        except PermissionError:
            print("[!] Permission denied. Run with sudo/root privileges.")
            return []
        except Exception as e:
            print(f"[!] Scan error: {e}")
            return self._scan_network_fallback()
    
    def _scan_network_fallback(self) -> List[dict]:
        """Fallback network scan using ping."""
        print("[*] Using ping fallback scan...")
        devices = []
        network = self._get_local_ip().rsplit('.', 1)[0]
        
        for i in range(1, 255):
            ip = f"{network}.{i}"
            try:
                result = subprocess.run(
                    ['ping', '-c', '1', '-W', '1', ip],
                    capture_output=True,
                    timeout=2
                )
                if result.returncode == 0:
                    device = {
                        'ip': ip,
                        'mac': 'Unknown',
                        'hostname': self._get_hostname(ip),
                        'last_seen': datetime.now().isoformat(),
                        'status': 'unknown'
                    }
                    devices.append(device)
            except (subprocess.TimeoutExpired, Exception):
                continue
        
        return devices
    
    def _get_hostname(self, ip: str) -> str:
        """Get hostname for an IP address."""
        try:
            hostname = socket.gethostbyaddr(ip)[0]
            return hostname
        except Exception:
            return "Unknown"
    
    def _handle_new_device(self, device: dict):
        """Handle detection of a new device."""
        print(f"\n[!] NEW DEVICE DETECTED!")
        print(f"    IP: {device['ip']}")
        print(f"    MAC: {device['mac']}")
        print(f"    Hostname: {device['hostname']}")
        
        # Voice alert
        if self.voice_enabled:
            message = f"Attention! A new device has been detected on the network. "
            message += f"IP address: {device['ip']}. "
            message += f"Device name: {device['hostname']}. "
            message += "Initiating security scan."
            
            # Run in background thread
            threading.Thread(target=self.speak, args=(message,)).start()
    
    def scan_ports(self, target: str, ports: str = "21-25,80,443,3306,3389,8080") -> List[dict]:
        """Scan ports on a target device."""
        if not NMAP_AVAILABLE:
            print("[!] python-nmap not available")
            return self._scan_ports_fallback(target, ports)
        
        print(f"\n[*] Scanning ports on {target}...")
        
        try:
            nm = nmap.PortScanner()
            nm.scan(target, ports, arguments='-sV -sC')
            
            open_ports = []
            for host in nm.all_hosts():
                for proto in nm[host].all_protocols():
                    ports_list = nm[host][proto].keys()
                    for port in ports_list:
                        state = nm[host][proto][port]['state']
                        if state == 'open':
                            port_info = {
                                'port': port,
                                'state': state,
                                'service': nm[host][proto][port]['name'],
                                'version': nm[host][proto][port].get('version', ''),
                                'vulnerability': self.vulnerable_ports.get(port, (None, None))
                            }
                            open_ports.append(port_info)
                            
                            # Alert for high-risk ports
                            if port in [23, 21, 445, 3389]:
                                self._alert_vulnerable_port(target, port_info)
            
            return open_ports
            
        except Exception as e:
            print(f"[!] Port scan error: {e}")
            return self._scan_ports_fallback(target, ports)
    
    def _scan_ports_fallback(self, target: str, ports: str) -> List[dict]:
        """Fallback port scan using socket."""
        print("[*] Using socket fallback scan...")
        open_ports = []
        
        port_list = []
        for part in ports.split(','):
            if '-' in part:
                start, end = map(int, part.split('-'))
                port_list.extend(range(start, end + 1))
            else:
                port_list.append(int(part))
        
        for port in port_list:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex((target, port))
                if result == 0:
                    port_info = {
                        'port': port,
                        'state': 'open',
                        'service': self.vulnerable_ports.get(port, ('unknown', ''))[0] or 'unknown',
                        'vulnerability': self.vulnerable_ports.get(port, (None, None))
                    }
                    open_ports.append(port_info)
                sock.close()
            except Exception:
                continue
        
        return open_ports
    
    def _alert_vulnerable_port(self, target: str, port_info: dict):
        """Alert about a vulnerable port."""
        print(f"\n[!] SECURITY RISK DETECTED!")
        print(f"    Target: {target}")
        print(f"    Port: {port_info['port']}")
        print(f"    Service: {port_info['service']}")
        if port_info['vulnerability'][1]:
            print(f"    Risk: {port_info['vulnerability'][1]}")
        
        if self.voice_enabled:
            message = f"Security alert! Vulnerable port detected on {target}. "
            message += f"Port {port_info['port']} running {port_info['service']} is open. "
            message += "Immediate investigation recommended."
            threading.Thread(target=self.speak, args=(message,)).start()
    
    def generate_report(self) -> dict:
        """Generate a security report."""
        report = {
            'timestamp': datetime.now().isoformat(),
            'network_range': self._get_network_range(),
            'total_devices': len(self.known_devices),
            'trusted_devices': len(self.trusted_macs),
            'unknown_devices': len(self.known_devices) - len(self.trusted_macs),
            'blocked_devices': len(self.blocked_macs),
            'devices': list(self.known_devices.values()),
            'scan_history': self.scan_history[-10:]  # Last 10 scans
        }
        return report
    
    def run_continuous(self, interval: int = 300):
        """Run continuous monitoring."""
        print(f"\n[*] Starting continuous monitoring (interval: {interval}s)")
        print("[*] Press Ctrl+C to stop\n")
        
        try:
            while True:
                # Scan network
                devices = self.scan_network()
                
                print(f"\n[+] Found {len(devices)} devices")
                
                # Scan new/unknown devices for open ports
                for device in devices:
                    if device['mac'] not in self.trusted_macs:
                        ports = self.scan_ports(device['ip'])
                        if ports:
                            print(f"[*] {device['ip']} has {len(ports)} open ports")
                
                # Save scan to history
                self.scan_history.append({
                    'timestamp': datetime.now().isoformat(),
                    'devices_found': len(devices)
                })
                
                # Wait for next scan
                print(f"\n[*] Next scan in {interval} seconds...")
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n[*] Stopping Bunker Guardian...")
            report = self.generate_report()
            print(f"\n[*] Final report: {len(report['devices'])} devices monitored")
    
    def trust_device(self, mac: str):
        """Add a device to trusted list."""
        mac = mac.upper()
        self.trusted_macs.add(mac)
        if mac in self.known_devices:
            self.known_devices[mac]['status'] = 'trusted'
        print(f"[+] Device {mac} added to trusted list")
    
    def block_device(self, mac: str):
        """Add a device to blocked list."""
        mac = mac.upper()
        self.blocked_macs.add(mac)
        if mac in self.known_devices:
            self.known_devices[mac]['status'] = 'blocked'
        print(f"[!] Device {mac} added to blocked list")
        
        if self.voice_enabled:
            message = f"Device with MAC address {mac} has been blocked from the network."
            threading.Thread(target=self.speak, args=(message,)).start()


def main():
    parser = argparse.ArgumentParser(
        description='Bunker Guardian - AI Security Agent',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python bunker_guardian.py
    python bunker_guardian.py --voice-enabled --api-key YOUR_ELEVENLABS_KEY
    python bunker_guardian.py --interface wlan0 --interval 60
        """
    )
    
    parser.add_argument(
        '--interface', '-i',
        help='Network interface to use (default: auto-detect)'
    )
    parser.add_argument(
        '--api-key', '-k',
        help='ElevenLabs API key for voice alerts'
    )
    parser.add_argument(
        '--voice-enabled', '-v',
        action='store_true',
        help='Enable voice alerts'
    )
    parser.add_argument(
        '--interval', '-t',
        type=int,
        default=300,
        help='Scan interval in seconds (default: 300)'
    )
    parser.add_argument(
        '--single-scan', '-s',
        action='store_true',
        help='Run a single scan and exit'
    )
    
    args = parser.parse_args()
    
    # Initialize guardian
    guardian = BunkerGuardian(
        interface=args.interface,
        api_key=args.api_key,
        voice_enabled=args.voice_enabled
    )
    
    if args.single_scan:
        # Single scan mode
        devices = guardian.scan_network()
        for device in devices:
            print(f"  {device['ip']:15} | {device['mac']:17} | {device['hostname']}")
            ports = guardian.scan_ports(device['ip'])
            for port in ports:
                print(f"    └─ Port {port['port']}: {port['service']}")
    else:
        # Continuous monitoring
        guardian.run_continuous(interval=args.interval)


if __name__ == '__main__':
    main()
