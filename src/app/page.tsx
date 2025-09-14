'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { PlusCircle, FileText, Users, Map, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
  
  if (!user) return null;

  const services: ServiceCardProps[] = [
    {
      href: '/submit',
      icon: <PlusCircle className="w-7 h-7" />,
      title: 'Submit Complaint',
      description: 'Report a new civic issue with details and a photo.',
    },
    {
      href: '/history',
      icon: <FileText className="w-7 h-7" />,
      title: 'My History',
      description: 'Track the status and updates of all your submissions.',
    },
    {
      href: '/community',
      icon: <Users className="w-7 h-7" />,
      title: 'Community Feed',
      description: 'See what issues others are reporting in the community.',
    },
    {
      href: '/map',
      icon: <Map className="w-7 h-7" />,
      title: 'Nearby Issues',
      description: 'View a map of all reported complaints in the area.',
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-background to-primary/10">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome, {user.name}!</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Ready to make a difference? Report an issue or see what's happening in your community.
                </p>
            </div>
             <Button asChild size="lg">
                <Link href="/submit">
                  <PlusCircle className="mr-2" /> Report a Civic Issue
                </Link>
              </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Our Services</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.href} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
}
