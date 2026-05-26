/**
 * Nam Nadu — Location Picker Map Component
 * Allows user to drag a pin to select location
 */
import { useState, useRef, useMemo } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';
import MapContainer from './MapContainer';

export default function LocationPicker({ position, onPositionChange, className }) {
  const [markerPos, setMarkerPos] = useState(position);
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setMarkerPos([newPos.lat, newPos.lng]);
          onPositionChange([newPos.lat, newPos.lng]);
        }
      },
    }),
    [onPositionChange],
  );

  function MapEvents() {
    useMapEvents({
      click(e) {
        setMarkerPos([e.latlng.lat, e.latlng.lng]);
        onPositionChange([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  return (
    <MapContainer center={position} className={className}>
      <MapEvents />
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={markerPos}
        ref={markerRef}
      />
    </MapContainer>
  );
}
