import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const markerIcon = L.icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_CENTER = [6.9271, 79.8612]; // Colombo

function LocationMarker({ position, onSelect, draggable }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng);
    },
  });

  function handleDragEnd(e) {
    onSelect(e.target.getLatLng());
  }

  return position ? (
    <Marker
      position={position}
      icon={markerIcon}
      draggable={!!draggable}
      eventHandlers={draggable ? { dragend: handleDragEnd } : {}}
    />
  ) : null;
}

export default function MapPicker({ latitude, longitude, onChange, height = 320, draggable = false }) {
  const [position, setPosition] = useState(
    latitude && longitude ? { lat: latitude, lng: longitude } : null,
  );

  function handleSelect(latlng) {
    setPosition(latlng);
    onChange?.({ latitude: latlng.lat, longitude: latlng.lng });
  }

  return (
    <div>
      <div style={{ height, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        <MapContainer
          center={position ? [position.lat, position.lng] : DEFAULT_CENTER}
          zoom={position ? 14 : 8}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position ? [position.lat, position.lng] : null}
            onSelect={handleSelect}
            draggable={draggable}
          />
        </MapContainer>
      </div>
      <p className="form-hint">
        {draggable ? 'Click to place pin, then drag to adjust.' : 'Click on the map to drop a pin at your exact location.'}
      </p>
      {position && (
        <p className="form-hint">
          Selected: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
