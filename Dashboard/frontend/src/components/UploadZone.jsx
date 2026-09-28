import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import './UploadZone.css'

export default function UploadZone({ onUpload, isLoading }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  const onDrop = useCallback((accepted, rejected) => {
    setError(null)
    if (rejected.length > 0) {
      setError('Only CSV files are accepted (max 20MB)')
      return
    }
    if (accepted.length > 0) {
      setFile(accepted[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.csv'] },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
    disabled: isLoading,
  })

  const handleSubmit = () => {
    if (file && onUpload) onUpload(file)
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    setFile(null)
    setError(null)
  }

  return (
    <div className="upload-zone-wrapper">
      {/* Drop area */}
      <motion.div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'upload-zone--drag' : ''} ${file ? 'upload-zone--has-file' : ''} ${isLoading ? 'upload-zone--loading' : ''}`}
        whileHover={{ scale: file || isLoading ? 1 : 1.005 }}
        whileTap={{ scale: file || isLoading ? 1 : 0.998 }}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" className="upload-zone__content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="upload-zone__spinner">
                <div className="ecg-loader">
                  <ECGLoaderSVG />
                </div>
              </div>
              <p className="upload-zone__title">Analyzing ECG signal…</p>
              <p className="upload-zone__sub">Processing 360 Hz data stream</p>
            </motion.div>
          ) : file ? (
            <motion.div key="file" className="upload-zone__content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="upload-zone__file-icon">
                <CheckCircle size={32} strokeWidth={1.5} />
              </div>
              <p className="upload-zone__title">{file.name}</p>
              <p className="upload-zone__sub">{(file.size / 1024).toFixed(1)} KB — Ready to analyze</p>
              <button className="upload-zone__remove" onClick={handleRemove}>
                <X size={14} /> Remove
              </button>
            </motion.div>
          ) : (
            <motion.div key="idle" className="upload-zone__content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className={`upload-zone__icon ${isDragActive ? 'upload-zone__icon--active' : ''}`}>
                {isDragActive ? <FileText size={36} strokeWidth={1.5} /> : <Upload size={36} strokeWidth={1.5} />}
              </div>
              <p className="upload-zone__title">
                {isDragActive ? 'Drop your ECG file here' : 'Upload ECG CSV File'}
              </p>
              <p className="upload-zone__sub">
                Drag & drop or click to browse · MATLAB CSV · Max 20MB
              </p>
              <div className="upload-zone__specs">
                <span>360 Hz</span>
                <span>·</span>
                <span>10 sec</span>
                <span>·</span>
                <span>Single or multi-lead</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="upload-zone__error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      {file && !isLoading && (
        <motion.button
          className="btn btn-primary btn-lg upload-zone__submit"
          onClick={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Upload size={18} />
          Analyze ECG
        </motion.button>
      )}
    </div>
  )
}

function ECGLoaderSVG() {
  return (
    <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 30 L30 30 L40 10 L50 50 L60 20 L70 40 L80 30 L110 30 L120 10 L130 50 L140 20 L150 40 L160 30 L200 30"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="400"
        strokeDashoffset="400"
        style={{ animation: 'ecg-draw 1.5s ease-in-out infinite' }}
      />
      <style>{`
        @keyframes ecg-draw {
          0% { stroke-dashoffset: 400; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -400; }
        }
      `}</style>
    </svg>
  )
}
