import { MapContainer, TileLayer, Marker, Circle, GeoJSON,
         useMapEvents, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationHandler({ setSelectedCoords }) {
  useMapEvents({ click(e) { setSelectedCoords(e.latlng); } });
  return null;
}

// Renders GeoJSON zone polygons — choropleth style like the reference image
function ZoneLayer({ geojson, showHeatmap }) {
  const map     = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    // Remove old layer
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (!geojson || !showHeatmap) return;

    layerRef.current = L.geoJSON(geojson, {
      style: (feature) => ({
        fillColor:   feature.properties.color,
        fillOpacity: feature.properties.opacity,
        color:       feature.properties.color,
        weight:      1,
        opacity:     0.7,
      }),
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(
          `<strong>${feature.properties.label} Growth</strong>`,
          { sticky: true, className: 'zone-tooltip' }
        );
      }
    }).addTo(map);

    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, geojson, showHeatmap]);

  return null;
}

export default function MapView({
  selectedCoords, setSelectedCoords,
  hasResult, showHeatmap, predictYears, geojson
}) {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={[16.691, 74.235]} zoom={13}
                    style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
        <LocationHandler setSelectedCoords={setSelectedCoords} />

        {selectedCoords && (
          <>
            <Marker position={selectedCoords} />
            <Circle
              center={selectedCoords}
              radius={2000}
              pathOptions={{ color: 'white', fill: false, weight: 1.5, dashArray: '6 6' }}
            />
          </>
        )}

        {/* Choropleth zone overlay */}
        <ZoneLayer geojson={geojson} showHeatmap={showHeatmap} />
      </MapContainer>
    </div>
  );
}