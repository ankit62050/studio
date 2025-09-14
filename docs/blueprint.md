# **App Name**: JANConnect Lite

## Core Features:

- Complaint Submission: Citizens can submit complaints with text descriptions and optional image uploads, location tagging, and category selection (auto + manual).
- Location Tagging: Users can pin their location, auto-detect via GPS, or enter address manually (with geocoding fallback) using Mapbox/Leaflet integration.
- AI-Powered Categorization Tool: Uses Google Vision API to analyze uploaded images and suggest a category. The user can accept or change the suggested category.
- Complaint History: Each user can log in and view their submitted complaints, status updates, date, location, and before/after images (when admin updates).
- Admin Dashboard: Complaint list with filters (location, category, status). Ability to assign, escalate, resolve, and mark duplicates. Data visualization (pie chart, heatmap).
- Status Updates: Complaint lifecycle: Received → Under Review → Work in Progress → Resolved. Real-time notifications to users (via email / in-app).
- User Authentication: Email & password login. Role-based access: Citizen, Admin, Super Admin.
- Before/After Carousel: Citizens or admins can upload before and after images. Display with a swipeable/auto-play carousel with clear labels.

## Style Guidelines:

- Primary Color (Saffron #FF9933) → Buttons, highlights, active states.
- Background (Off-white #F8F8F8) → Clean UI backdrop.
- Accent (Forest Green #228B22) → Success states, resolved issues, progress.
- Font: PT Sans → Headings + body text.
- Material Icons / FontAwesome (e.g., 📍 for location, 🗑️ for garbage, 🚧 for pothole).
- Responsive grid for dashboard. Mobile-first design for citizen app. Sticky bottom nav (mobile) → Home | Complaints | History | Profile
- Smooth transitions for status updates. Hover effects on buttons/cards. Animations for carousel. Toast notifications for feedback.