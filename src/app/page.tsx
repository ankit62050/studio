
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useMemo, useState } from 'react';
import { useComplaints } from '@/hooks/use-complaints';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Complaint, complaintCategories } from '@/lib/types';
import { PlusCircle, FileText, Users, Map as MapIcon, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { DotMap } from '@/components/ui/dot-map';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const content = {
  en: {
    badge: 'Beta v0.1.0 now available',
    action: 'Get Started',
    title: 'Voice your concerns. Drive the change.',
    description: "JANConnect Lite is a public platform to report civic issues. Submit complaints, track their status, and see what's happening in your community.",
    getStarted: 'Get Started with Google',
    viewComplaints: 'View Complaints',
    welcomeBack: "Welcome back",
    signInToAccount: "Sign in to your account",
    loginWithGoogle: "Login with Google",
    or: "or",
    emailLabel: "Email",
    emailPlaceholder: "Enter your email address",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    signIn: "Sign in",
    forgotPassword: "Forgot password?",
    appName: "JANConnect Lite",
    appSlogan: "Sign in to report civic issues and connect with your community."
  },
  hi: {
    badge: 'बीटा v0.1.0 अब उपलब्ध है',
    action: 'शुरू हो जाओ',
    title: 'अपनी चिंताएं व्यक्त करें। बदलाव लाएं।',
    description: 'JANConnect लाइट नागरिक मुद्दों की रिपोर्ट करने के लिए एक सार्वजनिक मंच है। शिकायतें दर्ज करें, उनकी स्थिति को ट्रैक करें और देखें कि आपके समुदाय में क्या हो रहा है।',
    getStarted: 'Google के साथ आरंभ करें',
    viewComplaints: 'शिकायतें देखें',
    welcomeBack: "वापसी पर स्वागत है",
    signInToAccount: "अपने खाते में साइन इन करें",
    loginWithGoogle: "Google से लॉग इन करें",
    or: "या",
    emailLabel: "ईमेल",
    emailPlaceholder: "अपना ईमेल पता दर्ज करें",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड डालें",
    signIn: "साइन इन करें",
    forgotPassword: "पासवर्ड भूल गए?",
    appName: "जन कनेक्ट लाइट",
    appSlogan: "नागरिक मुद्दों की रिपोर्ट करने और अपने समुदाय से जुड़ने के लिए साइन इन करें।"
  }
};

function SignInCard() {
    const { login } = useAuth();
    const { language } = useLanguage();
    const pageContent = content[language];
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div className="min-h-[calc(100vh-10rem)] w-full flex items-center justify-center p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl overflow-hidden rounded-2xl flex bg-card shadow-xl border"
        >
            {/* Left side - Map */}
            <div className="hidden md:block w-1/2 h-[600px] relative overflow-hidden border-r">
            <div className="absolute inset-0 bg-primary/5">
                <DotMap />
                
                {/* Logo and text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mb-6"
                >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                    <ArrowRight className="text-primary-foreground h-6 w-6" />
                    </div>
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70"
                >
                    {pageContent.appName}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-sm text-center text-muted-foreground max-w-xs"
                >
                    {pageContent.appSlogan}
                </motion.p>
                </div>
            </div>
            </div>
            
            {/* Right side - Sign In Form */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-card">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl md:text-3xl font-bold mb-1 ">{pageContent.welcomeBack}</h1>
                <p className="text-muted-foreground mb-8">{pageContent.signInToAccount}</p>
                
                <div className="mb-6">
                <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => login('citizen')}
                >
                     <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        />
                    </svg>
                    {pageContent.loginWithGoogle}
                </Button>
                </div>
                
                <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">{pageContent.or}</span>
                </div>
                </div>
                
                <form className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                    {pageContent.emailLabel} <span className="text-primary">*</span>
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={pageContent.emailPlaceholder}
                        required
                        className="w-full"
                    />
                </div>
                
                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                    {pageContent.passwordLabel} <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                    <Input
                        id="password"
                        type={isPasswordVisible ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={pageContent.passwordPlaceholder}
                        required
                        className="w-full pr-10"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                </div>
                
                <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    className="pt-2"
                >
                    <Button
                    type="submit"
                    className="w-full relative overflow-hidden"
                    onClick={() => login('citizen')}
                    >
                    <span className="flex items-center justify-center">
                        {pageContent.signIn}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                    {isHovered && (
                        <motion.span
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        style={{ filter: "blur(8px)" }}
                        />
                    )}
                    </Button>
                </motion.div>
                
                <div className="text-center mt-6">
                    <a href="#" className="text-primary hover:underline text-sm transition-colors">
                    {pageContent.forgotPassword}
                    </a>
                </div>
                </form>
            </motion.div>
            </div>
        </motion.div>
        </div>
    );
};


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
  
  if (!user) {
     return <SignInCard />
  }

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
      icon: <MapIcon className="w-7 h-7" />,
      title: 'Nearby Issues',
      description: 'View a map of all reported complaints in the area.',
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
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome, {user.name}!</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Ready to make a difference? Report an issue or see what's happening in your community.
                </p>
            </div>
             <Button asChild size="lg" className="w-full sm:w-auto">
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

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Community Trends</h2>
        <div className="grid gap-8 md:grid-cols-2">
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
    </div>
  );
}
