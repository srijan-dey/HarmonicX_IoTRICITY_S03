import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database, Activity, Brain, ChevronRight, ChevronLeft,
  BarChart2, Zap, RefreshCw, Info, TrendingUp
} from 'lucide-react'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, RadialLinearScale
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import './DatasetPage.css'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, RadialLinearScale
)

/* ── Helpers ─────────────────────────────────────────────── */
const round = (v, d = 4) =>
  typeof v === 'number' ? parseFloat(v.toFixed(d)) : '—'

const statusColor = {
  normal:   'var(--success)',
  warning:  'var(--warning)',
  critical: 'var(--critical)',
  unknown:  'var(--text-muted)',
}

/* ── Main Page ───────────────────────────────────────────── */
export default function DatasetPage() {
  const [summary,      setSummary]      = useState(null)
  const [beats,        setBeats]        = useState([])
  const [selectedBeat, setSelectedBeat] = useState(null)
  const [beatDetail,   setBeatDetail]   = useState(null)
  const [prediction,   setPrediction]   = useState(null)
  const [waveform,     setWaveform]     = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [beatLoading,  setBeatLoading]  = useState(false)
  const [predLoading,  setPredLoading]  = useState(false)
  const [error,        setError]        = useState(null)
  const [page,         setPage]         = useState(0)
  const PAGE_SIZE = 10

  /* Load summary + beat list */
  useEffect(() => {
    setLoading(true)
    Promise.all([
      axios.get('/api/harmonicx/summary'),
      axios.get(`/api/harmonicx/beats?limit=61&offset=0`),
      axios.get('/api/harmonicx/waveform'),
    ])
      .then(([sumRes, beatsRes, waveRes]) => {
        setSummary(sumRes.data)
        setBeats(beatsRes.data.beats || [])
        setWaveform(waveRes.data)
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load HarmonicX dataset')
      })
      .finally(() => setLoading(false))
  }, [])

  /* Load full beat detail */
  const loadBeat = useCallback(async (index) => {
    setSelectedBeat(index)
    setBeatDetail(null)
    setPrediction(null)
    setBeatLoading(true)
    try {
      const res = await axios.get(`/api/harmonicx/beat/${index}`)
      setBeatDetail(res.data)
    } catch (e) {
      console.error('Beat load error', e)
    } finally {
      setBeatLoading(false)
    }
  }, [])

  /* Run ML prediction on selected beat */
  const runBeatPrediction = useCallback(async () => {
    if (!beatDetail) return
    setPredLoading(true)
    try {
      const { features, ecgWindow } = beatDetail.beat
      const res = await axios.post('/api/ml/predict-beat', {
        ...features,
        ecg_window: ecgWindow,
      })
      setPrediction(res.data.prediction)
    } catch {
      // ML offline fallback
      setPrediction({
        label: 'Normal Sinus Rhythm',
        confidence: 0.96,
        riskLevel: 'low',
        heartRate: 75,
        rrInterval: 800,
        findings: [
          { name: 'Heart Rate', value: '75 BPM', status: 'normal' },
          { name: 'RR Regularity', value: 'Regular', status: 'normal' },
        ],
        message: 'ML service offline — stub prediction.',
      })
    } finally {
      setPredLoading(false)
    }
  }, [beatDetail])

  const paginatedBeats = beats.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(beats.length / PAGE_SIZE)

  if (loading) {
    return (
      <main className="dataset-page">
        <div className="container dataset-page__loading">
          <div className="spinner" />
          <p>Loading HarmonicX dataset…</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="dataset-page">
        <div className="container">
          <div className="dataset-page__error glass-card">
            <Info size={20} />
            <div>
              <strong>Dataset unavailable</strong>
              <p>{error}</p>
              <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                Make sure the backend is running and the{' '}
                <code>HarmonicX_IoTRICITY_S03</code> folder is present.
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="dataset-page">
      <div className="container">

        {/* ── Page header ── */}
        <motion.div
          className="dataset-page__header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="dataset-page__title">
              <Database size={26} strokeWidth={1.5} />
              HarmonicX Dataset
            </h1>
            <p className="dataset-page__sub">
              Beat-segmented ECG data · IoTRICITY S03 · 60 samples/beat · 360 Hz
            </p>
          </div>
          <div className="dataset-page__badge">
            <div className="pulse-dot" />
            HarmonicX_IoTRICITY_S03
          </div>
        </motion.div>

        {/* ── Summary cards ── */}
        {summary && (
          <motion.div
            className="dataset-page__summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SummaryCard label="Total Beats"   value={summary.totalBeats}    icon={<Activity size={20}/>}  color="var(--primary)" />
            <SummaryCard label="Records"        value={summary.totalRecords}  icon={<Database size={20}/>}  color="var(--warning)" />
            <SummaryCard label="Samples/Beat"   value={summary.samplesPerBeat} icon={<Zap size={20}/>}     color="hsl(270,80%,65%)" />
            <SummaryCard label="Sample Rate"    value={`${summary.sampleRate} Hz`} icon={<TrendingUp size={20}/>} color="var(--success)" />
            <SummaryCard label="Est. Avg HR"    value={`${summary.estimatedAvgHR} BPM`} icon={<Brain size={20}/>} color="var(--accent)" />
          </motion.div>
        )}

        {/* ── Waveform view ── */}
        {waveform && (
          <motion.div
            className="dataset-page__waveform glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="dataset-page__section-header">
              <Activity size={15} />
              Reconstructed ECG Waveform ({waveform.beatsUsed} beats · {waveform.duration}s)
              <span className="badge badge-info">HarmonicX</span>
            </div>
            <WaveformChart
              timeAxis={waveform.timeAxis}
              data={waveform.amplitudeData}
              label="Lead II (HarmonicX)"
            />
          </motion.div>
        )}

        {/* ── Main grid ── */}
        <div className="dataset-page__grid">

          {/* Beat list */}
          <motion.div
            className="dataset-page__beats glass-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="dataset-page__section-header">
              <BarChart2 size={15} />
              Beat Database
              <span className="badge badge-muted">{beats.length} beats</span>
            </div>

            {/* Beat table */}
            <div className="beat-table">
              <div className="beat-table__head">
                <span>#</span>
                <span>Record</span>
                <span>Label</span>
                <span>Mean (mV)</span>
                <span>RMS</span>
                <span>Kurtosis</span>
                <span>Action</span>
              </div>
              {paginatedBeats.map((beat) => (
                <div
                  key={beat.index}
                  className={`beat-table__row ${selectedBeat === beat.index ? 'beat-table__row--active' : ''}`}
                  onClick={() => loadBeat(beat.index)}
                >
                  <span className="beat-table__idx">{beat.index + 1}</span>
                  <span className="beat-table__mono">{beat.record}</span>
                  <span>
                    <span className={`badge ${beat.label === 'SYNTHETIC_TEST' ? 'badge-muted' : 'badge-success'}`}>
                      {beat.label}
                    </span>
                  </span>
                  <span className="beat-table__mono">{round(beat.features?.mean, 4)}</span>
                  <span className="beat-table__mono">{round(beat.features?.rms, 4)}</span>
                  <span className="beat-table__mono">{round(beat.features?.kurtosis, 3)}</span>
                  <span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => { e.stopPropagation(); loadBeat(beat.index) }}
                    >
                      Inspect
                    </button>
                  </span>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="beat-table__pagination">
              <button
                className="btn btn-secondary btn-sm btn-icon"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft size={15} />
              </button>
              <span className="beat-table__page-info">
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm btn-icon"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </motion.div>

          {/* Beat detail panel */}
          <motion.div
            className="dataset-page__detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {beatLoading ? (
                <motion.div
                  key="loading"
                  className="detail-panel glass-card detail-panel--loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  <div className="spinner" />
                  <p>Loading beat…</p>
                </motion.div>
              ) : beatDetail ? (
                <motion.div
                  key={`beat-${selectedBeat}`}
                  className="detail-panel glass-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="detail-panel__header">
                    <div className="dataset-page__section-header">
                      <Activity size={14} />
                      Beat #{selectedBeat + 1} — {beatDetail.beat.record}
                    </div>
                    <span className={`badge ${beatDetail.beat.label === 'SYNTHETIC_TEST' ? 'badge-muted' : 'badge-success'}`}>
                      {beatDetail.beat.label}
                    </span>
                  </div>

                  {/* Beat waveform mini chart */}
                  <div className="detail-panel__chart">
                    <WaveformChart
                      timeAxis={beatDetail.timeAxis}
                      data={beatDetail.beat.ecgWindow}
                      label={`Beat #${selectedBeat + 1}`}
                      mini
                    />
                  </div>

                  {/* Feature grid */}
                  <div className="detail-panel__features">
                    {Object.entries(beatDetail.beat.features).map(([key, val]) => (
                      <FeatureChip key={key} name={key} value={round(val, 5)} />
                    ))}
                  </div>

                  {/* Predict button */}
                  <button
                    className="btn btn-primary detail-panel__predict-btn"
                    onClick={runBeatPrediction}
                    disabled={predLoading}
                  >
                    {predLoading
                      ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Analyzing…</>
                      : <><Brain size={15} /> Run AI Analysis</>
                    }
                  </button>

                  {/* Prediction result */}
                  <AnimatePresence>
                    {prediction && (
                      <motion.div
                        className="detail-panel__prediction"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="pred-header">
                          <span className="pred-label">{prediction.label}</span>
                          <span
                            className="badge"
                            style={{
                              background: `${statusColor[prediction.riskLevel] || statusColor.unknown}22`,
                              color: statusColor[prediction.riskLevel] || statusColor.unknown,
                              border: `1px solid ${statusColor[prediction.riskLevel] || statusColor.unknown}44`,
                            }}
                          >
                            {prediction.riskLevel}
                          </span>
                        </div>
                        <div className="pred-vitals">
                          <span>HR: <strong>{prediction.heartRate} BPM</strong></span>
                          <span>RR: <strong>{prediction.rrInterval}ms</strong></span>
                          <span>Conf: <strong>{Math.round(prediction.confidence * 100)}%</strong></span>
                        </div>
                        <div className="pred-findings">
                          {prediction.findings?.map(f => (
                            <div key={f.name} className={`pred-finding pred-finding--${f.status}`}>
                              <span className="pred-finding__dot" style={{ background: statusColor[f.status] }} />
                              <span className="pred-finding__name">{f.name}</span>
                              <span className="pred-finding__val">{f.value}</span>
                            </div>
                          ))}
                        </div>
                        <p className="pred-message">{prediction.message}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="detail-panel glass-card detail-panel--empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  <Database size={40} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
                  <p>Select a beat from the list to inspect its waveform and run AI analysis.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── Feature distribution charts ── */}
        {beats.length > 0 && (
          <motion.div
            className="dataset-page__distributions glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="dataset-page__section-header">
              <BarChart2 size={15} />
              Feature Distributions Across All Beats
            </div>
            <div className="dist-grid">
              <DistChart beats={beats} featureKey="mean"     label="Signal Mean (mV)" />
              <DistChart beats={beats} featureKey="rms"      label="RMS Amplitude (mV)" />
              <DistChart beats={beats} featureKey="skewness" label="Skewness" />
              <DistChart beats={beats} featureKey="kurtosis" label="Kurtosis" />
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="dataset-page__footer">
          <Info size={13} />
          HarmonicX_IoTRICITY_S03 dataset — Read-only. Source CSV is not modified by this application.
        </div>

      </div>
    </main>
  )
}

/* ── Sub-components ─────────────────────────────────────── */

function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="dataset-summary-card glass-card" style={{ '--card-color': color }}>
      <div className="dataset-summary-card__icon">{icon}</div>
      <div className="dataset-summary-card__value">{value}</div>
      <div className="dataset-summary-card__label">{label}</div>
    </div>
  )
}

function FeatureChip({ name, value }) {
  return (
    <div className="feature-chip">
      <span className="feature-chip__name">{name.replace('_', ' ')}</span>
      <span className="feature-chip__value">{value}</span>
    </div>
  )
}

function WaveformChart({ timeAxis, data, label, mini }) {
  const chartData = {
    labels: timeAxis,
    datasets: [{
      label,
      data,
      borderColor: 'hsl(200, 100%, 55%)',
      backgroundColor: 'hsla(200, 100%, 55%, 0.05)',
      borderWidth: mini ? 1.5 : 1.5,
      pointRadius: 0,
      tension: 0.3,
      fill: false,
    }],
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'hsl(220, 22%, 9%)',
        borderColor: 'hsla(200, 60%, 60%, 0.2)',
        borderWidth: 1,
        titleColor: 'hsl(210, 40%, 96%)',
        bodyColor: 'hsl(215, 20%, 65%)',
        callbacks: {
          title: (items) => `t = ${parseFloat(items[0].label).toFixed(3)}s`,
          label: (item)  => `${label}: ${item.raw.toFixed(4)} mV`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'hsla(200, 60%, 60%, 0.06)' },
        ticks: {
          color: 'hsl(215, 15%, 45%)',
          font: { family: 'JetBrains Mono', size: 9 },
          maxTicksLimit: mini ? 6 : 12,
          callback: (val, i) => {
            const v = timeAxis[i]
            return v !== undefined ? `${parseFloat(v).toFixed(2)}s` : ''
          },
        },
        border: { color: 'hsla(200, 60%, 60%, 0.12)' },
      },
      y: {
        grid: { color: 'hsla(200, 60%, 60%, 0.06)' },
        ticks: {
          color: 'hsl(215, 15%, 45%)',
          font: { family: 'JetBrains Mono', size: 9 },
          callback: (val) => `${val.toFixed(2)}`,
          maxTicksLimit: 5,
        },
        border: { color: 'hsla(200, 60%, 60%, 0.12)' },
      },
    },
  }

  return (
    <div style={{ height: mini ? 130 : 180 }}>
      <Line data={chartData} options={options} />
    </div>
  )
}

function DistChart({ beats, featureKey, label }) {
  const values = beats
    .map(b => b.features?.[featureKey])
    .filter(v => v != null && isFinite(v))

  if (values.length === 0) return null

  // Create 10-bin histogram
  const min = Math.min(...values)
  const max = Math.max(...values)
  const binCount = 10
  const binSize = (max - min) / binCount || 1
  const bins = Array(binCount).fill(0)
  const binLabels = []

  values.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1)
    bins[idx]++
  })
  for (let i = 0; i < binCount; i++) {
    binLabels.push(`${(min + i * binSize).toFixed(2)}`)
  }

  const chartData = {
    labels: binLabels,
    datasets: [{
      label,
      data: bins,
      backgroundColor: 'hsla(200, 100%, 55%, 0.35)',
      borderColor: 'hsl(200, 100%, 55%)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'hsl(220, 22%, 9%)',
        bodyColor: 'hsl(215, 20%, 65%)',
        callbacks: { label: (item) => `Count: ${item.raw}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: 'hsl(215, 15%, 45%)',
          font: { family: 'JetBrains Mono', size: 9 },
          maxTicksLimit: 5,
        },
        border: { color: 'hsla(200, 60%, 60%, 0.12)' },
      },
      y: {
        grid: { color: 'hsla(200, 60%, 60%, 0.06)' },
        ticks: {
          color: 'hsl(215, 15%, 45%)',
          font: { family: 'JetBrains Mono', size: 9 },
        },
        border: { color: 'hsla(200, 60%, 60%, 0.12)' },
      },
    },
  }

  return (
    <div className="dist-chart-wrap">
      <p className="dist-chart-label">{label}</p>
      <div style={{ height: 140 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
