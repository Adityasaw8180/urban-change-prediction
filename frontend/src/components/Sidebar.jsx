export default function Sidebar({ location, setResult }) {
  const handlePredict = () => {
    if (!location) return;

    const past = (Math.random() * 20 + 20).toFixed(1);
    const current = (Math.random() * 20 + 40).toFixed(1);
    const growth = ((current - past) / past * 100).toFixed(1);
    const predicted = (parseFloat(current) + 12).toFixed(1);

    setResult({
      pastUrban: past,
      currentUrban: current,
      growth: growth,
      predicted: predicted
    });
  };

  return (
    <div className="sidebar">
      <h2>Urban Growth</h2>
      <div className="sub-header">Prediction System</div>

      <label>Selected Location</label>
      <input
        value={
          location
            ? `${location[0].toFixed(4)}, ${location[1].toFixed(4)}`
            : ''
        }
        readOnly
      />

      <label>Past Year</label>
      <select>
        <option>2015</option>
      </select>

      <label>Current Year</label>
      <select>
        <option>2024</option>
      </select>

      <button className="analyze-btn" onClick={handlePredict}>
        Analyze & Predict
      </button>
    </div>
  );
}