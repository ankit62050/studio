'use client';

import { useRef } from 'react';
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
import { Complaint, ComplaintStatus, complaintStatuses, User } from '@/lib/types';
import { users } from '@/lib/data';
import { format } from 'date-fns';
import { BarChart, FileText, Hourglass, CheckCircle, Camera, Star } from 'lucide-react';
import Image from 'next/image';
import { useComplaints } from '@/hooks/use-complaints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function AdminDashboardPage() {
  const { complaints, updateComplaintStatus, addComplaintImage } = useComplaints();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentComplaintAction = useRef<{ complaintId: string; status: ComplaintStatus } | null>(null);

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
    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    currentComplaintAction.current = null;
  };

  const statusCounts = complaintStatuses.reduce((acc, status) => {
    acc[status] = complaints.filter(c => c.status === status).length;
    return acc;
  }, {} as Record<ComplaintStatus, number>);

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
                  return (
                    <TableRow key={complaint.id}>
                      <TableCell>
                          <div className="font-medium">{user?.name}</div>
                          <div className="text-sm text-muted-foreground">{user?.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{complaint.category}</Badge>
                      </TableCell>
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
                          {complaint.status === 'Work in Progress' && (
                              <Button variant="outline" size="sm" onClick={() => handleAddPhotoClick(complaint.id, 'Work in Progress')}>
                                  <Camera className="mr-2 h-4 w-4"/> Add Progress Photo
                              </Button>
                          )}
                          {complaint.status === 'Resolved' && (
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
    </div>
  );
}
