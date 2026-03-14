export default function ResultsPanel({ result }) {
  return (
    <div className="results">
      <h2>Analysis Results</h2>
      <div className="sub-header">Regional Statistics</div>

      {!result ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: '80px',
            color: '#9ca3af',
            fontSize: '15px'
          }}
        >
          No prediction yet
        </div>
      ) : (
        <div className="results-grid">
          <div className="stat-card">
            <div className="stat-label">Past Urban</div>
            <div className="stat-value">{result.pastUrban} km²</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Current Urban</div>
            <div className="stat-value">{result.currentUrban} km²</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Growth</div>
            <div className="stat-value">{result.growth}%</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Predicted</div>
            <div className="stat-value">{result.predicted} km²</div>
          </div>
        </div>
      )}
    </div>
  );
}