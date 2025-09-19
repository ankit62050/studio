
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ComplaintCard } from '@/components/complaint-card';
import { useAuth } from '@/hooks/use-auth';
import { useComplaints } from '@/hooks/use-complaints';
import { FileText, Hourglass, CheckCircle, ArrowRight } from 'lucide-react';
import { ComplaintStatus, complaintStatuses } from '@/lib/types';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

const content = {
    en: {
        dashboardTitle: 'Citizen Dashboard',
        dashboardDescription: 'Submit and track civic issues in your area.',
        quickActions: 'Quick Actions',
        newComplaint: 'New Complaint',
        newComplaintDesc: 'Report a new issue like a pothole or garbage problem.',
        viewHistory: 'View History',
        viewHistoryDesc: 'Check the status of your past complaints.',
        communityFeed: 'Community Feed',
        communityFeedDesc: 'See what issues others are reporting.',
        complaintStats: 'My Complaint Stats',
        total: 'Total',
        pending: 'Pending',
        resolved: 'Resolved',
        recentComplaints: 'My Recent Complaints',
        noComplaints: 'You have not submitted any complaints yet.',
        viewAll: 'View All',
    },
    hi: {
        dashboardTitle: 'नागरिक डैशबोर्ड',
        dashboardDescription: 'अपने क्षेत्र में नागरिक मुद्दों को सबमिट और ट्रैक करें।',
        quickActions: 'त्वरित कार्रवाई',
        newComplaint: 'नई शिकायत',
        newComplaintDesc: 'किसी नए मुद्दे जैसे गड्ढे या कचरे की समस्या की रिपोर्ट करें।',
        viewHistory: 'इतिहास देखें',
        viewHistoryDesc: 'अपनी पिछली शिकायतों की स्थिति जांचें।',
        communityFeed: 'कम्युनिटी फीड',
        communityFeedDesc: 'देखें कि दूसरे कौन से मुद्दे रिपोर्ट कर रहे हैं।',
        complaintStats: 'मेरी शिकायतों के आँकड़े',
        total: 'कुल',
        pending: 'लंबित',
        resolved: 'हल',
        recentComplaints: 'मेरी हाल की शिकायतें',
        noComplaints: 'आपने अभी तक कोई शिकायत दर्ज नहीं की है।',
        viewAll: 'सभी देखें',
    }
}


export default function DashboardPage() {
    const { user } = useAuth();
    const { complaints } = useComplaints();
    const { language } = useLanguage();
    const pageContent = content[language];

    const userComplaints = useMemo(() => {
        if (!user) return [];
        return complaints.filter(c => c.userId === user.id);
    }, [complaints, user]);

    const statusCounts = useMemo(() => {
        const counts = complaintStatuses.reduce((acc, status) => {
            acc[status] = 0;
            return acc;
        }, {} as Record<ComplaintStatus, number>);

        userComplaints.forEach(c => {
            counts[c.status]++;
        });

        return counts;
    }, [userComplaints]);

    const pendingCount = statusCounts['Received'] + statusCounts['Under Review'] + statusCounts['Work in Progress'];

    const recentComplaints = useMemo(() => {
        return userComplaints.slice(0, 3);
    }, [userComplaints]);

    if (!user) {
        return null; // Or a loading spinner
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{pageContent.dashboardTitle}</h1>
                <p className="text-muted-foreground">{pageContent.dashboardDescription}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>{pageContent.quickActions}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href="/submit" passHref>
                            <Button className="w-full justify-start h-auto p-4" variant="outline">
                                <div className="text-left">
                                    <p className="font-semibold">{pageContent.newComplaint}</p>
                                    <p className="text-sm text-muted-foreground">{pageContent.newComplaintDesc}</p>
                                </div>
                            </Button>
                        </Link>
                         <Link href="/history" passHref>
                            <Button className="w-full justify-start h-auto p-4" variant="outline">
                                <div className="text-left">
                                    <p className="font-semibold">{pageContent.viewHistory}</p>
                                    <p className="text-sm text-muted-foreground">{pageContent.viewHistoryDesc}</p>
                                </div>
                            </Button>
                        </Link>
                         <Link href="/community" passHref>
                           <Button className="w-full justify-start h-auto p-4" variant="outline">
                                <div className="text-left">
                                    <p className="font-semibold">{pageContent.communityFeed}</p>
                                    <p className="text-sm text-muted-foreground">{pageContent.communityFeedDesc}</p>
                                </div>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{pageContent.complaintStats}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <Card className="p-4">
                                    <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                                    <p className="text-2xl font-bold mt-2">{userComplaints.length}</p>
                                    <p className="text-sm text-muted-foreground">{pageContent.total}</p>
                                </Card>
                            </div>
                            <div>
                                <Card className="p-4">
                                    <Hourglass className="h-8 w-8 mx-auto text-primary" />
                                    <p className="text-2xl font-bold mt-2">{pendingCount}</p>
                                    <p className="text-sm text-muted-foreground">{pageContent.pending}</p>
                                </Card>
                            </div>
                            <div>
                                <Card className="p-4">
                                    <CheckCircle className="h-8 w-8 mx-auto text-accent" />
                                    <p className="text-2xl font-bold mt-2">{statusCounts.Resolved}</p>
                                    <p className="text-sm text-muted-foreground">{pageContent.resolved}</p>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold tracking-tight">{pageContent.recentComplaints}</h2>
                     {userComplaints.length > 3 && (
                        <Link href="/history" passHref>
                           <Button variant="ghost">
                                {pageContent.viewAll} <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                        </Link>
                    )}
                </div>
                 {recentComplaints.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recentComplaints.map((complaint) => (
                           <ComplaintCard key={complaint.id} complaint={complaint} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-center text-muted-foreground">{pageContent.noComplaints}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
