'use client';

import type { Complaint, ComplaintStatus, Feedback } from '@/lib/types';
import { complaints as initialComplaints } from '@/lib/data';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';

interface ComplaintsContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Complaint) => void;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus) => void;
  updateComplaint: (complaintId: string, data: Partial<Complaint>) => void;
  addComplaintImage: (complaintId: string, imageUrl: string, status: ComplaintStatus) => void;
  addFeedback: (complaintId: string, feedback: Feedback) => void;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedComplaints = localStorage.getItem('complaints');
      if (storedComplaints) {
        setComplaints(JSON.parse(storedComplaints));
      } else {
        setComplaints(initialComplaints);
      }
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
    setComplaints(prev => [complaint, ...prev]);
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


  const value = useMemo(() => ({ complaints, addComplaint, updateComplaintStatus, updateComplaint, addComplaintImage, addFeedback }), [complaints, addComplaint, updateComplaintStatus, updateComplaint, addComplaintImage, addFeedback]);

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
