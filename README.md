# 🫀 CardioSense AI

> **AI-powered ECG Analysis Platform** — Upload your ECG CSV file, visualize it with clinical precision, and get AI-driven cardiac insights.

---

## 🏗 Architecture

```
CardioSense AI
├── frontend/      # React + Vite (UI)
├── backend/       # Node.js + Express (API Gateway, File Handling)
└── ml/            # Python + FastAPI (ML Inference Engine)
```

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- Python 3.10+
- npm / pip

### 1. Backend (Node.js)
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### 2. ML Service (Python)
```bash
cd ml
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 📊 ECG Input Format

- **File type**: `.csv` (MATLAB export)
- **Sample Rate**: 360 Hz
- **Duration**: 10 seconds (3600 samples)
- **Format**: Single column of amplitude values, or `time,amplitude` columns

## 🧠 ML Pipeline (Coming Soon)

- Deep Learning model for arrhythmia detection
- MIT-BIH dataset trained model
- Real-time inference via Python FastAPI

## 🚀 Deployment Options

| Platform | Notes |
|----------|-------|
| **Localhost** | Current default — all services on local ports |
| **Railway.app** | Free tier, supports Node.js + Python, no cold starts |
| **Render.com** | Free tier with sleep, great for hackathons |
| **Fly.io** | Docker-based, supports multi-service apps |
| **AWS/GCP** | Production-grade, requires setup |

> 💡 **Recommended for hackathon**: [Railway.app](https://railway.app) — deploy frontend, backend, and Python service as separate services with one click.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Chart.js, Framer Motion |
| Backend | Node.js, Express, Multer |
| ML Engine | Python, FastAPI, NumPy, SciPy |
| Styling | Custom CSS (glassmorphism dark theme) |

---

*Built for Iotricity S3 Hackathon*
