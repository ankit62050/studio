'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Complaint } from '@/lib/types';
import { useComplaints } from '@/hooks/use-complaints';
import MapView from '@/components/map-view';
import 'leaflet/dist/leaflet.css';


export default function CitizenMapPage() {
  const { complaints } = useComplaints();

  const geoComplaints = complaints.filter(c => c.latitude && c.longitude) as (Complaint & { latitude: number; longitude: number; })[];
  
  return (
    <div className="space-y-8 h-[80vh] flex flex-col">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Complaints Map</h1>
        <p className="text-muted-foreground">Geospatial overview of all citizen complaints.</p>
      </div>
      
      <Card className="flex-grow">
        <CardContent className="p-2 h-full">
            <MapView complaints={geoComplaints} />
        </CardContent>
      </Card>
    </div>
  );
}
