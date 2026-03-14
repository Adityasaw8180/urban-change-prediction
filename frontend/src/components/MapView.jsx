import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents
} from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

function ClickHandler({ setLocation, mapRef }) {
  useMapEvents({
    click(e) {
      const newLoc = [e.latlng.lat, e.latlng.lng];
      setLocation(newLoc);

      if (mapRef.current) {
        mapRef.current.flyTo(newLoc, 14);
      }
    }
  });

  return null;
}

function ResizeMap({ mapRef }) {
  useEffect(() => {
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300);
  }, []);

  return null;
}

export default function MapView({ location, setLocation, result }) {
  const mapRef = useRef();

  return (
    <MapContainer
      center={[16.4569, 75.8476]}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
      whenCreated={(map) => {
        mapRef.current = map;
      }}
    >
      <ResizeMap mapRef={mapRef} />

      {/* Satellite */}
      <TileLayer
        attribution="Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      {/* Labels */}
      <TileLayer
        attribution="OSM"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.35}
      />

      {/* Marker + blue circle only after click */}
      {location && (
        <>
          <Marker position={location} />

          <Circle
            center={location}
            radius={5000}
            pathOptions={{
              color: 'blue',
              fillOpacity: 0.15
            }}
          />
        </>
      )}

      {/* Orange circle only after prediction */}
      {location && result && (
        <Circle
          center={location}
          radius={7000}
          pathOptions={{
            color: 'orange',
            fillOpacity: 0.12
          }}
        />
      )}

      <ClickHandler setLocation={setLocation} mapRef={mapRef} />
    </MapContainer>
  );
}