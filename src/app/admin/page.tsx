
'use client';

import { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Complaint, ComplaintStatus, complaintStatuses, User, Officer, complaintCategories } from '@/lib/types';
import { users, officers } from '@/lib/data';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { FileText, Hourglass, CheckCircle, Camera, Star, Sparkles, Loader2, User as UserIcon, Building, Shield, Layers, Workflow, List } from 'lucide-react';
import Image from 'next/image';
import { useComplaints } from '@/hooks/use-complaints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { processComplaint, ProcessComplaintOutput } from '@/ai/flows/process-complaint';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';

type StatusFilter = ComplaintStatus | 'Pending' | 'All';

export default function AdminDashboardPage() {
  const { complaints, updateComplaintStatus, addComplaintImage, updateComplaint } = useComplaints();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentComplaintAction = useRef<{ complaintId: string; status: ComplaintStatus } | null>(null);
  const { toast } = useToast();

  const [processingComplaintId, setProcessingComplaintId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<ProcessComplaintOutput | null>(null);
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [currentComplaintIdForDialog, setCurrentComplaintIdForDialog] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
  const [selectedTabIndex, setSelectedTabIndex] = useState<number | null>(0);


  const handleStatusChange = (complaintId: string, newStatus: ComplaintStatus) => {
    updateComplaintStatus(complaintId, newStatus);
  };
  
  const getUserById = (userId: string): User | undefined => {
    return users.find(u => u.id === userId);
  }

  const handleAddPhotoClick = (complaintId: string, status: ComplaintStatus) => {
    currentComplaintAction.current = { complaintId, status };
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentComplaintAction.current) {
      const { complaintId, status } = currentComplaintAction.current;
      const reader = new FileReader();
      reader.onloadend = () => {
        addComplaintImage(complaintId, reader.result as string, status);
      };
      reader.readAsDataURL(file);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    currentComplaintAction.current = null;
  };

  const handleProcessComplaint = async (complaint: Complaint) => {
    setProcessingComplaintId(complaint.id);
    setCurrentComplaintIdForDialog(complaint.id);
    try {
      const result = await processComplaint({
        complaint: {
          description: complaint.description,
          location: complaint.location,
          photoDataUri: complaint.beforeImageUrls?.[0],
        },
        officers,
      });
      setSuggestion(result);
      setIsSuggestionDialogOpen(true);
    } catch (error) {
      console.error("AI processing failed", error);
      toast({
        variant: 'destructive',
        title: 'AI Processing Failed',
        description: 'There was an error while processing the complaint with AI.',
      });
    } finally {
      setProcessingComplaintId(null);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!suggestion || !currentComplaintIdForDialog) return;
    updateComplaint(currentComplaintIdForDialog, {
        category: suggestion.suggestedCategory,
        status: 'Under Review'
    });
    toast({
        title: 'Complaint Updated',
        description: 'The complaint has been updated based on AI suggestions.',
    });
    setIsSuggestionDialogOpen(false);
    setSuggestion(null);
    setCurrentComplaintIdForDialog(null);
  };

  const filteredComplaints = useMemo(() => {
    if (activeFilter === 'All') return complaints;
    if (activeFilter === 'Pending') {
      return complaints.filter(c => c.status === 'Received' || c.status === 'Under Review');
    }
    return complaints.filter(c => c.status === activeFilter);
  }, [complaints, activeFilter]);

  const currentComplaintForDialog = complaints.find(c => c.id === currentComplaintIdForDialog);

  const volumeData = useMemo(() => {
    const last30Days = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), i);
      const formattedDate = format(date, 'MMM d');
      last30Days.set(formattedDate, 0);
    }

    complaints.forEach(complaint => {
      const submittedDate = startOfDay(new Date(complaint.submittedAt));
      const formattedDate = format(submittedDate, 'MMM d');
      if (last30Days.has(formattedDate)) {
        last30Days.set(formattedDate, (last30Days.get(formattedDate) || 0) + 1);
      }
    });
    
    return Array.from(last30Days.entries())
      .map(([name, total]) => ({ name, total }))
      .reverse();

  }, [complaints]);

  const categoryData = useMemo(() => {
    const categoryCounts = complaintCategories.reduce((acc, category) => {
        acc[category] = 0;
        return acc;
    }, {} as Record<Complaint['category'], number>);
    
    complaints.forEach(complaint => {
        if(categoryCounts.hasOwnProperty(complaint.category)) {
            categoryCounts[complaint.category]++;
        }
    });

    return Object.entries(categoryCounts)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [complaints]);

  const chartConfig = {
    total: {
      label: 'Complaints',
      color: 'hsl(var(--primary))',
    },
  };

  const filterTabs = useMemo(() => {
    const statusCounts = complaintStatuses.reduce((acc, status) => {
        acc[status] = complaints.filter(c => c.status === status).length;
        return acc;
    }, {} as Record<ComplaintStatus, number>);
    const pendingCount = statusCounts['Received'] + statusCounts['Under Review'];

    return [
      { title: `All (${complaints.length})`, icon: List, filter: 'All' },
      { title: `Pending (${pendingCount})`, icon: Hourglass, filter: 'Pending' },
      { title: `In Progress (${statusCounts['Work in Progress']})`, icon: Workflow, filter: 'Work in Progress' },
      { title: `Resolved (${statusCounts['Resolved']})`, icon: CheckCircle, filter: 'Resolved' },
    ];
  }, [complaints]);
  
  const handleFilterChange = (index: number | null) => {
    setSelectedTabIndex(index);
    if (index === null) {
      setActiveFilter('All');
      return;
    }
    setActiveFilter(filterTabs[index].filter as StatusFilter);
  };

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of all citizen complaints and trends.</p>
        </div>
        <ExpandableTabs tabs={filterTabs} onChange={handleFilterChange} />
      </div>

       <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Community Trends</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Complaint Volume (Last 30 Days)</CardTitle>
                <CardDescription>Daily number of new complaints submitted.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <ResponsiveContainer>
                    <RechartsBarChart data={volumeData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis allowDecimals={false} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Most common types of complaints reported.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <ResponsiveContainer>
                    <RechartsBarChart data={categoryData} layout="vertical">
                      <CartesianGrid horizontal={false} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        fontSize={12}
                        width={100}
                      />
                      <XAxis type="number" allowDecimals={false} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Bar dataKey="total" fill="var(--color-total)" radius={4} layout="vertical" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaint List</CardTitle>
          <CardDescription>Filtered by: {activeFilter}</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Feedback</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((complaint) => {
                  const user = getUserById(complaint.userId);
                  const isProcessing = processingComplaintId === complaint.id;
                  const allImages = [...(complaint.beforeImageUrls || []), ...(complaint.progressImageUrls?.map(p => p.imageUrl) || []), ...(complaint.afterImageUrl ? [complaint.afterImageUrl] : [])];
                  return (
                    <TableRow key={complaint.id}>
                      <TableCell>
                          <div className="font-medium">{user?.name}</div>
                          <div className="text-sm text-muted-foreground hidden sm:block">{user?.email}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{complaint.category}</Badge>
                      </TableCell>
                       <TableCell className="max-w-[200px] sm:max-w-xs truncate">{complaint.description}</TableCell>
                      <TableCell className="hidden md:table-cell">{complaint.location}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {format(new Date(complaint.submittedAt), 'PPp')}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={complaint.status}
                          onValueChange={(value: ComplaintStatus) =>
                            handleStatusChange(complaint.id, value)
                          }
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Set status" />
                          </SelectTrigger>
                          <SelectContent>
                            {complaintStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {complaint.feedback ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span>{complaint.feedback.rating}/5</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="grid gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium leading-none">Feedback</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {complaint.feedback.comment}
                                  </p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {allImages.length > 0 && (
                           <Popover>
                             <PopoverTrigger asChild>
                               <Button variant="outline" size="sm" className="flex items-center gap-2">
                                 <Camera className="h-4 w-4" />
                                 <span>{allImages.length}</span>
                               </Button>
                             </PopoverTrigger>
                             <PopoverContent className="w-96">
                              <Carousel>
                                <CarouselContent>
                                  {allImages.map((img, index) => (
                                    <CarouselItem key={index}>
                                      <Image
                                        src={img}
                                        alt={`Complaint image ${index+1}`}
                                        width={400}
                                        height={300}
                                        className="rounded-md object-cover aspect-video"
                                      />
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                {allImages.length > 1 && <>
                                  <CarouselPrevious />
                                  <CarouselNext />
                                </>}
                              </Carousel>
                             </PopoverContent>
                           </Popover>
                        )}
                      </TableCell>
                      <TableCell className="space-y-2 flex flex-col items-start">
                          {complaint.status === 'Received' && (
                            <Button variant="outline" size="sm" onClick={() => handleProcessComplaint(complaint)} disabled={isProcessing}>
                              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                              AI Process
                            </Button>
                          )}
                          {complaint.status === 'Work in Progress' && (
                              <Button variant="outline" size="sm" onClick={() => handleAddPhotoClick(complaint.id, 'Work in Progress')}>
                                  <Camera className="mr-2 h-4 w-4"/> Add Photo
                              </Button>
                          )}
                          {complaint.status === 'Resolved' && !complaint.afterImageUrl && (
                              <Button variant="outline" size="sm" onClick={() => handleAddPhotoClick(complaint.id, 'Resolved')}>
                                  <Camera className="mr-2 h-4 w-4"/> Add Photo
                              </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {currentComplaintForDialog && suggestion && (
        <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                <DialogTitle>AI Complaint Processing Suggestions</DialogTitle>
                <DialogDescription>
                    The AI has analyzed the complaint and provided the following recommendations. Review and accept to update the complaint.
                </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Complaint</h4>
                        <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">{currentComplaintForDialog.description}</p>
                         {currentComplaintForDialog.beforeImageUrls && currentComplaintForDialog.beforeImageUrls[0] && (
                           <Image src={currentComplaintForDialog.beforeImageUrls[0]} alt="Complaint" width={300} height={225} className="rounded-lg object-cover" />
                        )}
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">AI Suggestions</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2"><Layers className="text-primary"/> <strong>Category:</strong> <Badge variant="outline">{suggestion.suggestedCategory}</Badge></div>
                            <div className="flex items-center gap-2"><Building className="text-primary"/> <strong>Department:</strong> {suggestion.recommendedDepartment}</div>
                            <div className="flex items-center gap-2"><Shield className="text-primary"/> <strong>Priority:</strong> {suggestion.priority}</div>
                            <div className="flex items-center gap-2"><UserIcon className="text-primary"/> <strong>Officer:</strong> {suggestion.assignedOfficer.name}</div>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-2 mt-4">Reasoning</h5>
                            <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">{suggestion.reasoning}</p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsSuggestionDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAcceptSuggestion}>Accept & Update</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

    </div>
  );
}


    