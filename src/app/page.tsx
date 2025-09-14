'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { PlusCircle, Hourglass, CheckCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { useComplaints } from '@/hooks/use-complaints';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Complaint, complaintCategories } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { subDays, format, startOfDay } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function DashboardPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  
  if (!user) return null; // Should be handled by AppWrapper, but as a fallback.

  const userComplaints = complaints.filter(c => c.userId === user.id);
  const resolvedCount = userComplaints.filter(c => c.status === 'Resolved').length;
  const pendingCount = userComplaints.length - resolvedCount;

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
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground">Here's a summary of your activity and community trends.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/history?status=all">
          <Card className="transition-shadow hover:shadow-md h-full">
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
        </Link>
        <Link href="/history?status=pending">
          <Card className="transition-shadow hover:shadow-md h-full">
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
        </Link>
        <Link href="/history?status=resolved">
          <Card className="bg-accent/20 border-accent transition-shadow hover:shadow-md h-full">
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
        </Link>
      </div>

      <div className="text-center py-8 border-y">
        <h2 className="text-xl font-semibold mb-4">Have something to report?</h2>
        <Button size="lg" asChild>
          <Link href="/submit">
            <PlusCircle className="mr-2 h-5 w-5" />
            Submit a New Complaint
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Community Trends</h2>
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Complaint Volume (Last 30 Days)</CardTitle>
                <CardDescription>Daily number of new complaints submitted.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <ResponsiveContainer>
                    <BarChart data={volumeData}>
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
                    </BarChart>
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
                    <BarChart data={categoryData} layout="vertical">
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
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
