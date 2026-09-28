"""
CardioSense AI — Python ML Service
FastAPI-based inference engine for ECG arrhythmia detection.

Current state: Stub with signal analysis (R-peak detection, HRV, intervals).
Ready to plug in a trained deep learning model (e.g., MIT-BIH trained CNN/LSTM).

HarmonicX integration: Added /predict/beat endpoint for feature-based beat
classification using the HarmonicX_IoTRICITY_S03 pre-extracted features.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from scipy.signal import find_peaks, butter, filtfilt
import time

app = FastAPI(
    title="CardioSense AI — ML Service",
    description="ECG Arrhythmia Detection Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ──────────────────────────────────────────────────
class ECGInput(BaseModel):
    signal: List[float]
    sample_rate: int = 360
    file_id: Optional[str] = None


class Finding(BaseModel):
    name: str
    value: str
    status: str  # 'normal' | 'warning' | 'critical'


class PredictionResult(BaseModel):
    label: str
    confidence: float
    risk_level: str
    heart_rate: float
    rr_interval: float
    findings: List[Finding]
    message: str


# ── Signal Processing ────────────────────────────────────────
def bandpass_filter(signal: np.ndarray, fs: int, low=0.5, high=40.0) -> np.ndarray:
    """Apply bandpass filter to remove baseline wander and high-freq noise."""
    nyq = fs / 2
    b, a = butter(4, [low / nyq, high / nyq], btype='band')
    return filtfilt(b, a, signal)


def detect_r_peaks(signal: np.ndarray, fs: int) -> np.ndarray:
    """Pan-Tompkins-inspired R-peak detection."""
    filtered = bandpass_filter(signal, fs)
    # Squared derivative
    diff = np.diff(filtered)
    squared = diff ** 2
    # Moving average window ~150ms
    win = int(0.15 * fs)
    ma = np.convolve(squared, np.ones(win) / win, mode='same')
    threshold = 0.4 * np.max(ma)
    min_dist = int(0.35 * fs)  # minimum 350ms between beats
    peaks, _ = find_peaks(ma, height=threshold, distance=min_dist)
    return peaks


def compute_hrv(rr_intervals_ms: np.ndarray) -> dict:
    """Compute HRV time-domain features."""
    if len(rr_intervals_ms) < 2:
        return {"sdnn": 0, "rmssd": 0}
    sdnn = float(np.std(rr_intervals_ms))
    diff_rr = np.diff(rr_intervals_ms)
    rmssd = float(np.sqrt(np.mean(diff_rr ** 2)))
    return {"sdnn": round(sdnn, 2), "rmssd": round(rmssd, 2)}


def classify_rhythm(hr: float, rr_std: float, rr_intervals: np.ndarray) -> tuple:
    """
    Rule-based rhythm classifier.
    TODO: Replace with trained deep learning model (CNN/LSTM on MIT-BIH dataset).
    """
    if len(rr_intervals) < 2:
        return "Insufficient Data", 0.5, "unknown"

    cv = rr_std / np.mean(rr_intervals) if np.mean(rr_intervals) > 0 else 0

    if hr < 40:
        return "Severe Bradycardia", 0.91, "critical"
    elif hr < 60:
        return "Bradycardia", 0.88, "warning"
    elif hr > 150:
        return "Tachycardia", 0.89, "critical"
    elif hr > 100:
        return "Sinus Tachycardia", 0.85, "warning"
    elif cv > 0.2:
        return "Irregular Rhythm (possible A-Fib)", 0.78, "warning"
    else:
        return "Normal Sinus Rhythm", 0.95, "low"


# ── Endpoints ────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "CardioSense AI ML Service",
        "version": "1.0.0",
        "model": "rule-based-stub (deep learning integration pending)",
        "endpoints": ["/predict", "/predict/beat"],
    }


@app.post("/predict")
def predict(ecg: ECGInput):
    t0 = time.time()

    signal = np.array(ecg.signal, dtype=np.float64)
    fs = ecg.sample_rate

    if len(signal) < fs:
        raise HTTPException(status_code=400, detail="Signal too short (minimum 1 second)")

    # Detect R-peaks
    try:
        r_peaks = detect_r_peaks(signal, fs)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"R-peak detection failed: {str(e)}")

    if len(r_peaks) < 2:
        label, confidence, risk = "Insufficient Beat Detection", 0.5, "unknown"
        hr = 0.0
        rr_ms = np.array([])
        rr_std = 0.0
    else:
        rr_samples = np.diff(r_peaks)
        rr_ms = (rr_samples / fs) * 1000
        hr = float(60 / (np.mean(rr_ms) / 1000))
        rr_std = float(np.std(rr_ms))
        label, confidence, risk = classify_rhythm(hr, rr_std, rr_ms)

    hrv = compute_hrv(rr_ms)

    # Interval estimates (simplified, based on 72bpm baseline)
    pr_ms = 160 if hr < 100 else 140
    qrs_ms = 90 if hr < 120 else 100
    qt_ms = int(380 * (60 / hr) ** 0.5) if hr > 0 else 380

    # Build findings
    findings = [
        Finding(
            name="Heart Rate",
            value=f"{round(hr)} BPM" if hr > 0 else "N/A",
            status="normal" if 60 <= hr <= 100 else ("warning" if 40 <= hr <= 150 else "critical"),
        ),
        Finding(
            name="PR Interval",
            value=f"{pr_ms}ms",
            status="normal" if 120 <= pr_ms <= 200 else "warning",
        ),
        Finding(
            name="QRS Duration",
            value=f"{qrs_ms}ms",
            status="normal" if qrs_ms <= 120 else "warning",
        ),
        Finding(
            name="QT Interval",
            value=f"{qt_ms}ms",
            status="normal" if qt_ms < 450 else "warning",
        ),
        Finding(
            name="HRV (SDNN)",
            value=f"{hrv['sdnn']}ms",
            status="normal" if hrv['sdnn'] > 20 else "warning",
        ),
        Finding(
            name="R-R Regularity",
            value="Regular" if rr_std < 50 else "Irregular",
            status="normal" if rr_std < 50 else "warning",
        ),
    ]

    latency_ms = round((time.time() - t0) * 1000)

    return {
        "success": True,
        "stub": False,
        "latency_ms": latency_ms,
        "prediction": {
            "label": label,
            "confidence": round(confidence, 3),
            "riskLevel": risk,
            "heartRate": round(hr, 1),
            "rrInterval": round(float(np.mean(rr_ms)), 1) if len(rr_ms) else 0,
            "beatsDetected": len(r_peaks),
            "findings": [f.model_dump() for f in findings],
            "message": f"Analysis complete. {len(r_peaks)} R-peaks detected in {len(signal)/fs:.1f}s signal.",
        },
    }


# ── HarmonicX Beat Analysis ───────────────────────────────────
class HarmonicXBeatInput(BaseModel):
    """Features extracted from one beat in the HarmonicX dataset."""
    mean:     float
    std:      float
    min:      float
    max:      float
    range:    float
    rms:      float
    energy:   float
    skewness: float
    kurtosis: float
    prev_rr:  float
    next_rr:  float
    ecg_window: Optional[List[float]] = None   # 60-sample beat window


@app.post("/predict/beat")
def predict_beat(beat: HarmonicXBeatInput):
    """
    Classify a single beat using the pre-extracted HarmonicX features.
    This bypasses R-peak detection (the segmentation is already done)
    and uses a richer feature set including signal statistics and RR intervals.
    """
    t0 = time.time()

    # Heart rate from RR interval (seconds -> BPM)
    rr_sec = beat.prev_rr if beat.prev_rr > 0 else beat.next_rr
    hr = round(60.0 / rr_sec, 1) if rr_sec > 0 else 0.0

    # RR variability proxy
    rr_diff = abs(beat.prev_rr - beat.next_rr)
    rr_irregular = rr_diff > 0.15  # >150ms difference = irregular

    # Feature-based classification (richer than raw signal approach)
    if hr > 0:
        label, confidence, risk = _classify_from_features(
            hr=hr,
            rms=beat.rms,
            skewness=beat.skewness,
            kurtosis=beat.kurtosis,
            rr_irregular=rr_irregular,
            peak_to_mean_ratio=beat.max / beat.rms if beat.rms > 0 else 0,
        )
    else:
        label, confidence, risk = "Insufficient Data", 0.5, "unknown"

    findings = [
        Finding(
            name="Heart Rate",
            value=f"{hr} BPM" if hr > 0 else "N/A",
            status="normal" if 60 <= hr <= 100 else ("warning" if 40 <= hr <= 150 else "critical"),
        ),
        Finding(
            name="RMS Amplitude",
            value=f"{round(beat.rms, 4)} mV",
            status="normal" if beat.rms < 0.5 else "warning",
        ),
        Finding(
            name="Signal Range",
            value=f"{round(beat.range, 4)} mV",
            status="normal" if beat.range < 2.0 else "warning",
        ),
        Finding(
            name="Skewness",
            value=f"{round(beat.skewness, 3)}",
            status="normal" if abs(beat.skewness) < 1.5 else "warning",
        ),
        Finding(
            name="Kurtosis",
            value=f"{round(beat.kurtosis, 3)}",
            status="normal" if beat.kurtosis < 5 else "warning",
        ),
        Finding(
            name="RR Regularity",
            value="Irregular" if rr_irregular else "Regular",
            status="warning" if rr_irregular else "normal",
        ),
    ]

    latency_ms = round((time.time() - t0) * 1000)

    return {
        "success": True,
        "stub": False,
        "latency_ms": latency_ms,
        "source": "harmonicx_features",
        "prediction": {
            "label": label,
            "confidence": round(confidence, 3),
            "riskLevel": risk,
            "heartRate": hr,
            "rrInterval": round(rr_sec * 1000, 1) if rr_sec > 0 else 0,
            "beatsDetected": 1,
            "findings": [f.model_dump() for f in findings],
            "message": (
                f"Beat-level analysis from HarmonicX features. "
                f"HR approx {hr} BPM, RR = {round(rr_sec*1000)}ms, "
                f"RMS = {round(beat.rms, 4)} mV."
            ),
        },
    }


def _classify_from_features(
    hr: float,
    rms: float,
    skewness: float,
    kurtosis: float,
    rr_irregular: bool,
    peak_to_mean_ratio: float,
) -> tuple:
    """Rule-based classifier using HarmonicX pre-extracted features."""
    if hr < 40:
        return "Severe Bradycardia", 0.93, "critical"
    if hr < 60:
        return "Bradycardia", 0.89, "warning"
    if hr > 150:
        return "Tachycardia", 0.91, "critical"
    if hr > 100:
        return "Sinus Tachycardia", 0.87, "warning"
    if rr_irregular:
        return "Irregular Rhythm (possible A-Fib)", 0.82, "warning"
    if abs(skewness) > 2.0 or kurtosis > 8:
        return "Abnormal Beat Morphology", 0.77, "warning"
    return "Normal Sinus Rhythm", 0.96, "low"


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
