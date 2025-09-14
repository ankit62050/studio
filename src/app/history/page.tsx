'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Complaint, ComplaintStatus } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { useComplaints } from '@/hooks/use-complaints';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

function FeedbackForm({ complaintId, onSubmit }: { complaintId: string, onSubmit: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { addFeedback } = useComplaints();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        variant: 'destructive',
        title: 'Rating Required',
        description: 'Please select a rating before submitting.',
      });
      return;
    }
    addFeedback(complaintId, { rating, comment });
    toast({
      title: 'Feedback Submitted!',
      description: 'Thank you for your feedback.',
    });
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
      <h4 className="font-semibold">Submit Feedback</h4>
      <div>
        <Label className="mb-2 block">Rating</Label>
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
                <Star
                    key={value}
                    className={`h-6 w-6 cursor-pointer transition-colors ${
                        value <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                    onClick={() => setRating(value)}
                />
            ))}
        </div>
      </div>
      <div>
        <Label htmlFor={`comment-${complaintId}`}>Comments (optional)</Label>
        <Textarea
          id={`comment-${complaintId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience..."
        />
      </div>
      <Button type="submit">Submit Feedback</Button>
    </form>
  );
}

function HistoryPageContent() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  
  type FilterStatus = 'all' | 'pending' | 'resolved';
  const [filter, setFilter] = useState<FilterStatus>(initialStatus as FilterStatus);

  if (!user) return null;

  const userComplaints = useMemo(() => {
    return complaints
      .filter((c) => c.userId === user.id)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [complaints, user.id]);

  const filteredComplaints = useMemo(() => {
    if (filter === 'all') {
      return userComplaints;
    }
    if (filter === 'pending') {
      return userComplaints.filter(c => c.status !== 'Resolved');
    }
    if (filter === 'resolved') {
      return userComplaints.filter(c => c.status === 'Resolved');
    }
    return userComplaints;
  }, [userComplaints, filter]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Complaint History</h1>
        <p className="text-muted-foreground">
          Here is a list of all the complaints you have submitted.
        </p>
      </div>

       <div className="flex space-x-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All Complaints</Button>
        <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>Pending</Button>
        <Button variant={filter === 'resolved' ? 'default' : 'outline'} onClick={() => setFilter('resolved')}>Resolved</Button>
      </div>

      {filteredComplaints.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {filter === 'all' && "You have not submitted any complaints yet."}
              {filter === 'pending' && "You have no pending complaints."}
              {filter === 'resolved' && "You have no resolved complaints."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint: Complaint) => (
            <Card key={complaint.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{complaint.category}</CardTitle>
                    <p className="text-sm text-muted-foreground">{complaint.location}</p>
                  </div>
                  <Badge className={cn("text-xs font-semibold", getStatusColor(complaint.status))}>
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {complaint.progressImageUrls.map((progress, index) => (
                                <div key={index}>
                                    <h5 className="font-medium text-sm text-muted-foreground mb-1">{progress.status}</h5>
                                     <Image src={progress.imageUrl} alt={`Progress update for ${progress.status}`} width={300} height={200} className="rounded-lg object-cover"/>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 {complaint.status === 'Resolved' && (
                  <>
                    {complaint.feedback ? (
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold">Your Feedback</h4>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="flex">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <Star
                                    key={value}
                                    className={`h-5 w-5 ${
                                        value <= complaint.feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                    }`}
                                />
                            ))}
                           </div>
                           <span className="text-sm font-bold">({complaint.feedback.rating}/5)</span>
                        </div>
                        <p className="text-muted-foreground mt-2">{complaint.feedback.comment}</p>
                      </div>
                    ) : (
                      <FeedbackForm complaintId={complaint.id} onSubmit={() => {}}/>
                    )}
                  </>
                )}

                <div className="text-sm text-muted-foreground flex justify-between pt-4 border-t">
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

export default function HistoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoryPageContent />
    </Suspense>
  );
}
