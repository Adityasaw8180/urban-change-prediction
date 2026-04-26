import { useState, useMemo } from 'react'

import Sidebar from './components/Sidebar.jsx'

import MapView from './components/MapView.jsx'

import ResultsPanel from './components/ResultsPanel.jsx'

import Loader from './components/Loader.jsx'

import './App.css'



function App() {

  const [selectedCoords, setSelectedCoords] = useState(null)

  const [pastYear, setPastYear] = useState('2015')

  const [currentYear, setCurrentYear] = useState('2024')

  const [predictYears, setPredictYears] = useState(5)

  const [resultsCache, setResultsCache] = useState({})

  const [loading, setLoading] = useState(false)



  const coordsKey = selectedCoords ? `${selectedCoords.lat.toFixed(5)},${selectedCoords.lng.toFixed(5)}` : null

  const cacheKey = coordsKey ? `${coordsKey}|${pastYear}|${currentYear}|${predictYears}` : null



  const currentResults = useMemo(() => cacheKey ? resultsCache[cacheKey] : null, [cacheKey, resultsCache])



  const handleAnalyze = () => {

    if (!selectedCoords) return alert('Select a location first.')

    if (currentResults) return



    setLoading(true)



    setTimeout(() => {



      const past = 39.5 + Math.random() * 5

      const current = past + 10 + Math.random() * 15

      const growthPct = ((current - past) / past * 100).toFixed(1)

      const yearsDiff = Number(currentYear) - Number(pastYear)

      const annual = (growthPct / yearsDiff).toFixed(2)

      const predicted = (current * (1 + 0.042 * predictYears)).toFixed(1)

      const gain = (current - past).toFixed(1)



      const newRes = {

        pastUrban: past.toFixed(1),

        currentUrban: current.toFixed(1),

        growth: `+${growthPct}%`,

        annualRate: `${annual}%/yr`,

        predictedUrban: predicted,

        confidence: `${(78 + Math.random() * 15).toFixed(1)}%`,

        gainKm2: gain,

        lossKm2: '0.5',

        stablePct: `${(75 + Math.random() * 10).toFixed(1)}%`,

        urbanPct: '61.6',

        vegetationPct: '20.9',

        waterPct: '4.5',

        barePct: '13.0'

      }



      setResultsCache(prev => ({ ...prev, [cacheKey]: newRes }))

      setLoading(false)

    }, 1800)

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

      />



      <div className="map-wrapper">

        <MapView

          selectedCoords={selectedCoords}

          setSelectedCoords={setSelectedCoords}

          results={currentResults}

        />

        {loading && <Loader />}

      </div>



      <ResultsPanel results={currentResults} predictYears={predictYears} />

    </div>

  )

}



export default App