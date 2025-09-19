
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useMemo } from 'react';
import { useComplaints } from '@/hooks/use-complaints';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Complaint, complaintCategories } from '@/lib/types';
import { PlusCircle, FileText, Users, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';

const content = {
    en: {
        welcome: "Welcome",
        welcomeDescription: "Ready to make a difference? Report an issue or see what's happening in your community.",
        reportIssue: "Report a Civic Issue",
        services: "Our Services",
        communityTrends: "Community Trends",
        complaintVolumeTitle: "Complaint Volume (Last 30 Days)",
        complaintVolumeDescription: "Daily number of new complaints submitted.",
        categoryBreakdownTitle: "Category Breakdown",
        categoryBreakdownDescription: "Most common types of complaints reported.",
        serviceSubmitTitle: "Submit Complaint",
        serviceSubmitDescription: "Report a new civic issue with details and a photo.",
        serviceHistoryTitle: "My History",
        serviceHistoryDescription: "Track the status and updates of all your submissions.",
        serviceCommunityTitle: "Community Feed",
        serviceCommunityDescription: "See what issues others are reporting in the community.",
        serviceMapTitle: "Nearby Issues",
        serviceMapDescription: "View a map of all reported complaints in the area.",
        loginMessage: "Please log in to access the dashboard."
    },
    hi: {
        welcome: "आपका स्वागत है",
        welcomeDescription: "बदलाव लाने के लिए तैयार हैं? किसी समस्या की रिपोर्ट करें या देखें कि आपके समुदाय में क्या हो रहा है।",
        reportIssue: "एक नागरिक समस्या की रिपोर्ट करें",
        services: "हमारी सेवाएँ",
        communityTrends: "सामुदायिक रुझान",
        complaintVolumeTitle: "शिकायत की मात्रा (पिछले 30 दिन)",
        complaintVolumeDescription: "प्रतिदिन प्रस्तुत की गई नई शिकायतों की संख्या।",
        categoryBreakdownTitle: "श्रेणी के अनुसार विवरण",
        categoryBreakdownDescription: "रिपोर्ट की गई सबसे आम प्रकार की शिकायतें।",
        serviceSubmitTitle: "शिकायत दर्ज करें",
        serviceSubmitDescription: "विवरण और फोटो के साथ एक नई नागरिक समस्या की रिपोर्ट करें।",
        serviceHistoryTitle: "मेरा इतिहास",
        serviceHistoryDescription: "अपने सभी सबमिशन की स्थिति और अपडेट ट्रैक करें।",
        serviceCommunityTitle: "सामुदायिक फ़ीड",
        serviceCommunityDescription: "देखें कि समुदाय में अन्य लोग किन मुद्दों की रिपोर्ट कर रहे हैं।",
        serviceMapTitle: "आस-पास के मुद्दे",
        serviceMapDescription: "क्षेत्र में रिपोर्ट की गई सभी शिकायतों کا نقشہ دیکھیں۔",
        loginMessage: "कृपया डैशबोर्ड तक पहुंचने के लिए लॉग इन करें।"
    }
}


type ServiceCardProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

function ServiceCard({ href, icon, title, description }: ServiceCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const { language } = useLanguage();
  const pageContent = content[language];
  
  if (!user) {
    // This part can be improved to show a proper landing/login page
    return (
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight mb-4">{content.en.welcome} to JANConnect Lite</h1>
                <p className="text-muted-foreground mb-8">{pageContent.loginMessage}</p>
            </div>
        </div>
    )
  }

  const services: ServiceCardProps[] = [
    {
      href: '/submit',
      icon: <PlusCircle className="w-7 h-7" />,
      title: pageContent.serviceSubmitTitle,
      description: pageContent.serviceSubmitDescription,
    },
    {
      href: '/history',
      icon: <FileText className="w-7 h-7" />,
      title: pageContent.serviceHistoryTitle,
      description: pageContent.serviceHistoryDescription,
    },
    {
      href: '/community',
      icon: <Users className="w-7 h-7" />,
      title: pageContent.serviceCommunityTitle,
      description: pageContent.serviceCommunityDescription,
    },
    {
      href: '/map',
      icon: <MapIcon className="w-7 h-7" />,
      title: pageContent.serviceMapTitle,
      description: pageContent.serviceMapDescription,
    },
  ];

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
      <Card className="bg-gradient-to-br from-background to-primary/10">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{pageContent.welcome}, {user.name}!</h1>
                <p className="text-muted-foreground max-w-2xl">
                    {pageContent.welcomeDescription}
                </p>
            </div>
             <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/submit">
                  <PlusCircle className="mr-2" /> {pageContent.reportIssue}
                </Link>
              </Button>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">{pageContent.services}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.href} {...service} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">{pageContent.communityTrends}</h2>
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{pageContent.complaintVolumeTitle}</CardTitle>
                <CardDescription>{pageContent.complaintVolumeDescription}</CardDescription>
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
                <CardTitle>{pageContent.categoryBreakdownTitle}</CardTitle>
                <CardDescription>{pageContent.categoryBreakdownDescription}</CardDescription>
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
    </div>
  );
}

    

    