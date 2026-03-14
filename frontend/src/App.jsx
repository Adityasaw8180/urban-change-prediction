import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ResultsPanel from './components/ResultsPanel';
import MapView from './components/MapView';
import './App.css';

function App() {
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState(null);

  return (
    <div className="container">
      <Sidebar
        location={location}
        setResult={setResult}
      />

      <div className="map-section">
        <MapView
          location={location}
          setLocation={setLocation}
          result={result}
        />
      </div>

      <ResultsPanel result={result} />
    </div>
  );
}

export default App;