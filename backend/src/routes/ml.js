import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// POST /api/ml/predict — forward ECG data to Python ML service
router.post('/predict', async (req, res) => {
  try {
    const { amplitudeData, sampleRate, fileId } = req.body;

    if (!amplitudeData || !Array.isArray(amplitudeData)) {
      return res.status(400).json({ error: 'amplitudeData array required' });
    }

    // Try to reach the Python ML service
    const response = await axios.post(`${ML_URL}/predict`, {
      signal: amplitudeData,
      sample_rate: sampleRate || 360,
      file_id: fileId,
    }, { timeout: 30000 });

    res.json(response.data);
  } catch (err) {
    // If ML service is not running, return a stubbed response
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      console.warn('[ML] Python service unavailable — returning stub prediction');
      return res.json({
        success: true,
        stub: true,
        prediction: {
          label: 'Normal Sinus Rhythm',
          confidence: 0.94,
          riskLevel: 'low',
          heartRate: 72,
          rrInterval: 833,
          findings: [
            { name: 'PR Interval', value: '160ms', status: 'normal' },
            { name: 'QRS Duration', value: '88ms', status: 'normal' },
            { name: 'QT Interval', value: '380ms', status: 'normal' },
            { name: 'ST Segment', value: 'Isoelectric', status: 'normal' },
          ],
          message: 'No significant arrhythmia detected. ML service is offline — this is a stub response.',
        },
      });
    }
    console.error('[ML Route Error]', err.message);
    res.status(500).json({ error: 'Prediction failed: ' + err.message });
  }
});

// GET /api/ml/status — check if ML service is online
router.get('/status', async (req, res) => {
  try {
    const response = await axios.get(`${ML_URL}/health`, { timeout: 3000 });
    res.json({ online: true, ...response.data });
  } catch {
    res.json({ online: false, message: 'ML service offline — predictions will use stub responses' });
  }
});

export default router;
