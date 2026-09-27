import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Brain, RefreshCw, Sliders, Info } from 'lucide-react'
import axios from 'axios'
import UploadZone from '../components/UploadZone'
import ECGChart from '../components/ECGChart'
import PredictionPanel from '../components/PredictionPanel'
import './AnalysisPage.css'

export default function AnalysisPage() {
  const [ecgData, setEcgData] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isPredicting, setIsPredicting] = useState(false)
  const [error, setError] = useState(null)
  const [mlStatus, setMlStatus] = useState(null)

  // Settings
  const [sampleRate] = useState(360)
  const [duration] = useState(10)

  // Check ML status on mount
  useEffect(() => {
    axios.get('/api/ml/status')
      .then(r => setMlStatus(r.data))
      .catch(() => setMlStatus({ online: false }))
  }, [])

  const handleUpload = async (file) => {
    setError(null)
    setEcgData(null)
    setPrediction(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('ecgFile', file)
      formData.append('sampleRate', sampleRate)
      formData.append('duration', duration)

      const response = await axios.post('/api/ecg/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setEcgData(response.data)
      // Auto-trigger prediction
      await runPrediction(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please check your CSV file.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSampleECG = async () => {
    setError(null)
    setEcgData(null)
    setPrediction(null)
    setIsUploading(true)
    try {
      const response = await axios.get('/api/ecg/sample')
      setEcgData(response.data)
      await runPrediction(response.data)
    } catch (err) {
      setError('Failed to load sample ECG')
    } finally {
      setIsUploading(false)
    }
  }

  const runPrediction = async (data) => {
    setIsPredicting(true)
    try {
      const response = await axios.post('/api/ml/predict', {
        amplitudeData: data.amplitudeData,
        sampleRate: data.sampleRate,
        fileId: data.fileId,
      })
      setPrediction(response.data.prediction)
    } catch (err) {
      console.error('Prediction error:', err)
      // Non-fatal — just show no prediction
    } finally {
      setIsPredicting(false)
    }
  }

  const handleReset = () => {
    setEcgData(null)
    setPrediction(null)
    setError(null)
  }

  return (
    <main className="analysis-page">
      <div className="container">
        {/* Page header */}
        <motion.div
          className="analysis-page__header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="analysis-page__title">
              <Activity size={28} strokeWidth={1.5} />
              ECG Analysis
            </h1>
            <p className="analysis-page__sub">
              Upload your MATLAB CSV · 360 Hz · 10 sec · AI-powered diagnosis
            </p>
          </div>
          <div className="analysis-page__header-actions">
            {mlStatus && (
              <div className={`analysis-page__ml-badge ${mlStatus.online ? 'ml-online' : 'ml-offline'}`}>
                <div className="pulse-dot" style={{ background: mlStatus.online ? 'var(--success)' : 'var(--warning)' }} />
                {mlStatus.online ? 'ML Online' : 'ML Offline'}
              </div>
            )}
            {ecgData && (
              <button className="btn btn-secondary btn-sm" onClick={handleReset}>
                <RefreshCw size={14} />
                Reset
              </button>
            )}
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="analysis-page__error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Info size={16} />
              {error}
              <button onClick={() => setError(null)} className="analysis-page__error-close">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main layout */}
        <div className="analysis-page__layout">
          {/* Left column — upload + chart */}
          <div className="analysis-page__left">
            <AnimatePresence mode="wait">
              {!ecgData ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Upload card */}
                  <div className="analysis-page__upload-card glass-card">
                    <div className="section-title">
                      <Sliders size={13} />
                      Signal Parameters
                    </div>
                    <div className="analysis-page__params">
                      <ParamChip label="Sample Rate" value="360 Hz" />
                      <ParamChip label="Duration" value="10 sec" />
                      <ParamChip label="Format" value="CSV" />
                      <ParamChip label="Leads" value="1–12" />
                    </div>

                    <UploadZone onUpload={handleUpload} isLoading={isUploading} />

                    <div className="analysis-page__divider">
                      <span>or</span>
                    </div>

                    <button
                      className="btn btn-secondary analysis-page__sample-btn"
                      onClick={handleSampleECG}
                      disabled={isUploading}
                    >
                      <Activity size={16} />
                      Load Demo ECG (Synthetic Sinus Rhythm)
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* ECG Info bar */}
                  <div className="analysis-page__ecg-info glass-card">
                    <div className="analysis-page__ecg-info-left">
                      <div className="analysis-page__ecg-dot" />
                      <span className="analysis-page__ecg-filename">{ecgData.filename}</span>
                      {ecgData.isSample && <span className="badge badge-muted">Demo</span>}
                    </div>
                    <div className="analysis-page__ecg-chips">
                      <ParamChip label="Rate" value={`${ecgData.sampleRate} Hz`} small />
                      <ParamChip label="Duration" value={`${ecgData.duration}s`} small />
                      <ParamChip label="Samples" value={ecgData.totalSamples?.toLocaleString()} small />
                      <ParamChip label="Leads" value={ecgData.leads?.length || 1} small />
                    </div>
                  </div>

                  {/* ECG Chart */}
                  <ECGChart ecgData={ecgData} />

                  {/* Stats grid */}
                  <div className="analysis-page__stats-grid">
                    <StatMini label="Min" value={ecgData.stats?.min} unit="mV" />
                    <StatMini label="Max" value={ecgData.stats?.max} unit="mV" />
                    <StatMini label="Mean" value={ecgData.stats?.mean} unit="mV" />
                    <StatMini label="Std Dev" value={ecgData.stats?.std} unit="mV" />
                    <StatMini label="Peak-to-Peak" value={ecgData.stats?.peakToPeak} unit="mV" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right column — prediction */}
          <div className="analysis-page__right">
            <PredictionPanel
              prediction={prediction}
              isLoading={isPredicting}
              mlStatus={mlStatus}
            />

            {/* Re-analyze button */}
            {ecgData && !isPredicting && (
              <motion.button
                className="btn btn-secondary analysis-page__reanalyze"
                onClick={() => runPrediction(ecgData)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Brain size={15} />
                Re-run Analysis
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function ParamChip({ label, value, small }) {
  return (
    <div className={`param-chip ${small ? 'param-chip--small' : ''}`}>
      <span className="param-chip__label">{label}</span>
      <span className="param-chip__value">{value}</span>
    </div>
  )
}

function StatMini({ label, value, unit }) {
  return (
    <div className="stat-mini glass-card">
      <span className="stat-mini__value">{value}</span>
      <span className="stat-mini__unit">{unit}</span>
      <span className="stat-mini__label">{label}</span>
    </div>
  )
}
