# 🫀 CardioSense AI

**A full-stack, AI-powered platform for clinical ECG analysis and real-time arrhythmia detection.** Built for the **IoTRICITY S3 Hackathon**.

CardioSense AI bridges the gap between raw medical sensor data (like MATLAB CSV exports) and actionable clinical insights. It features an interactive, high-performance web interface for visualizing ECG waveforms, a Node.js API gateway, and a Python-based Machine Learning inference engine.

This repository integrates the **HarmonicX_IoTRICITY_S03** beat dataset to provide pre-extracted feature analysis directly within the web app.

---

## 🌟 Key Features

- **MATLAB CSV Import:** Directly upload `.csv` ECG signals (single or multi-lead) collected from hardware sensors or MATLAB exports at 360 Hz.
- **Interactive Medical Waveform Viewer:** High-performance charting using `Chart.js` with medical-grade paper grid styling, zooming, and panning.
- **AI Arrhythmia Detection:** A dedicated Python FastAPI backend that processes signals, detects R-peaks, calculates Heart Rate Variability (HRV), and categorizes risks using pre-extracted feature sets.
- **HarmonicX Dataset Explorer:** A built-in dataset browser (IoTRICITY S03) that visualizes pre-segmented 60-sample heartbeats alongside statistical features (RMS, Kurtosis, Skewness, etc.) and allows per-beat AI analysis.
- **Microservices Architecture:** Clean separation of concerns across a React frontend, Node.js data gateway, and a Python ML service.

---

## 🏗️ Architecture Stack

1. **Frontend (`/frontend`)**
   - **React 18 & Vite:** Fast, modern UI development.
   - **Chart.js & React-Chartjs-2:** High-fidelity waveform rendering.
   - **Framer Motion:** Micro-animations and page transitions.
   - **Lucide React:** Clean, consistent iconography.

2. **Backend Gateway (`/backend`)**
   - **Node.js & Express:** Handles file uploads (Multer), parses large CSVs synchronously (`csv-parse`), and serves the HarmonicX database.
   - **Proxy:** Forwards ML computation requests to the Python service.

3. **Machine Learning Service (`/ml`)**
   - **Python 3 & FastAPI:** Ultra-fast API for mathematical and ML processing.
   - **SciPy & NumPy:** Used for Butterworth bandpass filtering (removing baseline wander) and Pan-Tompkins style R-peak detection.
   - **Prediction Engine:** Computes signal statistics (HR, PR interval, QRS duration) and classifies rhythms.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.9 or higher)
- **Git**

### 1. Clone the Repository
Because this repository relies on a submodule (`HarmonicX_IoTRICITY_S03`), you should clone it recursively:
```bash
git clone --recursive https://github.com/Tirtha2903/IotricityS3.git
cd IotricityS3
```
*(If you already cloned it without the submodule, run `git submodule update --init --recursive`)*

### 2. Install Dependencies
You need to install dependencies for all three services.

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

**ML Service:**
```bash
cd ml
pip install fastapi uvicorn numpy scipy pydantic python-multipart
cd ..
```

### 3. Run the Application
For Windows users, we provide a convenient launcher script that starts all three servers simultaneously in separate command prompts.

```cmd
start.bat
```

**If you prefer to start them manually:**
- **Backend:** `cd backend && npm run dev` (Runs on http://localhost:5000)
- **ML Engine:** `cd ml && python main.py` (Runs on http://localhost:8000)
- **Frontend:** `cd frontend && npm run dev` (Runs on http://localhost:5173)

---

## 🧠 Using the Application

1. **Analysis Page (`/analyze`)**
   - Drag and drop an ECG `.csv` file (or use the built-in Synthetic Sinus Rhythm demo).
   - Alternatively, load the reconstructed ECG signal directly from the HarmonicX dataset.
   - The platform will render the waveform and immediately hit the ML engine to generate a diagnostic report.

2. **Dataset Explorer (`/dataset`)**
   - Browse individual 60-sample beats from the HarmonicX IoTRICITY S03 dataset.
   - Inspect specific beat features (mean, std, range, kurtosis) and visually compare them in histograms.
   - Run localized AI inference on individual beats without full-signal R-peak detection.

---

## 🔗 APIs & Endpoints

### Node.js Gateway
- `GET /api/health` - Check backend status
- `POST /api/ecg/upload` - Upload and parse a raw `.csv` ECG signal
- `GET /api/harmonicx/summary` - Metadata and statistics for the dataset
- `GET /api/harmonicx/waveform` - Reconstructs a full signal from dataset beats

### Python ML Service
- `GET /health` - Check ML engine status
- `POST /predict` - Accepts raw signal arrays and returns clinical parameters, HRV, and rhythm classification
- `POST /predict/beat` - Accepts statistical features of a single beat and returns localized classification

---

## 📜 License
Developed for the IoTRICITY S3 Hackathon.
**Note:** This is a conceptual prototype and is **not intended for medical diagnosis.**
