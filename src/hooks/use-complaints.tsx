'use client';

import type { Complaint, ComplaintStatus, Feedback, Comment } from '@/lib/types';
import { complaints as initialComplaints } from '@/lib/data';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';

interface ComplaintsContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Complaint) => void;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus) => void;
  updateComplaint: (complaintId: string, data: Partial<Complaint>) => void;
  addComplaintImage: (complaintId: string, imageUrl: string, status: ComplaintStatus) => void;
  addFeedback: (complaintId: string, feedback: Feedback) => void;
  toggleUpvote: (complaintId: string) => void;
  addComment: (complaintId: string, comment: Comment) => void;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedComplaints = localStorage.getItem('complaints');
      let complaintsData: Complaint[] = [];
      if (storedComplaints) {
        complaintsData = JSON.parse(storedComplaints);
      } else {
        complaintsData = initialComplaints;
      }
      // Data hydration: Ensure all complaints have upvotes and comments
      const hydratedComplaints = complaintsData.map(c => ({
        ...c,
        upvotes: c.upvotes || 0,
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
    setComplaints(prev => [{ ...complaint, upvotes: 0, comments: [] }, ...prev]);
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
    // In a real app, you'd also track which user has upvoted.
    // For this simulation, we'll just increment/decrement.
    setComplaints(prev =>
      prev.map(c =>
        c.id === complaintId ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c
      )
    );
  }, []);

  const addComment = useCallback((complaintId: string, comment: Comment) => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === complaintId ? { ...c, comments: [...(c.comments || []), comment] } : c
      )
    );
  }, []);

  const value = useMemo(() => ({ complaints, addComplaint, updateComplaintStatus, updateComplaint, addComplaintImage, addFeedback, toggleUpvote, addComment }), [complaints, addComplaint, updateComplaintStatus, updateComplaint, addComplaintImage, addFeedback, toggleUpvote, addComment]);

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
