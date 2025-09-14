'use client';

import type { Complaint, ComplaintStatus } from '@/lib/types';
import { complaints as initialComplaints } from '@/lib/data';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

interface ComplaintsContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Complaint) => void;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus) => void;
  addComplaintImage: (complaintId: string, imageUrl: string, status: ComplaintStatus) => void;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);

  const addComplaint = useCallback((complaint: Complaint) => {
    setComplaints(prev => [complaint, ...prev]);
  }, []);

  const updateComplaintStatus = useCallback((complaintId: string, status: ComplaintStatus) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          const updatedComplaint = { ...c, status };
          if (status === 'Resolved') {
            updatedComplaint.resolvedAt = new Date().toISOString();
          }
          return updatedComplaint;
        }
        return c;
      })
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

  const value = useMemo(() => ({ complaints, addComplaint, updateComplaintStatus, addComplaintImage }), [complaints, addComplaint, updateComplaintStatus, addComplaintImage]);

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
