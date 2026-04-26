export default function Sidebar({
  coords,
  pastYear, setPastYear,
  currentYear, setCurrentYear,
  predictYears, setPredictYears,
  onAnalyze,
  loading,
  hasResult
}) {
  return (
    <div className="sidebar">
      <h1>Urban Growth</h1>
      <p>Prediction System</p>

      <div className="coords-box">
        <strong>SELECTED LOCATION</strong>
        <div className="coords-value">
          {coords ? `📍 ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Click map to select'}
        </div>
      </div>

      <div>
        <label>PAST YEAR</label>
        <select value={pastYear} onChange={e => setPastYear(e.target.value)}>
          <option>2015</option>
          <option>2016</option>
          <option>2018</option>
          <option>2020</option>
          <option>2022</option>
        </select>
      </div>

      <div style={{ marginTop: 20 }}>
        <label>CURRENT YEAR</label>
        <select value={currentYear} onChange={e => setCurrentYear(e.target.value)}>
          <option>2023</option>
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
          value={predictYears}
          onChange={e => setPredictYears(Number(e.target.value))}
        />
      </div>

      <button className="analyze" onClick={onAnalyze} disabled={loading || !coords || hasResult}>
        {loading ? 'Analyzing...' : hasResult ? 'Result Ready' : 'Analyze & Predict'}
      </button>

      {/* <div style={{ marginTop: 32 }}>
        <strong>MAP LAYERS</strong>
        <ul style={{ listStyle: 'none', marginTop: 12, fontSize: '0.9rem', color: '#94a3b8' }}>
          <li>• Satellite</li>
          <li>• Past View</li>
          <li>• Current View (selected)</li>
          <li>• Change Detection</li>
        </ul>
      </div> */}
    </div>
  )
}