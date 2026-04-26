export default function Sidebar({
  coords,
  pastYear, setPastYear,
  currentYear, setCurrentYear,
  predictYears, setPredictYears,
  onAnalyze,
  loading,
  hasResult,
  showHeatmap,
  setShowHeatmap
}) {
  return (
    <div className="sidebar" style={{ padding: '20px', color: 'white', background: '#1a202c' }}>
      <h1>Urban Growth</h1>
      <p>Prediction System</p>

      {/* Heatmap Toggle */}
      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={() => setShowHeatmap(prev => !prev)}
          />
          Show Heatmap Overlay
        </label>
      </div>

      <div className="coords-box" style={{ background: '#2d3748', padding: '10px', marginTop: 20 }}>
        <strong>SELECTED LOCATION</strong>
        <div className="coords-value">
          {coords
            ? `📍 ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
            : 'Click map to select'}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <label>PAST YEAR</label>
        <select value={pastYear} onChange={e => setPastYear(e.target.value)} style={{ width: '100%', padding: '5px' }}>
          <option>2015</option>
          <option>2020</option>
        </select>
      </div>

      <div style={{ marginTop: 20 }}>
        <label>CURRENT YEAR</label>
        <select value={currentYear} onChange={e => setCurrentYear(e.target.value)} style={{ width: '100%', padding: '5px' }}>
          <option>2024</option>
          <option>2025</option>
        </select>
      </div>

      <div style={{ marginTop: 24 }}>
        <label>PREDICT AHEAD: {predictYears} YEARS</label>
        <input
          type="range"
          min="1"
          max="20"
          style={{ width: '100%' }}
          value={predictYears}
          onChange={e => setPredictYears(Number(e.target.value))}
        />
      </div>

      <button
        className="analyze"
        onClick={onAnalyze}
        disabled={loading || !coords}
        style={{ 
          marginTop: 30, 
          width: '100%', 
          padding: '12px',
          background: hasResult ? '#48bb78' : '#38a169',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Analyzing...' : hasResult ? 'Result Ready (View Map)' : 'Analyze & Predict'}
      </button>
    </div>
  );
}