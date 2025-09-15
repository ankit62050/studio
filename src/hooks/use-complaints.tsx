'use client';

import type { Complaint, ComplaintStatus, Feedback, Comment } from '@/lib/types';
import { complaints as initialComplaints } from '@/lib/data';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from './use-auth';

interface ComplaintsContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Complaint) => void;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus) => void;
  updateComplaint: (complaintId: string, data: Partial<Complaint>) => void;
  addComplaintImage: (complaintId: string, imageUrl: string, status: ComplaintStatus) => void;
  addFeedback: (complaintId: string, feedback: Feedback) => void;
  toggleUpvote: (complaintId: string) => void;
  addComment: (complaintId: string, comment: Comment) => void;
  deleteComment: (complaintId: string, commentId: string) => void;
  deleteComplaint: (complaintId: string) => void;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    try {
      const storedComplaints = localStorage.getItem('complaints');
      let complaintsData: Complaint[] = [];
      if (storedComplaints) {
        complaintsData = JSON.parse(storedComplaints);
      } else {
        // Add upvotedBy to initial data if it's missing
        complaintsData = initialComplaints.map(c => ({
            ...c,
            upvotedBy: c.upvotedBy || [],
        }));
      }
      // Data hydration: Ensure all complaints have upvotes and comments
      const hydratedComplaints = complaintsData.map(c => ({
        ...c,
        upvotedBy: c.upvotedBy || [],
        comments: c.comments || [],
      }));
      setComplaints(hydratedComplaints);
    } catch (error) {
      console.error("Could not parse complaints from localStorage", error);
      setComplaints(initialComplaints);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('complaints', JSON.stringify(complaints));
    }
  }, [complaints, isLoaded]);

  const addComplaint = useCallback((complaint: Complaint) => {
    setComplaints(prev => [{ ...complaint, upvotedBy: [], comments: [] }, ...prev]);
  }, []);

  const updateComplaintStatus = useCallback((complaintId: string, status: ComplaintStatus) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          const updatedComplaint = { ...c, status };
          if (status === 'Resolved' && !c.resolvedAt) {
            updatedComplaint.resolvedAt = new Date().toISOString();
          }
          return updatedComplaint;
        }
        return c;
      })
    );
  }, []);

  const updateComplaint = useCallback((complaintId: string, data: Partial<Complaint>) => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === complaintId ? { ...c, ...data } : c
      )
    );
  }, []);

  const addComplaintImage = useCallback((complaintId: string, imageUrl: string, status: ComplaintStatus) => {
    setComplaints(prev => prev.map(c => {
        if (c.id !== complaintId) return c;

        if (status === 'Resolved') {
            return { ...c, afterImageUrl: imageUrl };
        }

        const newProgressImage = { status, imageUrl };
        const existingProgressImages = c.progressImageUrls?.filter(p => p.status !== status) || [];
        
        return {
            ...c,
            progressImageUrls: [...existingProgressImages, newProgressImage],
        };
    }));
  }, []);

  const addFeedback = useCallback((complaintId: string, feedback: Feedback) => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === complaintId ? { ...c, feedback } : c
      )
    );
  }, []);

  const toggleUpvote = useCallback((complaintId: string) => {
    if (!user) return; // User must be logged in to vote

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          const upvotedBy = c.upvotedBy || [];
          const userHasUpvoted = upvotedBy.includes(user.id);
          
          if (userHasUpvoted) {
            // User has upvoted, so remove their vote
            return { ...c, upvotedBy: upvotedBy.filter(id => id !== user.id) };
          } else {
            // User has not upvoted, so add their vote
            return { ...c, upvotedBy: [...upvotedBy, user.id] };
          }
        }
        return c;
      })
    );
  }, [user]);

  const addComment = useCallback((complaintId: string, comment: Comment) => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === complaintId ? { ...c, comments: [...(c.comments || []), comment] } : c
      )
    );
  }, []);

  const deleteComment = useCallback((complaintId: string, commentId: string) => {
    if (!user) return; // Must be logged in

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          const commentToDelete = c.comments?.find(comment => comment.id === commentId);
          // Only allow user to delete their own comment
          if (commentToDelete && commentToDelete.userId === user.id) {
            return {
              ...c,
              comments: c.comments.filter(comment => comment.id !== commentId),
            };
          }
        }
        return c;
      })
    );
  }, [user]);

  const deleteComplaint = useCallback((complaintId: string) => {
    if (!user) return;
     setComplaints(prev => prev.filter(c => {
        if (c.id === complaintId) {
            // Ensure the user owns this complaint before deleting
            return c.userId !== user.id;
        }
        return true;
     }));
  }, [user]);

  const value = useMemo(() => ({ complaints, addComplaint, updateComplaintStatus, updateComplaint, addComplaintImage, addFeedback, toggleUpvote, addComment, deleteComment, deleteComplaint }), [complaints, addComplaint, updateComplaintStatus, updateComplaint, addComplaintImage, addFeedback, toggleUpvote, addComment, deleteComment, deleteComplaint]);

  return (
    <ComplaintsContext.Provider value={value}>
      {children}
    </ComplaintsContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintsContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintsProvider');
  }
  return context;
}
