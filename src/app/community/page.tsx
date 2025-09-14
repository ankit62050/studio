'use client';

import { useState, useMemo } from 'react';
import { useComplaints } from '@/hooks/use-complaints';
import { Complaint } from '@/lib/types';
import { ComplaintCard } from '@/components/complaint-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortOption = 'priority' | 'upvotes' | 'recent' | 'locality';

export default function CommunityPage() {
  const { complaints } = useComplaints();
  const [sortOption, setSortOption] = useState<SortOption>('priority');

  const sortedComplaints = useMemo(() => {
    const sorted = [...complaints];
    switch (sortOption) {
      case 'upvotes':
        sorted.sort((a, b) => (b.upvotedBy?.length || 0) - (a.upvotedBy?.length || 0));
        break;
      case 'recent':
        sorted.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        break;
      case 'locality':
        sorted.sort((a, b) => a.location.localeCompare(b.location));
        break;
      case 'priority':
        // A simple priority score: 1 point per upvote, and more points for recent items
        const getPriorityScore = (complaint: Complaint) => {
          const upvoteScore = (complaint.upvotedBy?.length || 0) * 2;
          const timeDiff = Date.now() - new Date(complaint.submittedAt).getTime();
          const hoursAgo = timeDiff / (1000 * 60 * 60);
          const recencyScore = Math.max(0, 100 - hoursAgo / 24); // More points for last 100 days
          return upvoteScore + recencyScore;
        };
        sorted.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
        break;
    }
    return sorted;
  }, [complaints, sortOption]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Feed</h1>
          <p className="text-muted-foreground">
            See what issues are being reported in the community. Upvote to show your support.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="upvotes">Popularity</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="locality">Locality</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedComplaints.map((complaint) => (
          <ComplaintCard key={complaint.id} complaint={complaint} />
        ))}
      </div>
    </div>
  );
}
