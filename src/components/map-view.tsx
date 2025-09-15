'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Complaint } from '@/lib/types';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
    iconUrl: require('leaflet/dist/images/marker-icon.png').default,
    shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});


const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
        case 'Resolved':
            return 'green';
        case 'Work in Progress':
            return 'blue';
        case 'Under Review':
            return 'orange';
        case 'Received':
            return 'grey';
        default:
            return 'grey';
    }
}

const createCustomIcon = (color: string) => {
    const markerHtmlStyles = `
      background-color: ${color};
      width: 2rem;
      height: 2rem;
      display: block;
      left: -1rem;
      top: -1rem;
      position: relative;
      border-radius: 2rem 2rem 0;
      transform: rotate(45deg);
      border: 1px solid #FFFFFF;`;
    
    return new L.DivIcon({
      className: "my-custom-pin",
      iconAnchor: [0, 24],
      popupAnchor: [0, -36],
      html: `<span style="${markerHtmlStyles}" />`
    });
};

function MapUpdater({ complaints }: { complaints: (Complaint & { latitude: number; longitude: number; })[] }) {
  const map = useMap();
  useEffect(() => {
    if (complaints.length > 0) {
      const bounds = L.latLngBounds(complaints.map(c => [c.latitude, c.longitude]));
      if (map && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, complaints]);
  return null;
}


export interface MapViewProps {
    complaints: (Complaint & { latitude: number, longitude: number })[];
}

export default function MapView({ complaints }: MapViewProps) {
    const defaultPosition: [number, number] = [28.6139, 77.2090]; // Delhi

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <MapContainer center={defaultPosition} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {complaints.map(complaint => (
                 <Marker
                    key={complaint.id}
                    position={[complaint.latitude, complaint.longitude]}
                    icon={createCustomIcon(getStatusColor(complaint.status))}
                >
                    <Popup>
                        <b>{complaint.category}</b><br />{complaint.description}
                    </Popup>
                </Marker>
            ))}
            {complaints.length > 0 && <MapUpdater complaints={complaints} />}
        </MapContainer>
    );
}
