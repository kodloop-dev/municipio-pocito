import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coordenadas } from '../../context/tipos'

// Fix: Leaflet no resuelve bien los iconos con Vite por defecto
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CENTRO_POCITO: [number, number] = [-31.6553, -68.5694]

function ManejadorClic({ alSeleccionar }: { alSeleccionar: (c: Coordenadas) => void }) {
  useMapEvents({
    click(e) {
      alSeleccionar({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

interface Props {
  coordenadas: Coordenadas | null
  alSeleccionar: (c: Coordenadas) => void
}

export function SelectorMapa({ coordenadas, alSeleccionar }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-48 rounded-xl overflow-hidden border-2 border-dashed border-[#27A9E1]" style={{ isolation: 'isolate' }}>
        <MapContainer
          center={coordenadas ? [coordenadas.lat, coordenadas.lng] : CENTRO_POCITO}
          zoom={14}
          className="h-full w-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ManejadorClic alSeleccionar={alSeleccionar} />
          {coordenadas && <Marker position={[coordenadas.lat, coordenadas.lng]} />}
        </MapContainer>
      </div>
      {coordenadas ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500">
            Lat: {coordenadas.lat.toFixed(6)} · Lng: {coordenadas.lng.toFixed(6)}
          </p>
          <a
            href={`https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#0077C8] font-bold underline underline-offset-2"
          >
            Abrir en Google Maps ↗
          </a>
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center">Tocá el mapa para marcar tu ubicación exacta</p>
      )}
    </div>
  )
}
