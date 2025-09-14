export type User = {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin';
  avatarUrl?: string;
};

export const complaintCategories = [
  "Garbage",
  "Pothole",
  "Traffic Light",
  "Graffiti",
  "Water Leak",
  "Other",
] as const;

export type ComplaintCategory = (typeof complaintCategories)[number];

export const complaintStatuses = [
  "Received",
  "Under Review",
  "Work in Progress",
  "Resolved",
] as const;

export type ComplaintStatus = (typeof complaintStatuses)[number];

export type Complaint = {
  id: string;
  userId: string;
  category: ComplaintCategory;
  description: string;
  location: string;
  status: ComplaintStatus;
  submittedAt: string;
  resolvedAt?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
};
