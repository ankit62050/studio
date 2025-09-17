
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Hourglass, CheckCircle, BarChart, AlertTriangle } from 'lucide-react';
import { ComplaintStatus, complaintStatuses, ComplaintCategory, complaintCategories } from '@/lib/types';
import { useComplaints } from '@/hooks/use-complaints';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Map } from '@/components/map';
import { Complaint } from '@/lib/types';

export default function AdminMapPage() {
  const { complaints } = useComplaints();
  const [showHotspots, setShowHotspots] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'All'>('All');

  const statusCounts = useMemo(() => complaintStatuses.reduce((acc, status) => {
    acc[status] = complaints.filter(c => c.status === status).length;
    return acc;
  }, {} as Record<ComplaintStatus, number>), [complaints]);

  const pendingCount = statusCounts['Received'] + statusCounts['Under Review'];
  const inProgressCount = statusCounts['Work in Progress'];
  const resolvedCount = statusCounts['Resolved'];

  const filteredComplaints = useMemo(() => {
    return complaints
      .filter(c => c.latitude && c.longitude)
      .filter(c => categoryFilter === 'All' || c.category === categoryFilter) as (Complaint & {latitude: number, longitude: number})[];
  }, [complaints, categoryFilter]);
  
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
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Map</CardTitle>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center space-x-2">
                        <Switch id="hotspot-toggle" checked={showHotspots} onCheckedChange={setShowHotspots} />
                        <Label htmlFor="hotspot-toggle">Show Hotspots</Label>
                    </div>
                    <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ComplaintCategory | 'All')}>
                        <SelectTrigger className="w-full sm:w-[180px]">
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
        <CardContent className="p-2 h-[60vh]">
           <Map complaints={filteredComplaints} showHotspots={showHotspots} />
        </CardContent>
      </Card>
    </div>
  );
}
