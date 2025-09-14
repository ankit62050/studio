'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Complaint, User, Comment } from '@/lib/types';
import { useComplaints } from '@/hooks/use-complaints';
import { useAuth } from '@/hooks/use-auth';
import { users } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ArrowUp, MessageSquare, MapPin, Trash2, Droplet, TrafficCone, SprayCan, X, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

const categoryIcons: { [key: string]: React.ReactNode } = {
  "Garbage": <Trash2 className="h-4 w-4" />,
  "Pothole": <MapPin className="h-4 w-4" />,
  "Traffic Light": <TrafficCone className="h-4 w-4" />,
  "Graffiti": <SprayCan className="h-4 w-4" />,
  "Water Leak": <Droplet className="h-4 w-4" />,
  "Other": <div/>,
};

const getStatusColor = (status: Complaint['status']) => {
  switch (status) {
    case 'Resolved': return 'border-green-500 text-green-500';
    case 'Work in Progress': return 'border-blue-500 text-blue-500';
    case 'Under Review': return 'border-yellow-500 text-yellow-500';
    case 'Received': return 'border-gray-500 text-gray-500';
    default: return 'border-gray-500 text-gray-500';
  }
};

const getUserById = (userId: string): User | undefined => {
  return users.find(u => u.id === userId);
};

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const { user } = useAuth();
  const { toggleUpvote, addComment, deleteComment } = useComplaints();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const complaintUser = getUserById(complaint.userId);

  const handleAddComment = () => {
    if (!user || !newComment.trim()) return;
    const comment: Comment = {
      id: `comment-${complaint.id}-${Date.now()}`,
      userId: user.id,
      text: newComment,
      createdAt: new Date().toISOString(),
    };
    addComment(complaint.id, comment);
    setNewComment('');
  };

  const images = [complaint.beforeImageUrl, ...complaint.progressImageUrls?.map(p => p.imageUrl) ?? [], complaint.afterImageUrl].filter(Boolean) as string[];

  const comments = complaint.comments || [];
  const upvotedBy = complaint.upvotedBy || [];
  const hasUpvoted = user ? upvotedBy.includes(user.id) : false;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarFallback><UserIcon className="h-5 w-5"/></AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">Anonymous</div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(complaint.submittedAt), { addSuffix: true })}
            </div>
          </div>
          <Badge variant="outline" className={cn("ml-auto whitespace-nowrap", getStatusColor(complaint.status))}>{complaint.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {complaint.location}</div>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-md">{categoryIcons[complaint.category]} {complaint.category}</div>
        </div>
        
        {images.length > 0 && (
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index}>
                  <Image src={img} alt={`Complaint image ${index + 1}`} width={600} height={400} className="rounded-lg object-cover aspect-[4/3]" />
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </>}
          </Carousel>
        )}
        
        <p className="text-sm line-clamp-3">{complaint.description}</p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex justify-between w-full">
            <div className="flex gap-2">
                <Button variant={hasUpvoted ? 'default' : 'outline'} size="sm" onClick={() => toggleUpvote(complaint.id)} disabled={!user}>
                    <ArrowUp className={cn("mr-2 h-4 w-4", hasUpvoted && "fill-current")} /> {upvotedBy.length}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowComments(!showComments)}>
                    <MessageSquare className="mr-2 h-4 w-4" /> {comments.length}
                </Button>
            </div>
        </div>

        {showComments && (
          <div className="w-full space-y-4 pt-4 border-t">
            <h4 className="font-semibold">Comments</h4>
            <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                    comments.map(comment => {
                        const commentUser = getUserById(comment.userId);
                        return (
                            <div key={comment.id} className="flex items-start gap-3 group">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><UserIcon className="h-4 w-4"/></AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">Anonymous</span>
                                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                                    </div>
                                    <p className="text-sm">{comment.text}</p>
                                </div>
                                {user && user.id === comment.userId && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                      onClick={() => deleteComment(complaint.id, comment.id)}
                                    >
                                      <X className="h-4 w-4 text-muted-foreground" />
                                      <span className="sr-only">Delete comment</span>
                                    </Button>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
            {user && (
              <div className="flex items-start gap-3 pt-4 border-t">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="w-full space-y-2">
                    <Textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="min-h-[60px]"
                    />
                    <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>Post Comment</Button>
                  </div>
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
