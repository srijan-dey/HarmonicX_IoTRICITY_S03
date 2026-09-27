import { motion } from 'framer-motion'
import { Heart, Activity, AlertTriangle, CheckCircle, Brain, Clock } from 'lucide-react'
import './PredictionPanel.css'

const riskConfig = {
  low:      { badge: 'badge-success', label: 'Low Risk',      icon: CheckCircle,     color: 'var(--success)' },
  warning:  { badge: 'badge-warning', label: 'Moderate Risk', icon: AlertTriangle,   color: 'var(--warning)' },
  critical: { badge: 'badge-critical', label: 'High Risk',    icon: AlertTriangle,   color: 'var(--critical)' },
  unknown:  { badge: 'badge-muted',   label: 'Unknown',       icon: Activity,        color: 'var(--text-muted)' },
}

export default function PredictionPanel({ prediction, isLoading, mlStatus }) {
  if (isLoading) {
    return (
      <div className="prediction-panel glass-card">
        <div className="prediction-panel__loading">
          <div className="prediction-panel__loading-brain">
            <Brain size={40} strokeWidth={1} />
            <div className="prediction-panel__loading-ring" />
          </div>
          <p className="prediction-panel__loading-title">AI Analyzing ECG…</p>
          <p className="prediction-panel__loading-sub">Running signal processing & classification</p>
          <div className="prediction-panel__loading-steps">
            {['Filtering signal', 'Detecting R-peaks', 'Computing HRV', 'Classifying rhythm'].map((step, i) => (
              <LoadingStep key={step} label={step} delay={i * 0.4} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="prediction-panel glass-card prediction-panel--empty">
        <div className="prediction-panel__empty">
          <Brain size={48} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
          <p className="prediction-panel__empty-title">AI Analysis</p>
          <p className="prediction-panel__empty-sub">Upload and analyze an ECG to see AI predictions here.</p>
          {mlStatus && (
            <div className={`prediction-panel__ml-status ${mlStatus.online ? 'prediction-panel__ml-status--online' : 'prediction-panel__ml-status--offline'}`}>
              <div className="pulse-dot" style={{ background: mlStatus.online ? 'var(--success)' : 'var(--warning)' }} />
              {mlStatus.online ? 'ML Service Online' : 'ML Service Offline (stub mode)'}
            </div>
          )}
        </div>
      </div>
    )
  }

  const { label, confidence, riskLevel, heartRate, rrInterval, findings, message, stub } = prediction
  const risk = riskConfig[riskLevel] || riskConfig.unknown
  const RiskIcon = risk.icon

  return (
    <motion.div
      className="prediction-panel glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="prediction-panel__header">
        <div className="section-title">
          <Brain size={14} />
          AI Diagnosis
        </div>
        {stub && <span className="badge badge-muted">Stub Mode</span>}
      </div>

      {/* Main diagnosis */}
      <div className="prediction-panel__diagnosis">
        <div className="prediction-panel__rhythm-icon" style={{ '--risk-color': risk.color }}>
          <RiskIcon size={28} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="prediction-panel__label">{label}</h3>
          <div className="prediction-panel__meta">
            <span className={`badge ${risk.badge}`}>
              <RiskIcon size={10} />
              {risk.label}
            </span>
            <span className="badge badge-info">
              {Math.round(confidence * 100)}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Vitals row */}
      <div className="prediction-panel__vitals">
        <VitalCard
          icon={<Heart size={18} />}
          value={heartRate > 0 ? `${Math.round(heartRate)}` : '—'}
          unit="BPM"
          label="Heart Rate"
          color={heartRate >= 60 && heartRate <= 100 ? 'success' : 'warning'}
        />
        <VitalCard
          icon={<Activity size={18} />}
          value={rrInterval > 0 ? `${Math.round(rrInterval)}` : '—'}
          unit="ms"
          label="Mean R-R"
          color="info"
        />
        <VitalCard
          icon={<Clock size={18} />}
          value={`${Math.round(confidence * 100)}`}
          unit="%"
          label="Confidence"
          color={confidence >= 0.85 ? 'success' : 'warning'}
        />
      </div>

      {/* Findings */}
      {findings && findings.length > 0 && (
        <div className="prediction-panel__findings">
          <p className="section-title"><Activity size={13} /> Clinical Findings</p>
          <div className="prediction-panel__findings-grid">
            {findings.map((f) => (
              <FindingRow key={f.name} finding={f} />
            ))}
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="prediction-panel__message">
          <p>{message}</p>
        </div>
      )}

      {/* Disclaimer */}
      <p className="prediction-panel__disclaimer">
        ⚠️ For research purposes only. Not a medical device. Consult a cardiologist for diagnosis.
      </p>
    </motion.div>
  )
}

function VitalCard({ icon, value, unit, label, color }) {
  const colorMap = {
    success: 'var(--success)',
    warning: 'var(--warning)',
    info: 'var(--primary)',
    critical: 'var(--critical)',
  }
  return (
    <div className="vital-card" style={{ '--vital-color': colorMap[color] || colorMap.info }}>
      <div className="vital-card__icon">{icon}</div>
      <div className="vital-card__value">
        {value}<span className="vital-card__unit">{unit}</span>
      </div>
      <div className="vital-card__label">{label}</div>
    </div>
  )
}

function FindingRow({ finding }) {
  const statusMap = {
    normal:   { cls: 'finding--normal',   dot: 'var(--success)' },
    warning:  { cls: 'finding--warning',  dot: 'var(--warning)' },
    critical: { cls: 'finding--critical', dot: 'var(--critical)' },
  }
  const s = statusMap[finding.status] || statusMap.normal
  return (
    <div className={`finding ${s.cls}`}>
      <span className="finding__dot" style={{ background: s.dot }} />
      <span className="finding__name">{finding.name}</span>
      <span className="finding__value">{finding.value}</span>
    </div>
  )
}

function LoadingStep({ label, delay }) {
  return (
    <motion.div
      className="prediction-panel__step"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: [0, 1, 0.5], x: 0 }}
      transition={{ delay, duration: 0.6, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1.2 }}
    >
      <div className="prediction-panel__step-dot" />
      {label}
    </motion.div>
  )
}
