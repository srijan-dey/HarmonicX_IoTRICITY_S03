import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { parseECGFile } from '../utils/ecgParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config — only CSV files, max 20MB
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `ecg_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are accepted'));
    }
  },
});

// POST /api/ecg/upload
router.post('/upload', upload.single('ecgFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const sampleRate = parseInt(req.body.sampleRate) || 360;
    const duration = parseInt(req.body.duration) || 10;

    // Parse ECG CSV
    const parsed = await parseECGFile(req.file.path, sampleRate, duration);

    res.json({
      success: true,
      filename: req.file.originalname,
      fileId: path.basename(req.file.path, path.extname(req.file.path)),
      ...parsed,
    });
  } catch (err) {
    console.error('[ECG Upload Error]', err);
    res.status(500).json({ error: err.message || 'Failed to process ECG file' });
  }
});

// POST /api/ecg/sample — generate a demo ECG (MIT-BIH style)
router.get('/sample', (req, res) => {
  const sampleRate = 360;
  const duration = 10;
  const totalSamples = sampleRate * duration;

  // Generate realistic synthetic ECG using superimposed waves
  const samples = generateSyntheticECG(totalSamples, sampleRate);
  const timeAxis = samples.map((_, i) => parseFloat((i / sampleRate).toFixed(4)));

  const stats = computeStats(samples);

  res.json({
    success: true,
    filename: 'sample_ecg.csv',
    fileId: 'demo',
    sampleRate,
    duration,
    totalSamples,
    timeAxis,
    amplitudeData: samples,
    stats,
    leads: [{ name: 'Lead II', data: samples }],
    isSample: true,
  });
});

// ── Helpers ─────────────────────────────────────────────────
function generateSyntheticECG(totalSamples, sampleRate) {
  const data = [];
  const heartRate = 72; // BPM
  const beatPeriod = sampleRate * (60 / heartRate); // samples per beat

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const phase = (i % beatPeriod) / beatPeriod; // 0–1 within each beat

    let val = 0;
    // P wave
    val += 0.15 * Math.exp(-Math.pow((phase - 0.15) / 0.04, 2));
    // Q wave
    val -= 0.08 * Math.exp(-Math.pow((phase - 0.28) / 0.01, 2));
    // R wave (QRS complex)
    val += 1.2 * Math.exp(-Math.pow((phase - 0.31) / 0.008, 2));
    // S wave
    val -= 0.25 * Math.exp(-Math.pow((phase - 0.35) / 0.012, 2));
    // T wave
    val += 0.35 * Math.exp(-Math.pow((phase - 0.55) / 0.06, 2));
    // Baseline wander (low-freq noise)
    val += 0.02 * Math.sin(2 * Math.PI * 0.15 * t);
    // High-freq noise
    val += (Math.random() - 0.5) * 0.015;

    data.push(parseFloat(val.toFixed(5)));
  }
  return data;
}

function computeStats(samples) {
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
  const std = Math.sqrt(variance);
  return {
    min: parseFloat(min.toFixed(4)),
    max: parseFloat(max.toFixed(4)),
    mean: parseFloat(mean.toFixed(4)),
    std: parseFloat(std.toFixed(4)),
    peakToPeak: parseFloat((max - min).toFixed(4)),
  };
}

export default router;
