import { parse } from 'csv-parse/sync';
import fs from 'fs';

/**
 * Parse an ECG CSV file exported from MATLAB.
 * Supports:
 *  - Single column  (amplitude only)
 *  - Two columns    (time, amplitude)
 *  - Multi-lead     (time, lead1, lead2, ...)
 */
export async function parseECGFile(filePath, sampleRate = 360, maxDuration = 10) {
  const raw = fs.readFileSync(filePath, 'utf-8');

  // Auto-detect delimiter
  const delimiter = raw.includes('\t') ? '\t' : ',';

  const records = parse(raw, {
    delimiter,
    skip_empty_lines: true,
    trim: true,
    comment: '#',   // skip MATLAB comment lines starting with #
    relax_column_count: true,
  });

  if (!records || records.length === 0) {
    throw new Error('CSV file is empty or unreadable');
  }

  // Skip header row if present (non-numeric first cell)
  let dataRows = records;
  if (records[0] && isNaN(parseFloat(records[0][0]))) {
    dataRows = records.slice(1);
  }

  const maxSamples = sampleRate * maxDuration;
  const limitedRows = dataRows.slice(0, maxSamples);

  let timeAxis = [];
  let amplitudeData = [];
  let leads = [];

  const numCols = limitedRows[0] ? limitedRows[0].length : 1;

  if (numCols === 1) {
    // Single amplitude column
    amplitudeData = limitedRows.map((r, i) => {
      const v = parseFloat(r[0]);
      return isNaN(v) ? 0 : v;
    });
    timeAxis = amplitudeData.map((_, i) => parseFloat((i / sampleRate).toFixed(4)));
    leads = [{ name: 'Lead II', data: amplitudeData }];
  } else if (numCols >= 2) {
    // First column = time, rest = leads
    const firstIsTime = !isNaN(parseFloat(limitedRows[0][0]));

    if (firstIsTime) {
      timeAxis = limitedRows.map(r => parseFloat(parseFloat(r[0]).toFixed(4)));
      // All remaining columns are leads
      for (let col = 1; col < numCols; col++) {
        const leadData = limitedRows.map(r => {
          const v = parseFloat(r[col]);
          return isNaN(v) ? 0 : v;
        });
        leads.push({ name: col === 1 ? 'Lead II' : `Lead ${col}`, data: leadData });
      }
      amplitudeData = leads[0].data;
    } else {
      // Treat all as amplitude columns
      for (let col = 0; col < numCols; col++) {
        const leadData = limitedRows.map(r => {
          const v = parseFloat(r[col]);
          return isNaN(v) ? 0 : v;
        });
        leads.push({ name: `Lead ${col + 1}`, data: leadData });
      }
      amplitudeData = leads[0].data;
      timeAxis = amplitudeData.map((_, i) => parseFloat((i / sampleRate).toFixed(4)));
    }
  }

  const stats = computeStats(amplitudeData);
  const duration = timeAxis.length > 0 ? timeAxis[timeAxis.length - 1] : amplitudeData.length / sampleRate;

  return {
    sampleRate,
    duration: parseFloat(duration.toFixed(2)),
    totalSamples: amplitudeData.length,
    timeAxis,
    amplitudeData,
    leads,
    stats,
  };
}

function computeStats(samples) {
  if (!samples.length) return {};
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
