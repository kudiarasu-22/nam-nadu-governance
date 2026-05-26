/**
 * Nam Nadu — Reusable Map Container
 */
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MAP_DEFAULTS } from '@/constants';
import { cn } from '@/utils';

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function MapContainer({ 
  center = MAP_DEFAULTS.CENTER, 
  zoom = MAP_DEFAULTS.ZOOM, 
  className,
  children 
}) {
  return (
    <div className={cn("w-full h-[300px] rounded-xl overflow-hidden border border-border-light dark:border-border-dark", className)}>
      <LeafletMap center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </LeafletMap>
    </div>
  );
}
