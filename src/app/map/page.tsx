'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useComplaints } from '@/hooks/use-complaints';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { complaintCategories, ComplaintCategory } from '@/lib/types';


const MapView = dynamic(() => import('@/components/map-view'), { 
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />
});

export default function CitizenMapPage() {
  const { complaints } = useComplaints();
  const [showHotspots, setShowHotspots] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'All'>('All');
  
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter(c => c.latitude && c.longitude)
      .filter(c => categoryFilter === 'All' || c.category === categoryFilter);
  }, [complaints, categoryFilter]);

  return (
    <div className="space-y-8 h-[85vh] flex flex-col">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Complaints Map</h1>
        <p className="text-muted-foreground">Geospatial overview of all citizen complaints.</p>
      </div>
      
      <Card className="flex-grow flex flex-col">
        <CardHeader>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Map</CardTitle>
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Switch id="hotspot-toggle" checked={showHotspots} onCheckedChange={setShowHotspots} />
                        <Label htmlFor="hotspot-toggle">Show Hotspots</Label>
                    </div>
                    <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ComplaintCategory | 'All')}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Categories</SelectItem>
                            {complaintCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <Alert variant="default" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Map Information</AlertTitle>
                <AlertDescription>
                {showHotspots
                    ? "The map is showing complaint density. Red areas indicate a high concentration of reports."
                    : "The map displays individual complaint markers. Click a marker for details."}
                </AlertDescription>
            </Alert>
        </CardHeader>
        <CardContent className="p-2 h-full flex-grow">
            <MapView complaints={filteredComplaints} showHotspots={showHotspots} />
        </CardContent>
      </Card>
    </div>
  );
}
