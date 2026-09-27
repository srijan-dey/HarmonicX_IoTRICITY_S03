import { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { ZoomIn, ZoomOut, RotateCcw, Download, Maximize2 } from 'lucide-react'
import './ECGChart.css'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
)

const COLORS = [
  'hsl(200, 100%, 55%)',
  'hsl(355, 90%, 58%)',
  'hsl(158, 80%, 45%)',
  'hsl(38, 95%, 55%)',
]

export default function ECGChart({ ecgData }) {
  const [activeLead, setActiveLead] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [viewStart, setViewStart] = useState(0) // 0-1 fraction
  const chartRef = useRef(null)

  if (!ecgData) return null

  const leads = ecgData.leads || [{ name: 'Lead II', data: ecgData.amplitudeData }]
  const lead = leads[activeLead] || leads[0]
  const sampleRate = ecgData.sampleRate || 360
  const totalSamples = lead.data.length

  // Windowed view
  const windowSize = Math.min(totalSamples, Math.floor(totalSamples / zoom))
  const startIdx = Math.floor(viewStart * (totalSamples - windowSize))
  const endIdx = startIdx + windowSize

  const displayData = lead.data.slice(startIdx, endIdx)
  const displayTime = ecgData.timeAxis
    ? ecgData.timeAxis.slice(startIdx, endIdx)
    : displayData.map((_, i) => ((startIdx + i) / sampleRate).toFixed(3))

  // Downsample for performance if > 2000 points
  const MAX_POINTS = 2000
  const step = Math.max(1, Math.floor(displayData.length / MAX_POINTS))
  const sampledData = displayData.filter((_, i) => i % step === 0)
  const sampledTime = displayTime.filter((_, i) => i % step === 0)

  const color = COLORS[activeLead % COLORS.length]

  const chartData = {
    labels: sampledTime,
    datasets: [{
      label: lead.name,
      data: sampledData,
      borderColor: color,
      backgroundColor: `${color}10`,
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.3,
      fill: false,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'hsl(220, 22%, 9%)',
        borderColor: 'hsla(200, 60%, 60%, 0.2)',
        borderWidth: 1,
        titleColor: 'hsl(210, 40%, 96%)',
        bodyColor: 'hsl(215, 20%, 65%)',
        titleFont: { family: 'JetBrains Mono', size: 11 },
        bodyFont: { family: 'JetBrains Mono', size: 11 },
        padding: 10,
        callbacks: {
          title: (items) => `t = ${items[0].label}s`,
          label: (item) => `${lead.name}: ${item.raw.toFixed(4)} mV`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'hsla(200, 60%, 60%, 0.06)', lineWidth: 1 },
        ticks: {
          color: 'hsl(215, 15%, 45%)',
          font: { family: 'JetBrains Mono', size: 10 },
          maxTicksLimit: 12,
          callback: (val, i) => {
            const v = sampledTime[i]
            return v !== undefined ? `${parseFloat(v).toFixed(1)}s` : ''
          },
        },
        border: { color: 'hsla(200, 60%, 60%, 0.12)' },
      },
      y: {
        grid: { color: 'hsla(200, 60%, 60%, 0.06)', lineWidth: 1 },
        ticks: {
          color: 'hsl(215, 15%, 45%)',
          font: { family: 'JetBrains Mono', size: 10 },
          callback: (val) => `${val.toFixed(2)}`,
        },
        border: { color: 'hsla(200, 60%, 60%, 0.12)' },
        title: {
          display: true,
          text: 'Amplitude (mV)',
          color: 'hsl(215, 15%, 45%)',
          font: { family: 'Inter', size: 11 },
        },
      },
    },
  }

  const handleZoomIn = () => setZoom(z => Math.min(z * 2, 16))
  const handleZoomOut = () => setZoom(z => Math.max(z / 2, 1))
  const handleReset = () => { setZoom(1); setViewStart(0) }

  const handleExport = () => {
    const canvas = chartRef.current?.canvas
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `cardiosense_${lead.name.replace(/\s/g, '_')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="ecg-chart-card glass-card">
      {/* Header */}
      <div className="ecg-chart__header">
        <div className="ecg-chart__header-left">
          <div className="ecg-chart__indicator" />
          <span className="ecg-chart__title">ECG Waveform</span>
          <span className="badge badge-info">{sampleRate} Hz</span>
          {ecgData.isSample && <span className="badge badge-muted">Demo Signal</span>}
        </div>
        <div className="ecg-chart__controls">
          <button className="btn btn-secondary btn-sm btn-icon" onClick={handleZoomOut} disabled={zoom <= 1} title="Zoom out">
            <ZoomOut size={15} />
          </button>
          <span className="ecg-chart__zoom-label">{zoom}×</span>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={handleZoomIn} disabled={zoom >= 16} title="Zoom in">
            <ZoomIn size={15} />
          </button>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={handleReset} title="Reset view">
            <RotateCcw size={15} />
          </button>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={handleExport} title="Export as PNG">
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Lead selector */}
      {leads.length > 1 && (
        <div className="ecg-chart__leads">
          {leads.map((l, i) => (
            <button
              key={l.name}
              className={`ecg-chart__lead-btn ${activeLead === i ? 'ecg-chart__lead-btn--active' : ''}`}
              onClick={() => setActiveLead(i)}
              style={{ '--lead-color': COLORS[i % COLORS.length] }}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="ecg-chart__canvas-wrapper">
        {/* ECG grid lines (medical paper style) */}
        <div className="ecg-chart__grid-overlay" aria-hidden="true" />
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      {/* Scrubber */}
      {zoom > 1 && (
        <div className="ecg-chart__scrubber">
          <span className="ecg-chart__scrubber-label">Scroll</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={viewStart}
            onChange={(e) => setViewStart(parseFloat(e.target.value))}
            className="ecg-chart__scrubber-input"
          />
          <span className="ecg-chart__scrubber-label">
            {((startIdx / sampleRate)).toFixed(1)}s – {(endIdx / sampleRate).toFixed(1)}s
          </span>
        </div>
      )}

      {/* Footer stats */}
      <div className="ecg-chart__footer">
        <span><strong>Duration:</strong> {ecgData.duration?.toFixed(1)}s</span>
        <span><strong>Samples:</strong> {totalSamples.toLocaleString()}</span>
        <span><strong>Range:</strong> {ecgData.stats?.min} – {ecgData.stats?.max} mV</span>
        <span><strong>Mean:</strong> {ecgData.stats?.mean} mV</span>
        <span className="ecg-chart__footer-hint">Showing {sampledData.length.toLocaleString()} pts (downsampled)</span>
      </div>
    </div>
  )
}
