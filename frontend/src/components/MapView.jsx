import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 40],
});

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    },
  });
  return null;
}

// Component to update map center when coordinates change
function MapUpdater({ latitude, longitude }) {
  const map = useMapEvents({});
  
  useEffect(() => {
    if (latitude && longitude && typeof latitude === 'number' && typeof longitude === 'number') {
      map.setView([latitude, longitude], map.getZoom());
    }
  }, [latitude, longitude, map]);
  
  return null;
}

const MapView = ({ latitude, longitude, riskLevel, onLocationSelect }) => {
  const defaultLat = typeof latitude === 'number' ? latitude : 20.5937;
  const defaultLng = typeof longitude === 'number' ? longitude : 78.9629;
  const hasValidCoords = typeof latitude === 'number' && typeof longitude === 'number';
  
  return (
    <div className="card p-4 h-[400px]">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold">🗺️ Interactive Map</p>
        <span className="text-xs text-white/60">Risk: {riskLevel || 'N/A'}</span>
      </div>
      {onLocationSelect && (
        <p className="text-xs text-accent/80 mb-2">✨ Click anywhere on the map to select a location</p>
      )}
      <MapContainer
        center={[defaultLat, defaultLng]}
        zoom={hasValidCoords ? 10 : 5}
        scrollWheelZoom={true}
        style={{ width: '100%', height: 'calc(100% - 50px)', borderRadius: '16px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}
        <MapUpdater latitude={latitude} longitude={longitude} />
        {hasValidCoords && (
          <Marker position={[latitude, longitude]} icon={markerIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Selected Location</p>
                <p className="text-xs">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
                {riskLevel && <p className="text-xs font-bold mt-1">Risk: {riskLevel}</p>}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
