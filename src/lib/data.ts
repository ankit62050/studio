
import type { User, Complaint, Officer } from './types';

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    role: 'citizen',
    avatarUrl: 'https://picsum.photos/seed/indianman/100/100',
  },
  {
    id: 'user-2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    role: 'admin',
    avatarUrl: 'https://picsum.photos/seed/avatar2/100/100',
  },
   {
    id: 'TBD', // This will be replaced by Firebase UID
    name: 'Admin User',
    email: 'admin@example.com', // Match a real test Google account
    role: 'admin',
    avatarUrl: 'https://picsum.photos/seed/admin-avatar/100/100',
  },
  {
    id: 'TBD', // This will be replaced by Firebase UID
    name: 'Citizen User',
    email: 'citizen@example.com', // Match a real test Google account
    role: 'citizen',
    avatarUrl: 'https://picsum.photos/seed/citizen-avatar/100/100',
  },
];

export const officers: Officer[] = [
  { id: 'officer-1', name: 'Amit Singh', department: 'Sanitation', location: 'District 1', activeCases: 3 },
  { id: 'officer-2', name: 'Priya Sharma', department: 'Sanitation', location: 'District 2', activeCases: 5 },
  { id: 'officer-3', name: 'Rajesh Kumar', department: 'Public Works', location: 'District 1', activeCases: 2 },
  { id: 'officer-4', name: 'Sunita Gupta', department: 'Public Works', location: 'District 3', activeCases: 4 },
  { id: 'officer-5', name: 'Vijay Reddy', department: 'Transportation', location: 'City Wide', activeCases: 6 },
  { id: 'officer-6', name: 'Meera Desai', department: 'Parks & Rec', location: 'District 2', activeCases: 1 },
];


export const complaints: Complaint[] = [
  {
    id: 'complaint-1',
    userId: 'user-1',
    category: 'Garbage',
    description: 'Overflowing dustbin on the corner of Main St and 1st Ave. It has not been collected for over a week and is attracting pests.',
    location: 'Main St & 1st Ave',
    latitude: 28.6139,
    longitude: 77.2090,
    status: 'Resolved',
    submittedAt: '2024-07-15T09:30:00Z',
    resolvedAt: '2024-07-18T14:00:00Z',
    beforeImageUrls: ['https://images.unsplash.com/photo-1579348372325-a473c39396d6?q=80&w=600&h=400&fit=crop'],
    afterImageUrl: 'https://images.unsplash.com/photo-1621431639534-e82f72498739?q=80&w=600&h=400&fit=crop',
    feedback: {
        rating: 4,
        comment: "The issue was resolved quickly once it was assigned. Good job!"
    },
    upvotedBy: ['user-1', 'user-2'],
    comments: [
        { id: 'comment-1-1', userId: 'user-2', text: "This is a real problem in our neighborhood.", createdAt: '2024-07-15T10:00:00Z' },
        { id: 'comment-1-2', userId: 'user-1', text: "Agreed! Hope it gets fixed soon.", createdAt: '2024-07-15T11:30:00Z' },
    ]
  },
  {
    id: 'complaint-2',
    userId: 'user-1',
    category: 'Pothole',
    description: 'A large and dangerous pothole has formed on Elm Street, right in front of the public library. It poses a risk to cars and cyclists.',
    location: 'Elm Street, near Public Library',
    latitude: 28.6145,
    longitude: 77.2105,
    status: 'Work in Progress',
    submittedAt: '2024-07-20T11:00:00Z',
    beforeImageUrls: ['https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=600&h=400&fit=crop'],
    progressImageUrls: [
        { status: 'Work in Progress', imageUrl: 'https://images.unsplash.com/photo-1589993302324-a6b3fb4a7c97?q=80&w=600&h=400&fit=crop' }
    ],
    upvotedBy: ['user-2'],
    comments: []
  },
  {
    id: 'complaint-3',
    userId: 'user-1',
    category: 'Graffiti',
    description: 'Offensive graffiti has been sprayed on the park wall at Central Park. Needs to be cleaned up as soon as possible.',
    location: 'Central Park',
    latitude: 28.6128,
    longitude: 77.216,
    status: 'Under Review',
    submittedAt: '2024-07-22T18:45:00Z',
    beforeImageUrls: ['https://images.unsplash.com/photo-1528749969521-194d34192074?q=80&w=600&h=400&fit=crop'],
    upvotedBy: [],
    comments: [
        { id: 'comment-3-1', userId: 'user-2', text: "This is unacceptable.", createdAt: '2024-07-22T19:00:00Z' },
    ]
  },
  {
    id: 'complaint-4',
    userId: 'user-1',
    category: 'Traffic Light',
    description: 'The traffic light at the intersection of Oak and Pine is malfunctioning. The pedestrian signal is not working.',
    location: 'Intersection of Oak and Pine',
    latitude: 28.615,
    longitude: 77.212,
    status: 'Received',
    submittedAt: '2024-07-23T08:00:00Z',
    beforeImageUrls: ['https://images.unsplash.com/photo-1589895933610-37df9fed5654?q=80&w=600&h=400&fit=crop'],
    upvotedBy: ['user-1'],
    comments: []
  },
  {
    id: 'complaint-5',
    userId: 'user-1',
    category: 'Water Leak',
    description: 'There is a significant water leak on the sidewalk on Maple Avenue. Water has been flowing for hours.',
    location: 'Maple Avenue',
    latitude: 28.610,
    longitude: 77.218,
    status: 'Resolved',
    submittedAt: '2024-07-10T15:20:00Z',
    resolvedAt: '2024-07-11T10:00:00Z',
    beforeImageUrls: ['https://images.unsplash.com/photo-1565582343296-15b9c6a3824b?q=80&w=600&h=400&fit=crop'],
    afterImageUrl: 'https://images.unsplash.com/photo-1541854615-53376def9693?q=80&w=600&h=400&fit=crop',
    feedback: {
        rating: 5,
        comment: "Resolved very quickly!"
    },
    upvotedBy: [],
    comments: []
  },
];
