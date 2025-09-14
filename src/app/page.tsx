'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { PlusCircle, Hourglass, CheckCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { complaints } from '@/lib/data';

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) return null; // Should be handled by AppWrapper, but as a fallback.

  const userComplaints = complaints.filter(c => c.userId === user.id);
  const resolvedCount = userComplaints.filter(c => c.status === 'Resolved').length;
  const pendingCount = userComplaints.length - resolvedCount;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground">Here's a summary of your activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userComplaints.length}</div>
            <p className="text-xs text-muted-foreground">
              complaints submitted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              awaiting resolution
            </p>
          </CardContent>
        </Card>
        <Card className="bg-accent/20 border-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
            <CheckCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{resolvedCount}</div>
            <p className="text-xs text-muted-foreground">
              successfully addressed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">Have something to report?</h2>
        <Button size="lg" asChild>
          <Link href="/submit">
            <PlusCircle className="mr-2 h-5 w-5" />
            Submit a New Complaint
          </Link>
        </Button>
      </div>
    </div>
  );
}
