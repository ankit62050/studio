'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Hourglass, CheckCircle, BarChart } from 'lucide-react';
import { Complaint, ComplaintStatus, complaintStatuses } from '@/lib/types';
import { useComplaints } from '@/hooks/use-complaints';
import dynamic from 'next/dynamic';
import { Icon } from 'leaflet';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

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

export default function AdminMapPage() {
  const { complaints } = useComplaints();

  const statusCounts = useMemo(() => {
    return complaintStatuses.reduce((acc, status) => {
      acc[status] = complaints.filter(c => c.status === status).length;
      return acc;
    }, {} as Record<ComplaintStatus, number>);
  }, [complaints]);

  const pendingCount = statusCounts['Received'] + statusCounts['Under Review'];
  const inProgressCount = statusCounts['Work in Progress'];
  const resolvedCount = statusCounts['Resolved'];

  const geoComplaints = complaints.filter(c => c.latitude && c.longitude) as (Complaint & { latitude: number; longitude: number; })[];
  
  const MapView = useMemo(() => {
    const defaultPosition: [number, number] = [28.6139, 77.2090]; // Centered on Delhi

    return (
        <MapContainer center={defaultPosition} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {geoComplaints.map(complaint => (
                <Marker 
                key={complaint.id} 
                position={[complaint.latitude, complaint.longitude]}
                icon={createCustomIcon(getStatusColor(complaint.status))}
                >
                <Popup>
                    <div className="w-64">
                    <h4 className="font-bold text-lg">{complaint.category}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{complaint.location}</p>
                    <Badge variant="outline" style={{ borderColor: getStatusColor(complaint.status), color: getStatusColor(complaint.status) }}>{complaint.status}</Badge>
                    <p className="mt-2 text-sm">{complaint.description}</p>
                    </div>
                </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}, [geoComplaints]);


  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Complaints Map View</h1>
        <p className="text-muted-foreground">Geospatial overview of all citizen complaints.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaints.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Hourglass className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <BarChart className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-2 h-[60vh]">
          {MapView}
        </CardContent>
      </Card>
    </div>
  );
}
