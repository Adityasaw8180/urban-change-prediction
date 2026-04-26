import { useState, useMemo } from 'react'
import Sidebar from './components/Sidebar.jsx'
import MapView from './components/MapView.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'
import Loader from './components/Loader.jsx'
import './App.css'

const NODE_API = 'http://localhost:5000'

function App() {
  const [selectedCoords, setSelectedCoords] = useState(null)
  const [pastYear, setPastYear] = useState('2015')
  const [currentYear, setCurrentYear] = useState('2024')
  const [predictYears, setPredictYears] = useState(5)
  const [resultsCache, setResultsCache] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showHeatmap, setShowHeatmap] = useState(true)

  const cacheKey = selectedCoords
    ? `${selectedCoords.lat.toFixed(5)},${selectedCoords.lng.toFixed(5)}|${pastYear}|${currentYear}|${predictYears}`
    : null

  const currentResults = useMemo(
    () => (cacheKey ? resultsCache[cacheKey] : null),
    [cacheKey, resultsCache]
  )

  const handleAnalyze = async () => {
    if (!selectedCoords) return alert('Select a location first.')
    if (currentResults) return  // already cached

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${NODE_API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: selectedCoords.lat,
          lng: selectedCoords.lng,
          pastYear,
          currentYear,
          predictYears,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || `Server error ${res.status}`)
      }

      const data = await res.json()  // { heatmap: base64, stats: {...} }

      setResultsCache(prev => ({
        ...prev,
        [cacheKey]: {
          ...data.stats,
          heatmapBase64: data.heatmap,
          geojson: data.geojson,   // ← ADD THIS
        },
      }))
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        coords={selectedCoords}
        pastYear={pastYear} setPastYear={setPastYear}
        currentYear={currentYear} setCurrentYear={setCurrentYear}
        predictYears={predictYears} setPredictYears={setPredictYears}
        onAnalyze={handleAnalyze}
        loading={loading}
        hasResult={!!currentResults}
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
      />

      <div className="map-wrapper">
        <MapView
          selectedCoords={selectedCoords}
          setSelectedCoords={setSelectedCoords}
          hasResult={!!currentResults}
          showHeatmap={showHeatmap}
          predictYears={predictYears}
          geojson={currentResults?.geojson}   // ← ADD THIS
        />
        {loading && <Loader />}
        {error && (
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            background: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: 8,
            zIndex: 1000, maxWidth: 400, textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      <ResultsPanel results={currentResults} predictYears={predictYears} />
    </div>
  )
}

export default App