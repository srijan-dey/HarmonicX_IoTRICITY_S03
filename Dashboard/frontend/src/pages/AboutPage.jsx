import { motion } from 'framer-motion'
import { Heart, Brain, Code2, Cpu, ExternalLink, Zap, Activity, Database } from 'lucide-react'
import './AboutPage.css'

const techStack = [
  { layer: 'Frontend', tech: 'React 18 + Vite', detail: 'Chart.js, Framer Motion, React Router', color: 'var(--primary)' },
  { layer: 'Backend', tech: 'Node.js + Express', detail: 'Multer, CSV-parse, Axios proxy, HarmonicX API', color: 'var(--warning)' },
  { layer: 'ML Engine', tech: 'Python + FastAPI', detail: 'NumPy, SciPy (R-peak, HRV, Bandpass) + Beat features', color: 'hsl(270, 80%, 65%)' },
  { layer: 'Dataset', tech: 'HarmonicX S03', detail: '60-beat MATLAB ECG segments, 60 samples/beat, 360 Hz', color: 'hsl(180, 80%, 50%)' },
  { layer: 'Styling', tech: 'Vanilla CSS', detail: 'Glassmorphism, CSS custom properties', color: 'hsl(280, 60%, 60%)' },
]

const ecgParams = [
  { name: 'Sample Frequency', value: '360 Hz', note: 'MIT-BIH standard' },
  { name: 'Duration', value: '10 sec', note: '3,600 samples per lead' },
  { name: 'Bandpass Filter', value: '0.5 – 40 Hz', note: 'Removes baseline wander & noise' },
  { name: 'R-peak Detection', value: 'Pan-Tompkins', note: 'Adapted derivative-squared method' },
  { name: 'HRV Metrics', value: 'SDNN, RMSSD', note: 'Time-domain heart rate variability' },
  { name: 'HarmonicX Features', value: 'RMS, Skewness, Kurtosis, RR', note: 'Pre-extracted from MATLAB dataset' },
]

const roadmap = [
  { status: 'done', label: 'ECG CSV upload & parsing' },
  { status: 'done', label: 'Interactive waveform visualization' },
  { status: 'done', label: 'R-peak detection & HRV analysis' },
  { status: 'done', label: 'Rule-based rhythm classification' },
  { status: 'done', label: 'Node.js ↔ Python API bridge' },
  { status: 'done', label: 'HarmonicX_IoTRICITY_S03 dataset integration' },
  { status: 'done', label: 'Beat-level feature-based AI analysis' },
  { status: 'progress', label: 'Deep learning model (CNN/LSTM) training' },
  { status: 'progress', label: 'MIT-BIH dataset training pipeline' },
  { status: 'planned', label: 'Multi-lead 12-lead ECG support' },
  { status: 'planned', label: 'PDF report generation' },
  { status: 'planned', label: 'Real-time WebSocket streaming' },
]

export default function AboutPage() {
  return (
    <main className="about-page">
      <div className="container">

        {/* Hero */}
        <motion.section
          className="about-page__hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="about-page__hero-icon">
            <Heart size={40} strokeWidth={1} />
          </div>
          <h1 className="about-page__hero-title">About CardioSense AI</h1>
          <p className="about-page__hero-sub">
            An AI-powered ECG analysis platform built for the <strong>Iotricity S3 Hackathon</strong>.
            Our goal is to democratize cardiac screening by making ECG analysis accessible,
            fast, and interpretable through modern AI.
          </p>
          <a
            href="https://github.com/Tirtha2903/IotricityS3"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <ExternalLink size={16} />
            View on GitHub
          </a>
        </motion.section>

        <div className="about-page__grid">

          {/* Tech Stack */}
          <motion.div
            className="about-page__section glass-card"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="about-page__section-title">
              <Code2 size={18} /> Tech Stack
            </h2>
            <div className="about-page__stack">
              {techStack.map((t) => (
                <div key={t.layer} className="stack-row" style={{ '--stack-color': t.color }}>
                  <div className="stack-row__layer">{t.layer}</div>
                  <div className="stack-row__main">
                    <span className="stack-row__tech">{t.tech}</span>
                    <span className="stack-row__detail">{t.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ECG Parameters */}
          <motion.div
            className="about-page__section glass-card"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="about-page__section-title">
              <Activity size={18} /> Signal Processing
            </h2>
            <div className="about-page__params">
              {ecgParams.map((p) => (
                <div key={p.name} className="param-row">
                  <div className="param-row__name">{p.name}</div>
                  <div className="param-row__right">
                    <span className="param-row__value">{p.value}</span>
                    <span className="param-row__note">{p.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Roadmap */}
          <motion.div
            className="about-page__section glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="about-page__section-title">
              <Zap size={18} /> Development Roadmap
            </h2>
            <div className="about-page__roadmap">
              {roadmap.map((item) => (
                <div key={item.label} className={`roadmap-item roadmap-item--${item.status}`}>
                  <div className="roadmap-item__dot" />
                  <span className="roadmap-item__label">{item.label}</span>
                  <span className={`badge roadmap-item__badge badge-${item.status === 'done' ? 'success' : item.status === 'progress' ? 'warning' : 'muted'}`}>
                    {item.status === 'done' ? '✓ Done' : item.status === 'progress' ? 'In Progress' : 'Planned'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ML Architecture */}
          <motion.div
            className="about-page__section glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="about-page__section-title">
              <Brain size={18} /> ML Architecture
            </h2>
            <div className="about-page__ml">
              <div className="ml-block ml-block--current">
                <div className="ml-block__label">Current</div>
                <div className="ml-block__content">
                  <strong>Signal-based Rule Classifier</strong>
                  <p>R-peak detection via Pan-Tompkins algorithm, HRV time-domain metrics, threshold-based rhythm classification</p>
                </div>
              </div>
              <div className="ml-block ml-block--planned">
                <div className="ml-block__label">Planned</div>
                <div className="ml-block__content">
                  <strong>Deep Learning Pipeline</strong>
                  <p>1D CNN or BiLSTM trained on MIT-BIH Arrhythmia Database (48 half-hour ECG recordings). Target: 5-class classification (Normal, A-Fib, PVC, PAC, Heart Block)</p>
                </div>
              </div>
              <div className="ml-block ml-block--future">
                <div className="ml-block__label">Future</div>
                <div className="ml-block__content">
                  <strong>Transformer-based ECG Foundation Model</strong>
                  <p>Pre-trained on large ECG datasets (PhysioNet, PTB-XL) with fine-tuning for specific arrhythmia classes</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Disclaimer */}
        <motion.div
          className="about-page__disclaimer glass-card"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Cpu size={18} />
          <div>
            <strong>Research & Educational Use Only</strong>
            <p>CardioSense AI is a hackathon prototype and is NOT a certified medical device. It should not be used for clinical diagnosis or to replace a qualified cardiologist's assessment. Always consult a licensed medical professional for cardiac health decisions.</p>
          </div>
        </motion.div>

      </div>
    </main>
  )
}
