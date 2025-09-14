'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Complaint, ComplaintStatus, complaintStatuses, User, Officer } from '@/lib/types';
import { users, officers } from '@/lib/data';
import { format } from 'date-fns';
import { BarChart, FileText, Hourglass, CheckCircle, Camera, Star, Sparkles, Loader2, User as UserIcon, Building, Shield, Layers } from 'lucide-react';
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

export default function AdminDashboardPage() {
  const { complaints, updateComplaintStatus, addComplaintImage, updateComplaint } = useComplaints();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentComplaintAction = useRef<{ complaintId: string; status: ComplaintStatus } | null>(null);
  const { toast } = useToast();

  const [processingComplaintId, setProcessingComplaintId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<ProcessComplaintOutput | null>(null);
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [currentComplaintIdForDialog, setCurrentComplaintIdForDialog] = useState<string | null>(null);

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
          photoDataUri: complaint.beforeImageUrl,
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


  const statusCounts = complaintStatuses.reduce((acc, status) => {
    acc[status] = complaints.filter(c => c.status === status).length;
    return acc;
  }, {} as Record<ComplaintStatus, number>);

  const currentComplaintForDialog = complaints.find(c => c.id === currentComplaintIdForDialog);


  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of all citizen complaints.</p>
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
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts['Under Review'] + statusCounts['Received']}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work in Progress</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts['Work in Progress']}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts['Resolved']}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
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
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((complaint) => {
                  const user = getUserById(complaint.userId);
                  const isProcessing = processingComplaintId === complaint.id;
                  return (
                    <TableRow key={complaint.id}>
                      <TableCell>
                          <div className="font-medium">{user?.name}</div>
                          <div className="text-sm text-muted-foreground">{user?.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{complaint.category}</Badge>
                      </TableCell>
                       <TableCell className="max-w-xs truncate">{complaint.description}</TableCell>
                      <TableCell>{complaint.location}</TableCell>
                      <TableCell>
                        {format(new Date(complaint.submittedAt), 'PPp')}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={complaint.status}
                          onValueChange={(value: ComplaintStatus) =>
                            handleStatusChange(complaint.id, value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
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
                      <TableCell>
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
                        <div className="flex gap-2">
                          {complaint.beforeImageUrl && (
                              <Image
                                  src={complaint.beforeImageUrl}
                                  alt="Complaint image"
                                  width={100}
                                  height={75}
                                  className="rounded-md object-cover"
                              />
                          )}
                          {complaint.afterImageUrl && (
                              <Image
                                  src={complaint.afterImageUrl}
                                  alt="Resolved image"
                                  width={100}
                                  height={75}
                                  className="rounded-md object-cover"
                              />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="space-y-2">
                          {complaint.status === 'Received' && (
                            <Button variant="outline" size="sm" onClick={() => handleProcessComplaint(complaint)} disabled={isProcessing}>
                              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                              AI Process
                            </Button>
                          )}
                          {complaint.status === 'Work in Progress' && (
                              <Button variant="outline" size="sm" onClick={() => handleAddPhotoClick(complaint.id, 'Work in Progress')}>
                                  <Camera className="mr-2 h-4 w-4"/> Add Progress Photo
                              </Button>
                          )}
                          {complaint.status === 'Resolved' && !complaint.afterImageUrl && (
                              <Button variant="outline" size="sm" onClick={() => handleAddPhotoClick(complaint.id, 'Resolved')}>
                                  <Camera className="mr-2 h-4 w-4"/> Add After Photo
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
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Complaint</h4>
                        <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">{currentComplaintForDialog.description}</p>
                         {currentComplaintForDialog.beforeImageUrl && (
                           <Image src={currentComplaintForDialog.beforeImageUrl} alt="Complaint" width={300} height={225} className="rounded-lg object-cover" />
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
