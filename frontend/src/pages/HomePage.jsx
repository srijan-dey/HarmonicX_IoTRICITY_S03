import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Brain, Shield, Zap, Upload, ChevronRight, Heart, Cpu, FileText } from 'lucide-react'
import './HomePage.css'

const features = [
  {
    icon: <Upload size={24} strokeWidth={1.5} />,
    title: 'MATLAB CSV Import',
    desc: 'Upload ECG data directly from MATLAB exports. Supports single and multi-lead formats at 360 Hz.',
    color: 'var(--primary)',
  },
  {
    icon: <Activity size={24} strokeWidth={1.5} />,
    title: 'Real-Time Waveform',
    desc: 'Interactive ECG visualization with zoom, pan, lead switching, and medical-paper grid overlay.',
    color: 'var(--accent)',
  },
  {
    icon: <Brain size={24} strokeWidth={1.5} />,
    title: 'AI Arrhythmia Detection',
    desc: 'Deep learning–powered rhythm classification trained on MIT-BIH dataset. Detects 5+ arrhythmia types.',
    color: 'hsl(270, 80%, 65%)',
  },
  {
    icon: <Shield size={24} strokeWidth={1.5} />,
    title: 'Clinical Metrics',
    desc: 'Computes PR interval, QRS duration, QT interval, HRV indices, and R-R regularity automatically.',
    color: 'var(--success)',
  },
  {
    icon: <Zap size={24} strokeWidth={1.5} />,
    title: 'Fast Inference',
    desc: 'Python FastAPI ML service delivers inference in under 500ms with full signal preprocessing pipeline.',
    color: 'var(--warning)',
  },
  {
    icon: <FileText size={24} strokeWidth={1.5} />,
    title: 'Export Reports',
    desc: 'Download annotated ECG charts as PNG. JSON output ready for EHR integration.',
    color: 'hsl(180, 80%, 50%)',
  },
]

const stats = [
  { value: '360', unit: 'Hz', label: 'Sample Rate' },
  { value: '10', unit: 'sec', label: 'Analysis Window' },
  { value: '94%', unit: '', label: 'Accuracy (dev)' },
  { value: '<500', unit: 'ms', label: 'Inference Time' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <main className="home">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="home__hero">
        {/* Ambient glow */}
        <div className="home__glow home__glow--left" aria-hidden="true" />
        <div className="home__glow home__glow--right" aria-hidden="true" />

        <div className="container">
          <motion.div
            className="home__hero-content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Pill badge */}
            <motion.div
              className="home__hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="pulse-dot" />
              Iotricity S3 Hackathon Project
            </motion.div>

            <h1 className="home__hero-title">
              AI-Powered
              <br />
              <span className="home__hero-gradient">ECG Analysis</span>
            </h1>

            <p className="home__hero-sub">
              Upload your MATLAB ECG CSV, visualize the waveform in clinical detail,
              and let our deep learning engine detect arrhythmias in real time.
            </p>

            <div className="home__hero-actions">
              <motion.button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/analyze')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Upload size={18} />
                Start Analyzing
              </motion.button>
              <motion.button
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/about')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Learn More
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>

          {/* Hero ECG preview */}
          <motion.div
            className="home__hero-visual"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <HeroECGPreview />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="home__stats">
        <div className="container">
          <div className="home__stats-grid">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="stat-value">
                  {s.value}<span className="home__stat-unit">{s.unit}</span>
                </div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="home__features">
        <div className="container">
          <motion.div
            className="home__section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="home__section-label">Capabilities</span>
            <h2 className="home__section-title">Built for cardiac precision</h2>
            <p className="home__section-sub">
              A full-stack AI platform combining clinical ECG processing with modern deep learning.
            </p>
          </motion.div>

          <div className="home__features-grid">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="feature-card glass-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                style={{ '--feat-color': f.color }}
              >
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ──────────────────────────────────────── */}
      <section className="home__arch">
        <div className="container">
          <motion.div
            className="home__arch-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="home__arch-header">
              <Cpu size={18} />
              System Architecture
            </div>
            <div className="home__arch-flow">
              <ArchNode icon={<FileText size={20} />} label="MATLAB CSV" sub="ECG Data" color="var(--text-muted)" />
              <ArchArrow />
              <ArchNode icon={<Upload size={20} />} label="React Frontend" sub="Vite + Chart.js" color="var(--primary)" />
              <ArchArrow />
              <ArchNode icon={<Heart size={20} />} label="Node.js API" sub="Express Gateway" color="var(--warning)" />
              <ArchArrow />
              <ArchNode icon={<Brain size={20} />} label="Python ML" sub="FastAPI + SciPy" color="hsl(270, 80%, 65%)" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="home__cta">
        <div className="container">
          <motion.div
            className="home__cta-card glass-card"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="home__cta-glow" aria-hidden="true" />
            <h2 className="home__cta-title">Ready to analyze your ECG?</h2>
            <p className="home__cta-sub">
              Upload your MATLAB CSV and get AI-powered insights in seconds.
            </p>
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/analyze')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Upload size={18} />
              Open Analysis Tool
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home__footer">
        <p>© 2024 CardioSense AI · Built for Iotricity S3 Hackathon · Not a medical device</p>
      </footer>
    </main>
  )
}

/* ── Sub-components ─────────────────────────────────────── */

function HeroECGPreview() {
  const path = "M0,50 L40,50 L55,20 L65,80 L75,35 L85,65 L95,50 L140,50 L155,20 L165,80 L175,35 L185,65 L195,50 L240,50"

  return (
    <div className="hero-ecg">
      <div className="hero-ecg__card glass-card">
        <div className="hero-ecg__header">
          <div className="hero-ecg__dot" />
          <span>Lead II · 360Hz · Live Preview</span>
        </div>
        <div className="hero-ecg__canvas">
          <svg viewBox="0 0 240 100" preserveAspectRatio="none" className="hero-ecg__svg">
            {/* Medical grid */}
            <defs>
              <pattern id="minor" width="12" height="10" patternUnits="userSpaceOnUse">
                <path d="M12 0L0 0 0 10" fill="none" stroke="hsla(355, 80%, 50%, 0.08)" strokeWidth="0.5"/>
              </pattern>
              <pattern id="major" width="60" height="50" patternUnits="userSpaceOnUse">
                <rect width="60" height="50" fill="url(#minor)"/>
                <path d="M60 0L0 0 0 50" fill="none" stroke="hsla(355, 80%, 50%, 0.15)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="240" height="100" fill="url(#major)" />
            {/* ECG line */}
            <path
              d={path}
              fill="none"
              stroke="hsl(200, 100%, 55%)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="600"
              style={{ animation: 'ecg-draw 2.5s ease-in-out infinite' }}
            />
          </svg>
          <style>{`
            @keyframes ecg-draw {
              0% { stroke-dashoffset: 600; opacity: 0.7; }
              60% { stroke-dashoffset: 0; opacity: 1; }
              100% { stroke-dashoffset: -100; opacity: 0.7; }
            }
          `}</style>
        </div>
        <div className="hero-ecg__footer">
          <div className="hero-ecg__stat">
            <span className="hero-ecg__stat-val">72</span>
            <span className="hero-ecg__stat-label">BPM</span>
          </div>
          <div className="hero-ecg__stat">
            <span className="hero-ecg__stat-val badge badge-success">Normal SR</span>
          </div>
          <div className="hero-ecg__stat">
            <span className="hero-ecg__stat-val">94%</span>
            <span className="hero-ecg__stat-label">Confidence</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArchNode({ icon, label, sub, color }) {
  return (
    <div className="arch-node" style={{ '--arch-color': color }}>
      <div className="arch-node__icon">{icon}</div>
      <div className="arch-node__label">{label}</div>
      <div className="arch-node__sub">{sub}</div>
    </div>
  )
}

function ArchArrow() {
  return (
    <div className="arch-arrow">
      <div className="arch-arrow__line" />
      <ChevronRight size={16} className="arch-arrow__icon" />
    </div>
  )
}
