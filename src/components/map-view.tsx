'use client';

import React, { useEffect, useRef } from 'react';
import { Complaint } from '@/lib/types';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';

const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
        case 'Resolved':
            return 'hsl(var(--accent))';
        case 'Work in Progress':
            return 'hsl(var(--info))';
        case 'Under Review':
        case 'Received':
            return 'hsl(var(--primary))';
        default:
            return '#808080'; // Gray
    }
}

const createCustomIcon = (color: string) => {
    const html = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <path fill="${color}" stroke="#fff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
      </svg>
    `;
    return new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(html)}`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

interface MapViewProps {
    complaints: (Complaint & { latitude: number; longitude: number; })[];
}

export default function MapView({ complaints }: MapViewProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        // Ensure this only runs on the client
        if (typeof window === 'undefined' || !mapRef.current) {
            return;
        }

        // Initialize map only once
        if (!mapInstanceRef.current) {
            const map = L.map(mapRef.current, {
                center: [28.6139, 77.2090], // Delhi
                zoom: 12,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            mapInstanceRef.current = map;
        }

        // Cleanup existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        const map = mapInstanceRef.current;
        complaints.forEach(complaint => {
            const popupContent = `
                <div class="w-64">
                    <h4 class="font-bold text-lg">${complaint.category}</h4>
                    <p class="text-sm text-muted-foreground mb-2">${complaint.location}</p>
                    <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold" style="border-color: ${getStatusColor(complaint.status)}; color: ${getStatusColor(complaint.status)}">${complaint.status}</span>
                    <p class="mt-2 text-sm">${complaint.description}</p>
                </div>
            `;

            const marker = L.marker([complaint.latitude, complaint.longitude], {
                icon: createCustomIcon(getStatusColor(complaint.status)),
            })
            .addTo(map)
            .bindPopup(popupContent);
            
            markersRef.current.push(marker);
        });

        // Cleanup function on component unmount
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [complaints]); // Re-run effect if complaints data changes

    return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }} />;
}
