'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Hourglass, CheckCircle, BarChart, AlertTriangle } from 'lucide-react';
import { ComplaintStatus, complaintStatuses } from '@/lib/types';
import { useComplaints } from '@/hooks/use-complaints';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const MapView = dynamic(() => import('@/components/map-view'), { 
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />
});

export default function AdminMapPage() {
  const { complaints } = useComplaints();

  const statusCounts = complaintStatuses.reduce((acc, status) => {
    acc[status] = complaints.filter(c => c.status === status).length;
    return acc;
  }, {} as Record<ComplaintStatus, number>);

  const pendingCount = statusCounts['Received'] + statusCounts['Under Review'];
  const inProgressCount = statusCounts['Work in Progress'];
  const resolvedCount = statusCounts['Resolved'];

  const geoComplaints = useMemo(() => {
    return complaints.filter(c => c.latitude && c.longitude);
  }, [complaints]);
  
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Complaints Map View</h1>
        <p className="text-muted-foreground">Geospatial overview of all citizen complaints.</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Map Information</AlertTitle>
        <AlertDescription>
          The map displays individual complaint markers.
        </AlertDescription>
      </Alert>

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
           <MapView complaints={geoComplaints} />
        </CardContent>
      </Card>
    </div>
  );
}
