# 🛡️ AI Threat Intelligence System

An AI-powered cybersecurity platform designed for vulnerability assessment, threat intelligence analysis, and automated security monitoring using modern web technologies and penetration testing tools.

---

# 🚀 Features

- 🔐 Secure User Authentication using JWT
- 📡 Network Scanning using Nmap
- 🧠 AI-Based Threat Intelligence
- ⚠️ CVE Vulnerability Detection
- 📊 Interactive Cybersecurity Dashboard
- 📁 Scan History & Reports
- 📧 OTP-Based Password Reset
- 🌐 Real-Time Threat Analysis
- 🐳 Docker-Compatible Architecture
- 🛡️ Kali Linux Integration Support

---

# 🛠️ Technologies Used

## Frontend
- React.js
- Tailwind CSS
- Axios

## Backend
- FastAPI
- Python
- JWT Authentication
- Passlib (bcrypt)

## Database
- MongoDB

## Cybersecurity Tools
- Nmap
- CVE APIs

---

# 📂 Project Structure

```bash
ai-redteam/
│
├── backend/
│   ├── database.py
│   ├── main.py
│   ├── services/
│   └── reports/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   └── tailwind.config.js
│
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/p-jaswanth-kumar-reddy/ai-threat-intelligence-system.git
```

---

## 2️⃣ Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend server:

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

# 🔐 Environment Variables

Create `.env` inside backend folder:

```env
SECRET_KEY=your_secret_key
MONGO_URI=your_mongodb_uri
```

---

# 📊 Functional Modules

- User Authentication Module
- Threat Intelligence Engine
- Vulnerability Detection Module
- CVE Analysis System
- Report Generation Module
- Scan History Management
- OTP Verification System

---

# 🧠 How It Works

1. User logs into the system securely.
2. Target IP/domain is submitted for scanning.
3. Nmap scans open ports and services.
4. Backend fetches related CVEs.
5. Risk analysis is performed.
6. Results are displayed in dashboard format.
7. Reports can be downloaded and stored.

---

# 🛡️ Security Features

- JWT Authentication
- Password Hashing using bcrypt
- OTP-Based Password Reset
- Secure API Communication
- Environment Variable Protection

---

# 🎯 Future Enhancements

- AI-based anomaly detection
- Real-time threat monitoring
- SIEM integration
- Cloud deployment
- Advanced malware analysis

---

# 👨‍💻 Authors

## P Jaswanth Kumar Reddy
Department of Computer Science and Engineering (AIML)  
Sathyabama Institute of Science and Technology  
Chennai, India  
📧 pjaswanthkumarreddy3@gmail.com

---

## D Nikith Kumar Reddy
Department of Computer Science and Engineering (AIML)  
Sathyabama Institute of Science and Technology  
Chennai, India  
📧 nikithkumarreddy6671@gmail.com

---

# 📜 License

This project is developed for educational and research purposes.