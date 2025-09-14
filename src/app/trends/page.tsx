'use client';

import { useMemo } from 'react';
import { useComplaints } from '@/hooks/use-complaints';
import { Complaint, complaintCategories } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format, startOfDay } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function TrendsPage() {
  const { complaints } = useComplaints();

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
        <h1 className="text-3xl font-bold tracking-tight">Live Trends</h1>
        <p className="text-muted-foreground">
          Analytics on community-reported issues.
        </p>
      </div>

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
  );
}
