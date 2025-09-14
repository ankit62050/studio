'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Complaint, ComplaintStatus } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { useComplaints } from '@/hooks/use-complaints';

const getStatusColor = (status: ComplaintStatus) => {
  switch (status) {
    case 'Resolved':
      return 'bg-green-100 text-green-800';
    case 'Work in Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Under Review':
      return 'bg-yellow-100 text-yellow-800';
    case 'Received':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function HistoryPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();

  if (!user) return null;

  const userComplaints = complaints
    .filter((c) => c.userId === user.id)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Complaint History</h1>
        <p className="text-muted-foreground">
          Here is a list of all the complaints you have submitted.
        </p>
      </div>

      {userComplaints.length === 0 ? (
        <p>You have not submitted any complaints yet.</p>
      ) : (
        <div className="space-y-4">
          {userComplaints.map((complaint: Complaint) => (
            <Card key={complaint.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{complaint.category}</CardTitle>
                    <CardDescription>{complaint.location}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(complaint.status)}>
                    {complaint.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{complaint.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {complaint.beforeImageUrl && (
                         <div>
                            <h4 className="font-semibold mb-2">Before</h4>
                            <Image src={complaint.beforeImageUrl} alt="Before" width={600} height={400} className="rounded-lg object-cover" />
                        </div>
                    )}
                    {complaint.afterImageUrl && (
                        <div>
                            <h4 className="font-semibold mb-2">After</h4>
                            <Image src={complaint.afterImageUrl} alt="After" width={600} height={400} className="rounded-lg object-cover"/>
                        </div>
                    )}
                </div>

                {complaint.progressImageUrls && complaint.progressImageUrls.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2">Progress Updates</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {complaint.progressImageUrls.map((progress, index) => (
                                <div key={index}>
                                    <h5 className="font-medium text-sm text-muted-foreground mb-1">{progress.status}</h5>
                                     <Image src={progress.imageUrl} alt={`Progress update for ${progress.status}`} width={600} height={400} className="rounded-lg object-cover"/>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>
                    Submitted: {format(new Date(complaint.submittedAt), 'PPp')}
                  </span>
                  {complaint.resolvedAt && (
                    <span>
                      Resolved: {format(new Date(complaint.resolvedAt), 'PPp')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
