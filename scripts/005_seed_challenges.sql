-- Seed initial CTF challenges
INSERT INTO challenges (name, slug, description, difficulty, category, points, flag, hints, filesystem, services) VALUES

-- Challenge 1: First Blood (Easy - Basics)
(
  'First Blood',
  'first-blood',
  'Welcome to Cyber Academy! Learn the basic terminal commands. Your mission: find the hidden flag file.',
  'Easy',
  'Basics',
  50,
  'flag{welcome_to_cyber_academy}',
  '["Try using ls to list files", "Hidden files start with a dot (.)", "Use cat to read file contents"]',
  '{
    "/": {
      "home": {
        "student": {
          "readme.txt": "Welcome hacker! Start by exploring this directory.\nUse ls -la to see all files including hidden ones.",
          ".flag.txt": "flag{welcome_to_cyber_academy}",
          "notes": {
            "hint.txt": "The flag is hidden in plain sight..."
          }
        }
      }
    }
  }',
  '[]'
),

-- Challenge 2: Hidden Secrets (Easy - Forensics)
(
  'Hidden Secrets',
  'hidden-secrets',
  'A disgruntled employee has hidden sensitive data somewhere on this server. Find all the hidden files and locate the flag.',
  'Easy',
  'Forensics',
  100,
  'flag{secrets_in_the_shadows}',
  '["Check common hiding spots like /tmp and /var", "Some files might have misleading names", "Use find command to search recursively"]',
  '{
    "/": {
      "home": {
        "admin": {
          "documents": {
            "report.txt": "Q3 Financial Report - Nothing suspicious here",
            ".backup": {
              "old_data.txt": "Archived data from 2023"
            }
          }
        }
      },
      "tmp": {
        ".secret_stash": {
          "flag.txt": "flag{secrets_in_the_shadows}"
        }
      },
      "var": {
        "log": {
          "system.log": "System started at 08:00\nUser admin logged in\nSuspicious activity detected..."
        }
      }
    }
  }',
  '[]'
),

-- Challenge 3: Port Scanner (Easy - Network)
(
  'Port Scanner',
  'port-scanner',
  'A mysterious server is running on the network. Use nmap to discover what services are running and find the flag in the service banner.',
  'Easy',
  'Network',
  100,
  'flag{nmap_master_scanner}',
  '["Use nmap to scan the target IP", "Check the service banners carefully", "Port 1337 might be interesting"]',
  '{
    "/": {
      "home": {
        "scanner": {
          "targets.txt": "Target IP: 192.168.1.100\nScan all ports for hidden services",
          "nmap_guide.txt": "Basic nmap usage:\nnmap <target>\nnmap -sV <target> for version detection"
        }
      }
    }
  }',
  '[
    {"port": 22, "service": "ssh", "version": "OpenSSH 8.2", "banner": "SSH-2.0-OpenSSH_8.2"},
    {"port": 80, "service": "http", "version": "nginx 1.18.0", "banner": "Welcome to the web server"},
    {"port": 1337, "service": "elite", "version": "1.0", "banner": "flag{nmap_master_scanner}"}
  ]'
),

-- Challenge 4: Weak Credentials (Medium - Web)
(
  'Weak Credentials',
  'weak-credentials',
  'The system administrator uses embarrassingly weak passwords. Brute force the SSH login to gain access.',
  'Medium',
  'Web',
  150,
  'flag{password123_really}',
  '["Common passwords: admin, password, 123456, password123", "The username is admin", "Try ssh admin@target with common passwords"]',
  '{
    "/": {
      "home": {
        "admin": {
          "secret_files": {
            "flag.txt": "flag{password123_really}",
            "passwords.txt": "Old passwords (dont use these!):\n- letmein\n- admin123\n- password123"
          },
          ".bash_history": "ssh admin@localhost\ncat secret_files/flag.txt"
        }
      },
      "etc": {
        "passwd": "root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:Admin User:/home/admin:/bin/bash"
      }
    }
  }',
  '[
    {"port": 22, "service": "ssh", "version": "OpenSSH 7.9", "users": [{"username": "admin", "password": "password123"}]}
  ]'
),

-- Challenge 5: SQL Injection 101 (Medium - Web)
(
  'SQL Injection 101',
  'sql-injection-101',
  'A vulnerable web application has a login form. Bypass the authentication using SQL injection.',
  'Medium',
  'Web',
  200,
  'flag{bobby_tables_was_here}',
  '["Try single quotes in the username field", "Classic SQLi: '' OR ''1''=''1", "The flag is displayed after successful login"]',
  '{
    "/": {
      "var": {
        "www": {
          "html": {
            "index.php": "<?php // Login form - POST to /login ?>",
            "login.php": "<?php\n// VULNERABLE CODE\n$query = \"SELECT * FROM users WHERE username=''\" . $_POST[''user''] . \"'' AND password=''\" . $_POST[''pass''] . \"''\";\n// Flag shown on successful auth\n?>"
          }
        }
      },
      "home": {
        "webadmin": {
          "notes.txt": "TODO: Fix SQL injection in login form\nNever concatenate user input directly!"
        }
      }
    }
  }',
  '[
    {"port": 80, "service": "http", "version": "Apache 2.4.41", "endpoints": [{"path": "/", "method": "GET"}, {"path": "/login", "method": "POST", "vulnerable": true, "flag_on_bypass": "flag{bobby_tables_was_here}"}]}
  ]'
),

-- Challenge 6: Packet Capture (Medium - Network)
(
  'Packet Capture',
  'packet-capture',
  'We intercepted network traffic from a suspicious server. Analyze the capture file to find leaked credentials.',
  'Medium',
  'Network',
  200,
  'flag{wireshark_detective}',
  '["Look for HTTP traffic", "Credentials are often sent in plain text", "Check the Authorization headers"]',
  '{
    "/": {
      "home": {
        "analyst": {
          "captures": {
            "traffic.pcap": "Frame 1: 74 bytes on wire\nHTTP GET /admin\nAuthorization: Basic YWRtaW46ZmxhZ3t3aXJlc2hhcmtfZGV0ZWN0aXZlfQ==\n\nFrame 2: 200 OK",
            "readme.txt": "Decode the Base64 Authorization header to find the flag.\nFormat: username:password"
          }
        }
      }
    }
  }',
  '[]'
),

-- Challenge 7: Crypto Basics (Medium - Crypto)
(
  'Crypto Basics',
  'crypto-basics',
  'Intercepted messages are encoded with various ciphers. Decode them all to find the flag.',
  'Medium',
  'Crypto',
  250,
  'flag{crypto_champion_2024}',
  '["Start with Base64, its the most common", "ROT13 shifts letters by 13", "Try online decoders if stuck"]',
  '{
    "/": {
      "home": {
        "cryptographer": {
          "messages": {
            "encoded1.txt": "Base64: ZmxhZ3tjcnlwdG9fY2hhbXBpb25fMjAyNH0=",
            "encoded2.txt": "ROT13: synt{pelcgb_punzcvba_2024}",
            "encoded3.txt": "Hex: 666c61677b63727970746f5f6368616d70696f6e5f323032347d"
          },
          "cheatsheet.txt": "Common encodings:\n- Base64: Uses A-Za-z0-9+/\n- ROT13: Rotate letters by 13\n- Hex: Convert to ASCII"
        }
      }
    }
  }',
  '[]'
),

-- Challenge 8: Privilege Escalation (Hard - Linux)
(
  'Privilege Escalation',
  'privilege-escalation',
  'You have low-privilege access. Find a way to escalate to root and read the protected flag.',
  'Hard',
  'Linux',
  300,
  'flag{sudo_make_me_a_sandwich}',
  '["Check what you can run with sudo -l", "Look for SUID binaries", "Check cron jobs for writable scripts"]',
  '{
    "/": {
      "home": {
        "lowpriv": {
          "readme.txt": "You are a low privilege user. Escalate to root to read /root/flag.txt"
        }
      },
      "root": {
        "flag.txt": "flag{sudo_make_me_a_sandwich}"
      },
      "etc": {
        "sudoers": "lowpriv ALL=(ALL) NOPASSWD: /usr/bin/vim",
        "crontab": "* * * * * root /opt/backup.sh"
      },
      "opt": {
        "backup.sh": "#!/bin/bash\n# World-writable backup script\ntar -czf /tmp/backup.tar.gz /home"
      }
    }
  }',
  '[
    {"port": 22, "service": "ssh", "version": "OpenSSH 8.4", "users": [{"username": "lowpriv", "password": "user123"}]}
  ]'
),

-- Challenge 9: Buffer Overflow (Hard - Binary)
(
  'Buffer Overflow',
  'buffer-overflow',
  'A vulnerable binary accepts user input without bounds checking. Exploit it to reveal the flag.',
  'Hard',
  'Binary',
  400,
  'flag{smashing_the_stack}',
  '["The buffer is 64 bytes", "Look for format string vulnerabilities", "Try overflowing with a pattern"]',
  '{
    "/": {
      "home": {
        "pwn": {
          "vulnerable": "ELF 64-bit LSB executable\n\nvoid vuln() {\n  char buffer[64];\n  gets(buffer); // VULNERABLE!\n  if (overwritten) {\n    print_flag();\n  }\n}",
          "flag_printer.c": "#include <stdio.h>\nvoid print_flag() {\n  printf(\"flag{smashing_the_stack}\");\n}",
          "exploit_guide.txt": "1. Find buffer size (64 bytes)\n2. Overflow to overwrite return address\n3. Redirect execution to print_flag()\n\nTry: ./vulnerable $(python -c ''print(\"A\"*72)'')"
        }
      }
    }
  }',
  '[]'
),

-- Challenge 10: The Fortress (Insane - Mixed)
(
  'The Fortress',
  'the-fortress',
  'The ultimate challenge. A multi-layered defense system protects the final flag. Use everything you have learned.',
  'Insane',
  'Mixed',
  500,
  'flag{master_hacker_elite}',
  '["Start with network reconnaissance", "Each layer reveals a clue for the next", "Combine multiple techniques"]',
  '{
    "/": {
      "home": {
        "guest": {
          "welcome.txt": "Welcome to The Fortress.\nLayer 1: Find the hidden service\nLayer 2: Crack the credentials\nLayer 3: Decode the message\nLayer 4: Escalate privileges\nLayer 5: Claim your prize"
        }
      },
      "opt": {
        "layer2": {
          ".credentials": "admin:Zm9ydHJlc3MxMjM="
        },
        "layer3": {
          "encoded_hint.txt": "Ynfr64 qrpbqr guvf: ZmxhZ3 (ROT13 + partial base64)"
        },
        "layer4": {
          "suid_binary": "SUID root binary - exploitable with known CVE"
        }
      },
      "root": {
        "flag.txt": "flag{master_hacker_elite}",
        "victory.txt": "Congratulations! You have conquered The Fortress.\nYou are now a true Cyber Academy Elite."
      }
    }
  }',
  '[
    {"port": 22, "service": "ssh", "version": "OpenSSH 7.2", "users": [{"username": "admin", "password": "fortress123"}]},
    {"port": 80, "service": "http", "version": "Apache 2.4.29", "banner": "Layer 1 complete. Check port 8080."},
    {"port": 8080, "service": "http-proxy", "version": "Squid 3.5", "banner": "Hint: /opt/layer2/.credentials"},
    {"port": 3306, "service": "mysql", "version": "5.7.32", "banner": "MySQL - Access Denied"},
    {"port": 31337, "service": "elite", "version": "1.0", "banner": "Final layer. Root access required."}
  ]'
)
ON CONFLICT (slug) DO NOTHING;
