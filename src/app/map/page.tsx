'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useComplaints } from '@/hooks/use-complaints';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';


// Dynamically import the MapView component with SSR disabled
const MapView = dynamic(() => import('@/components/map-view'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg" />
});

export default function CitizenMapPage() {
  const { complaints } = useComplaints();
  
  return (
    <div className="space-y-8 h-[85vh] flex flex-col">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Complaints Map</h1>
        <p className="text-muted-foreground">Geospatial overview of all citizen complaints.</p>
      </div>

       <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Map Information</AlertTitle>
        <AlertDescription>
          The map displays individual complaint markers and a heatmap overlay to show complaint density hotspots.
        </AlertDescription>
      </Alert>
      
      <Card className="flex-grow">
        <CardContent className="p-2 h-full">
            <MapView complaints={complaints} />
        </CardContent>
      </Card>
    </div>
  );
}
