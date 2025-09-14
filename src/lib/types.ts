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

export type Feedback = {
  rating: number; // e.g., 1-5
  comment: string;
};

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
  progressImageUrls?: { status: ComplaintStatus, imageUrl: string }[];
  feedback?: Feedback;
};

export const departments = ["Sanitation", "Public Works", "Transportation", "Parks & Rec"] as const;
export type Department = (typeof departments)[number];

export type Officer = {
  id: string;
  name: string;
  department: Department;
  location: string; // Could be a GeoPoint in a real app
  activeCases: number;
};
