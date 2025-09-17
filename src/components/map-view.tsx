'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { Complaint } from '@/lib/types';

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

export interface MapViewProps {
    complaints: (Complaint & { latitude: number, longitude: number })[];
    showHotspots?: boolean;
}

export default function MapView({ complaints, showHotspots = false }: MapViewProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const heatLayerRef = useRef<L.HeatLayer | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const defaultPosition: L.LatLngTuple = [28.6139, 77.2090]; // Delhi

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView(defaultPosition, 12);
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Clear existing layers
        markersRef.current.forEach(marker => map.removeLayer(marker));
        markersRef.current = [];
        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
            heatLayerRef.current = null;
        }

        if (complaints.length > 0) {
            if (showHotspots) {
                // Show heatmap
                const points = complaints.map(c => [c.latitude, c.longitude, 1] as L.HeatLatLngTuple);
                heatLayerRef.current = (L as any).heatLayer(points, { 
                    radius: 25,
                    blur: 15,
                    maxZoom: 18,
                    gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
                }).addTo(map);
            } else {
                // Show markers
                complaints.forEach(complaint => {
                    const marker = L.marker([complaint.latitude, complaint.longitude], {
                        icon: createCustomIcon(getStatusColor(complaint.status))
                    });
                    marker.bindPopup(`<b>${complaint.category}</b><br />${complaint.description}`);
                    marker.addTo(map);
                    markersRef.current.push(marker);
                });
            }

            // Fit map to bounds
            const bounds = L.latLngBounds(complaints.map(c => [c.latitude, c.longitude]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }

    }, [complaints, showHotspots]);

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }} />
    );
}
