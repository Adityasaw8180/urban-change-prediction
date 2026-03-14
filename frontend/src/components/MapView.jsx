import { useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, LayersControl, Tooltip } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const { BaseLayer, Overlay } = LayersControl

function LocationHandler({ setSelectedCoords }) {
  useMapEvents({ click(e) { setSelectedCoords(e.latlng) } })
  return null
}

export default function MapView({ selectedCoords, setSelectedCoords, results }) {
  const defaultCenter = [16.4569, 75.8476] // Your example coords

  let growthRadius = 5000
  if (results?.gainKm2) {
    const extra = Number(results.gainKm2)
    growthRadius = 5000 + Math.min(Math.sqrt(extra / Math.PI) * 1500, 10000)
  }

  return (
    <MapContainer center={selectedCoords || defaultCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
      <LayersControl position="topright">
        <BaseLayer checked name="Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='© Esri'
          />
        </BaseLayer>
        <Overlay checked name="Labels">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            attribution='© OpenStreetMap contributors © CARTO'
            subdomains="abcd"
          />
        </Overlay>
      </LayersControl>

      <LocationHandler setSelectedCoords={setSelectedCoords} />

      {selectedCoords && (
        <>
          <Circle center={selectedCoords} radius={5000} color="#22c55e" fillOpacity={0.08} weight={2}>
            <Tooltip permanent direction="top" offset={[0, -10]} className="custom-tooltip">
              Current Classification
            </Tooltip>
          </Circle>

          {results && growthRadius > 5000 && (
            <Circle center={selectedCoords} radius={growthRadius} color="#f97316" fillOpacity={0.12} weight={2} dashArray="5 5" />
          )}

          <Marker position={selectedCoords} />
        </>
      )}
    </MapContainer>
  )
}