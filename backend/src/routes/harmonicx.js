/**
 * harmonicx.js — HarmonicX IoTRICITY S03 Dataset Routes
 * Serves beat-level ECG features and waveforms from the HarmonicX CSV.
 *
 * The CSV has columns:
 *   mean, std, min, max, range, rms, energy, skewness, kurtosis,
 *   prev_rr, next_rr, label, record, sample, ecg_0 … ecg_59
 *
 * Do NOT modify the source CSV — it is a read-only dataset from the
 * HarmonicX_IoTRICITY_S03 repository.
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const router = express.Router();

// Absolute path to HarmonicX CSV (read-only, never written to)
const HARMONICX_CSV = path.join(
  __dirname,
  '../../../HarmonicX_IoTRICITY_S03/ecg_signal.csv'
);

// ── Helpers ──────────────────────────────────────────────────

/** Parse the HarmonicX CSV once and cache it in memory */
let _cache = null;

function loadHarmonicXData() {
  if (_cache) return _cache;

  if (!fs.existsSync(HARMONICX_CSV)) {
    throw new Error(
      `HarmonicX dataset not found at: ${HARMONICX_CSV}. ` +
      'Make sure the HarmonicX_IoTRICITY_S03 folder is present.'
    );
  }

  const raw = fs.readFileSync(HARMONICX_CSV, 'utf-8');

  const records = parse(raw, {
    columns: true,          // first row is header
    skip_empty_lines: true,
    trim: true,
    cast: (value, context) => {
      // Keep label, record as strings; cast everything else to float
      if (['label', 'record'].includes(context.column)) return value;
      if (context.column === 'sample') return parseInt(value, 10);
      const n = parseFloat(value);
      return isNaN(n) ? value : n;
    },
  });

  // Build structured rows
  const beats = records.map((row, idx) => {
    // Extract the 60-sample ECG window
    const ecgWindow = [];
    for (let i = 0; i < 60; i++) {
      ecgWindow.push(row[`ecg_${i}`] ?? 0);
    }

    return {
      index: idx,
      record:   row.record,
      sample:   row.sample,
      label:    row.label,
      features: {
        mean:      row.mean,
        std:       row.std,
        min:       row.min,
        max:       row.max,
        range:     row.range,
        rms:       row.rms,
        energy:    row.energy,
        skewness:  row.skewness,
        kurtosis:  row.kurtosis,
        prev_rr:   row.prev_rr,
        next_rr:   row.next_rr,
      },
      ecgWindow, // 60 amplitude samples (one heartbeat segment)
    };
  });

  // Aggregate dataset-level statistics
  const totalBeats   = beats.length;
  const labelCounts  = {};
  const recordSet    = new Set();
  let   meanHR       = 0;

  beats.forEach(b => {
    labelCounts[b.label] = (labelCounts[b.label] || 0) + 1;
    recordSet.add(b.record);
    // approximate HR from RR interval (ms → bpm)
    if (b.features.prev_rr > 0) meanHR += 60 / b.features.prev_rr;
  });

  meanHR = totalBeats > 0 ? meanHR / totalBeats : 0;

  _cache = {
    beats,
    meta: {
      totalBeats,
      totalRecords: recordSet.size,
      records: [...recordSet],
      labelCounts,
      samplesPerBeat: 60,
      sampleRate: 360,
      estimatedAvgHR: Math.round(meanHR),
      source: 'HarmonicX_IoTRICITY_S03',
      description:
        'Beat-segmented ECG dataset generated from MATLAB. Each row is one ' +
        'heartbeat window (60 samples at 360 Hz) with pre-computed ' +
        'statistical features.',
    },
  };

  return _cache;
}

// ── Routes ───────────────────────────────────────────────────

/**
 * GET /api/harmonicx/summary
 * Returns dataset-level metadata (no raw samples for speed)
 */
router.get('/summary', (req, res) => {
  try {
    const { meta } = loadHarmonicXData();
    res.json({ success: true, ...meta });
  } catch (err) {
    console.error('[HarmonicX Summary Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/harmonicx/beats
 * Returns all beats with their features (no raw ecgWindow for list view)
 * Optional query: ?record=MATLAB_001&label=SYNTHETIC_TEST&limit=20&offset=0
 */
router.get('/beats', (req, res) => {
  try {
    const { beats } = loadHarmonicXData();
    let filtered = beats;

    if (req.query.record) {
      filtered = filtered.filter(b => b.record === req.query.record);
    }
    if (req.query.label) {
      filtered = filtered.filter(b => b.label === req.query.label);
    }

    const limit  = Math.min(parseInt(req.query.limit  || '50', 10), 200);
    const offset = parseInt(req.query.offset || '0', 10);
    const page   = filtered.slice(offset, offset + limit);

    res.json({
      success: true,
      total: filtered.length,
      offset,
      limit,
      beats: page.map(({ ecgWindow, ...rest }) => rest), // omit raw ECG for list
    });
  } catch (err) {
    console.error('[HarmonicX Beats Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/harmonicx/beat/:index
 * Returns full data for a single beat including its 60-sample ECG window.
 */
router.get('/beat/:index', (req, res) => {
  try {
    const { beats, meta } = loadHarmonicXData();
    const idx = parseInt(req.params.index, 10);

    if (isNaN(idx) || idx < 0 || idx >= beats.length) {
      return res.status(404).json({
        error: `Beat index ${idx} out of range (0–${beats.length - 1})`,
      });
    }

    const beat = beats[idx];
    const sampleRate = meta.sampleRate;

    // Build time axis: 60 samples at 360 Hz
    const timeAxis = beat.ecgWindow.map((_, i) =>
      parseFloat((i / sampleRate).toFixed(4))
    );

    res.json({
      success: true,
      beat,
      timeAxis,
      sampleRate,
    });
  } catch (err) {
    console.error('[HarmonicX Beat Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/harmonicx/waveform
 * Returns a reconstructed multi-beat waveform by concatenating N consecutive
 * beat windows (default: all beats from a record, up to 20 beats).
 * Query: ?record=MATLAB_001&maxBeats=20
 */
router.get('/waveform', (req, res) => {
  try {
    const { beats, meta } = loadHarmonicXData();
    const record   = req.query.record || beats[0]?.record;
    const maxBeats = Math.min(parseInt(req.query.maxBeats || '20', 10), 61);

    const recordBeats = beats
      .filter(b => b.record === record)
      .slice(0, maxBeats);

    if (recordBeats.length === 0) {
      return res.status(404).json({ error: `No beats found for record: ${record}` });
    }

    // Concatenate ECG windows into one signal
    const amplitudeData = recordBeats.flatMap(b => b.ecgWindow);
    const sampleRate    = meta.sampleRate;
    const timeAxis      = amplitudeData.map((_, i) =>
      parseFloat((i / sampleRate).toFixed(4))
    );

    const stats = computeStats(amplitudeData);

    res.json({
      success: true,
      filename: `harmonicx_${record}.csv`,
      fileId: `harmonicx_${record}`,
      sampleRate,
      duration: parseFloat((amplitudeData.length / sampleRate).toFixed(2)),
      totalSamples: amplitudeData.length,
      timeAxis,
      amplitudeData,
      leads: [{ name: 'Lead II (HarmonicX)', data: amplitudeData }],
      stats,
      isHarmonicX: true,
      record,
      beatsUsed: recordBeats.length,
    });
  } catch (err) {
    console.error('[HarmonicX Waveform Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/** Simple stats helper */
function computeStats(samples) {
  if (!samples.length) return {};
  const min  = Math.min(...samples);
  const max  = Math.max(...samples);
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
  return {
    min:        parseFloat(min.toFixed(4)),
    max:        parseFloat(max.toFixed(4)),
    mean:       parseFloat(mean.toFixed(4)),
    std:        parseFloat(Math.sqrt(variance).toFixed(4)),
    peakToPeak: parseFloat((max - min).toFixed(4)),
  };
}

export default router;
