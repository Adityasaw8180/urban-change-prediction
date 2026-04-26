import { MapContainer, TileLayer, Marker, Circle, useMapEvents, LayersControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const { BaseLayer, Overlay } = LayersControl

function LocationHandler({ setSelectedCoords }) {
  useMapEvents({
    click(e) {
      setSelectedCoords(e.latlng)
    },
  })
  return null
}

export default function MapView({ selectedCoords, setSelectedCoords, results }) {
  const kolhapurCenter = [16.7050, 74.2433] 
  const cityZoom = 13 

  const redRadius = 3000 

  return (
    <MapContainer 
      center={kolhapurCenter} 
      zoom={cityZoom} 
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <LayersControl position="topright">
        <BaseLayer checked name="Satellite with Labels">
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            attribution='&copy; Google Maps'
          />
        </BaseLayer>

        <BaseLayer name="Street Map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
        </BaseLayer>
      </LayersControl>

      <LocationHandler setSelectedCoords={setSelectedCoords} />

      {selectedCoords && (
        <>
          {/* Green Circle: Fixed at 2km (2000 meters) - Tooltip removed */}
          <Circle 
            center={selectedCoords} 
            radius={2000} 
            color="#22c55e" 
            fillOpacity={0.1} 
            weight={2}
          />

          {/* Red Circle: Fixed at 3km (3000 meters) - Tooltip removed */}
          {results && (
            <Circle 
              center={selectedCoords} 
              radius={redRadius} 
              color="#ef4444" 
              fillOpacity={0.15} 
              weight={2} 
              dashArray="5 5" 
            />
          )}

          <Marker position={selectedCoords} />
        </>
      )}
    </MapContainer>
  )
}
