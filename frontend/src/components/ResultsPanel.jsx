export default function ResultsPanel({ results, predictYears }) {
  if (!results) {
    return (
      <div className="results-panel">
        <h2>Analysis Results</h2>
        <p style={{ color: '#94a3b8' }}>Select a location and click Analyze</p>
      </div>
    )
  }

  const ZONE_LEGEND = [
    { color: '#cc0000', label: 'Very High Growth' },
    { color: '#e85d04', label: 'High Growth' },
    { color: '#f4d03f', label: 'Medium Growth' },
    { color: '#7bc67e', label: 'Low Growth' },
    { color: '#2d6a4f', label: 'Very Low Growth' },
  ]

  const landCover = [
    { label: 'Urban', pct: parseFloat(results.urbanPct), color: '#f97316' },
    { label: 'Vegetation', pct: parseFloat(results.vegetationPct), color: '#22c55e' },
    { label: 'Water', pct: parseFloat(results.waterPct), color: '#3b82f6' },
    { label: 'Bare Land', pct: parseFloat(results.barePct), color: '#ca8a04' },
  ]

  return (
    <div className="results-panel" style={{ overflowY: 'auto', padding: '16px' }}>
      <h2 style={{ marginBottom: 12 }}>Analysis Results</h2>

      {/* ── ZONE LEGEND (matches map choropleth) ── */}
      <div className="stat-group">
        <h3>GROWTH ZONE LEGEND</h3>
        {ZONE_LEGEND.map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 28, height: 16, borderRadius: 3,
              background: color, flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.15)'
            }} />
            <span style={{ fontSize: 12, color: '#cbd5e1' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── HEATMAP IMAGE FROM PYTHON ── */}
      {results.heatmapBase64 && (
        <div className="stat-group">
          <h3>PREDICTED GROWTH HEATMAP</h3>
          <img
            src={`data:image/png;base64,${results.heatmapBase64}`}
            alt="Urban growth heatmap"
            style={{ width: '100%', borderRadius: 6, border: '1px solid #334155', marginTop: 6 }}
          />
        </div>
      )}

      {/* ── PAST ── */}
      <div className="stat-group">
        <h3>PAST RESULTS ({results.pastYear})</h3>
        <div className="stat">
          <span className="stat-label">PAST URBAN</span>
          <span className="stat-value">{results.pastUrban} km²</span>
        </div>
      </div>

      {/* ── CURRENT ── */}
      <div className="stat-group">
        <h3>CURRENT RESULTS ({results.currentYear})</h3>
        <div className="stat">
          <span className="stat-label">CURRENT URBAN</span>
          <span className="stat-value">{results.currentUrban} km²</span>
        </div>
      </div>

      {/* ── GROWTH ── */}
      <div className="stat-group">
        <h3>GROWTH</h3>
        <div className="stat">
          <span className="stat-label growth">GROWTH</span>
          <span className="stat-value growth">{results.growth}</span>
        </div>
        <div className="stat">
          <span className="stat-label">ANNUAL RATE</span>
          <span className="stat-value">{results.annualRate}</span>
        </div>
        {/* <div style={{ marginTop: 8, background: '#1e293b', borderRadius: 4, height: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(Math.abs(results.growthRaw || 0), 100)}%`,
            background: 'linear-gradient(to right, #22c55e, #f97316)',
            borderRadius: 4,
            transition: 'width 0.6s ease'
          }} />
        </div> */}
      </div>

      {/* ── PREDICTED ── */}
      <div className="stat-group">
        <h3>PREDICTED (+{predictYears} YRS)</h3>
        <div className="stat">
          <span className="stat-label">PREDICTED URBAN</span>
          <span className="stat-value">{results.predictedUrban} km²</span>
        </div>
        <div className="stat">
          <span className="stat-label">CONFIDENCE</span>
          <span className="stat-value">{results.confidence}</span>
        </div>
      </div>

      {/* ── CHANGE DETECTION ── */}
      <div className="stat-group">
        <h3>CHANGE DETECTION</h3>
        <div className="stat">
          <span className="stat-label">Urban Gain</span>
          <span className="stat-value" style={{ color: '#f97316' }}>+{results.gainKm2} km²</span>
        </div>
        {/* <div className="stat">
          <span className="stat-label">Urban Loss</span>
          <span className="stat-value" style={{ color: '#ef4444' }}>-{results.lossKm2} km²</span>
        </div> */}
        <div className="stat">
          <span className="stat-label">Stable</span>
          <span className="stat-value">{results.stablePct}</span>
        </div>
      </div>

     

    </div>
  )
}
 {/* ── LAND COVER ── */}
// <div className="stat-group">
//   <h3>CURRENT CLASSIFICATION</h3>
//   {landCover.map(({ label, pct, color }) => (
//     <div key={label}>
//       <div className="stat">
//         <span className="stat-label">{label}</span>
//         <span className="stat-value">{isNaN(pct) ? 'N/A' : `${pct.toFixed(1)}%`}</span>
//       </div>
//       <div style={{ background: '#1e293b', borderRadius: 4, height: 6, margin: '2px 0 8px', overflow: 'hidden' }}>
//         <div style={{
//           width: `${isNaN(pct) ? 0 : pct}%`,
//           height: '100%',
//           background: color,
//           borderRadius: 4,
//           transition: 'width 0.6s ease'
//         }} />
//       </div>
//     </div>
//   ))}
// </div>