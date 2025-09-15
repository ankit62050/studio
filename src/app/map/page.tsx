'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useComplaints } from '@/hooks/use-complaints';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const MapView = dynamic(() => import('@/components/map-view'), { 
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />
});

export default function CitizenMapPage() {
  const { complaints } = useComplaints();
  
  const geoComplaints = useMemo(() => {
    return complaints.filter(c => c.latitude && c.longitude);
  }, [complaints]);

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
          The map displays individual complaint markers.
        </AlertDescription>
      </Alert>
      
      <Card className="flex-grow">
        <CardContent className="p-2 h-full">
            <MapView complaints={geoComplaints} />
        </CardContent>
      </Card>
    </div>
  );
}
