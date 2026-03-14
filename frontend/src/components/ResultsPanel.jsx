export default function ResultsPanel({ results, predictYears }) {
  if (!results) {
    return (
      <div className="results-panel">
        <h2>Analysis Results</h2>
        <p style={{ color: '#94a3b8' }}>Select location and analyze to see results</p>
      </div>
    );
  }

  return (
    <div className="results-panel">
      <h2>Analysis Results</h2>

      <div className="stat-group">
        <h3>PAST RESULTS ({results.pastYear})</h3>
        <div className="stat">
          <span className="stat-label">PAST URBAN</span>
          <span className="stat-value">{results.pastUrban} km²</span>
        </div>
      </div>

      <div className="stat-group">
        <h3>CURRENT RESULTS</h3>
        <div className="stat">
          <span className="stat-label">CURRENT URBAN</span>
          <span className="stat-value">{results.currentUrban} km²</span>
        </div>
      </div>

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
      </div>

      <div className="stat-group">
        <h3>PREDICTED</h3>
        <div className="stat">
          <span className="stat-label">PREDICTED URBAN</span>
          <span className="stat-value">{results.predictedUrban} km²</span>
        </div>
        <div className="stat">
          <span className="stat-label">CONFIDENCE</span>
          <span className="stat-value">{results.confidence}</span>
        </div>
      </div>

      <div className="stat-group">
        <h3>CHANGE DETECTION</h3>
        <div className="stat">
          <span className="stat-label">Urban Gain</span>
          <span className="stat-value">{results.gainKm2} km²</span>
        </div>
        <div className="stat">
          <span className="stat-label">Urban Loss</span>
          <span className="stat-value">{results.lossKm2} km²</span>
        </div>
        <div className="stat">
          <span className="stat-label">Stable</span>
          <span className="stat-value">{results.stablePct}</span>
        </div>
      </div>

      <div className="stat-group">
        <h3>CURRENT CLASSIFICATION</h3>
        
        {/* Urban - Orange */}
        <div className="stat">
          <span className="stat-label">Urban</span>
          <span className="stat-value">{results.urbanPct}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: results.urbanPct, background: '#f97316' }} />
        </div>

        {/* Vegetation - Green */}
        <div className="stat">
          <span className="stat-label">Vegetation</span>
          <span className="stat-value">{results.vegetationPct}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: results.vegetationPct, background: '#22c55e' }} />
        </div>

        {/* Water - Blue */}
        <div className="stat">
          <span className="stat-label">Water</span>
          <span className="stat-value">{results.waterPct}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: results.waterPct, background: '#3b82f6' }} />
        </div>

        {/* Bare Land - Gold */}
        <div className="stat">
          <span className="stat-label">Bare Land</span>
          <span className="stat-value">{results.barePct}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: results.barePct, background: '#ca8a04' }} />
        </div>
      </div>
    </div>
  );
}