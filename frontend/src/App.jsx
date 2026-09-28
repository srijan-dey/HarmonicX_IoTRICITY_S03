import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import AboutPage from './pages/AboutPage'
import DatasetPage from './pages/DatasetPage'

function App() {
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze" element={<AnalysisPage />} />
        <Route path="/dataset" element={<DatasetPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  )
}

export default App
