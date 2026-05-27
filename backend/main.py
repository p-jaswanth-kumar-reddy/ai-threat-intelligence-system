# ================== IMPORTS ==================
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse

from database import users_collection, otp_collection, scans_collection

from services.scanner import scan_target
from services.vulnerability import analyze_vulnerabilities
from services.report import generate_report

from datetime import datetime
from bson import ObjectId

import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv
from random import randint
import time, json

# ================== APP ==================
app = FastAPI()

# ================== ENV ==================
load_dotenv()
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

# ================== EMAIL ==================
def send_email(to_email, message):
    try:
        msg = MIMEText(message)
        msg["Subject"] = "AI RedTeam OTP"
        msg["From"] = EMAIL_USER
        msg["To"] = to_email

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.send_message(msg)
        server.quit()

        print("Email sent ✅")

    except Exception as e:
        print("Email failed ❌", e)

# ================== HOME ==================
@app.get("/")
def home():
    return {"message": "AI Red Team Backend Running"}

# ================== REGISTER ==================
@app.post("/register")
def register(user: dict):

    email = user.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="User already exists")

    users_collection.insert_one(user)

    return {"message": "User registered successfully"}

# ================== LOGIN ==================
@app.post("/login")
def login(data: dict = Body(...)):

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email & password required")

    user = users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user["password"] != password:
        raise HTTPException(status_code=400, detail="Wrong password")

    # 🔥 DELETE OLD OTP
    otp_collection.delete_many({"email": email})

    # 🔥 CREATE NEW OTP
    otp = str(randint(100000, 999999))

    otp_collection.insert_one({
        "email": email,
        "otp": otp
    })

    print("OTP:", otp)

    try:
        send_email(email, f"Your OTP is {otp}")
    except Exception as e:
        print("EMAIL ERROR:", e)

    return {"message": "OTP sent"}

# ================== VERIFY OTP ==================
@app.post("/verify-otp")
def verify_otp(data: dict = Body(...)):

    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        raise HTTPException(status_code=400, detail="Email and OTP required")

    record = otp_collection.find_one({"email": email, "otp": otp})

    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    otp_collection.delete_many({"email": email})

    return {"message": "Login success"}

# ================== FORGOT PASSWORD ==================
@app.post("/forgot-password")
def forgot_password(data: dict = Body(...)):

    email = data.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    user = users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp_collection.delete_many({"email": email})

    otp = str(randint(100000, 999999))

    otp_collection.insert_one({
        "email": email,
        "otp": otp
    })

    print("OTP:", otp)

    try:
        send_email(email, f"Your OTP is {otp}")
    except Exception as e:
        print("EMAIL ERROR:", e)

    return {"message": "OTP sent"}

# ================== RESET PASSWORD ==================
@app.post("/reset-password")
def reset_password(data: dict = Body(...)):

    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")

    if not email or not otp or not new_password:
        raise HTTPException(status_code=400, detail="Missing fields")

    record = otp_collection.find_one({"email": email})

    if not record or record["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    users_collection.update_one(
        {"email": email},
        {"$set": {"password": new_password}}
    )

    otp_collection.delete_many({"email": email})

    return {"message": "Password reset successful"}

# ================== PROFILE ==================
@app.get("/profile/{email}")
def profile(email: str):

    user = users_collection.find_one({"email": email}, {"password": 0})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["_id"] = str(user["_id"])
    return user

# ================== UPDATE PROFILE ==================
@app.put("/update-profile")
def update_profile(data: dict = Body(...)):

    email = data.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    data.pop("_id", None)

    result = users_collection.update_one(
        {"email": email},
        {"$set": data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Profile updated successfully"}

# ================== HISTORY ==================
@app.get("/history")
def get_history():

    data = list(scans_collection.find().sort("timestamp", -1))

    for item in data:
        item["_id"] = str(item["_id"])

    return {"history": data}

# ================== DELETE HISTORY ==================
@app.delete("/history/{id}")
def delete_history(id: str):

    if ObjectId.is_valid(id):
        result = scans_collection.delete_one({"_id": ObjectId(id)})
    else:
        result = scans_collection.delete_one({"_id": id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")

    return {"message": "Deleted successfully"}

# ================== DOWNLOAD REPORT ==================
@app.get("/download-report/{report_id}")
def download_report(report_id: str):

    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    scan = scans_collection.find_one({"_id": ObjectId(report_id)})

    if not scan:
        raise HTTPException(status_code=404, detail="Not found")

    file_path = scan.get("report")

    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File missing")

    return FileResponse(path=file_path, filename="report.pdf")

# ================== STREAM SCAN ==================
@app.get("/scan-stream/{targets}")
def scan_stream(targets: str):

    def generate():

        steps = [
            "[+] Initializing scan...",
            "[+] Target locked",
            "[+] Scanning ports...",
            "[+] Bypassing firewall...",
            "[+] Injecting packets...",
            "[+] Enumerating services..."
        ]

        for i, step in enumerate(steps):
            yield f"data: {json.dumps({'log': step, 'progress': int((i+1)/len(steps)*70)})}\n\n"
            time.sleep(0.5)

        results = []
        target_list = targets.split(",")

        yield f"data: {json.dumps({'progress': 90})}\n\n"

        for ip in target_list:
            result = scan_target(ip.strip())

            if result["status"] == "success":
                vulnerabilities = analyze_vulnerabilities(result["data"])

                results.append({
                    "target": ip,
                    "scan": result["data"],
                    "vulnerabilities": vulnerabilities
                })

        scan_id = ObjectId()
        file_name = f"reports/report_{scan_id}.pdf"

        generate_report({"results": results}, file_name)

        scans_collection.insert_one({
            "_id": scan_id,
            "targets": targets,
            "results": results,
            "report": file_name,
            "timestamp": datetime.now()
        })

        yield f"data: {json.dumps({
            'done': True,
            'results': results,
            'report_id': str(scan_id),
            'progress': 100
        })}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

# ================== CORS ==================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)