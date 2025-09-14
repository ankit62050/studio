export type FAQ = {
  question: string;
  answer: string;
};

export const faqs: FAQ[] = [
  {
    question: "What is JANConnect Lite?",
    answer: "JANConnect Lite is a platform for citizens to report non-emergency civic issues like garbage, potholes, and broken streetlights to their local government. It helps streamline the complaint process and provides transparency."
  },
  {
    question: "How do I submit a new complaint?",
    answer: "Navigate to the 'New Complaint' page from the dashboard or menu. Fill in the category, a detailed description, and the location of the issue. Uploading a photo is highly recommended as it helps our AI categorize the issue and provides visual evidence for the assigned department."
  },
  {
    question: "How can I track the status of my complaint?",
    answer: "You can view all your submitted complaints and their current statuses on the 'My History' page. The statuses are: Received, Under Review, Work in Progress, and Resolved."
  },
  {
    question: "What do the different complaint statuses mean?",
    answer: "- **Received**: Your complaint has been successfully submitted to the system. \n- **Under Review**: An administrator is reviewing your complaint to assign it to the correct department. \n- **Work in Progress**: The assigned department has started working on resolving the issue. \n- **Resolved**: The issue has been fixed."
  },
  {
    question: "Can I provide feedback on a resolved complaint?",
    answer: "Yes! Once a complaint is marked as 'Resolved', you will see an option to provide a rating (1-5 stars) and a comment on the 'My History' page. Your feedback is valuable for improving our services."
  },
  {
    question: "Who can use the Admin Dashboard?",
    answer: "The Admin Dashboard is for authorized government personnel only. They use it to review incoming complaints, update statuses, assign officers, and track the resolution process."
  },
  {
    question: "What is the AI chatbot for?",
    answer: "The chatbot is your AI assistant. You can ask it questions about how to use the app, what different features do, or get general information about the complaint process. It's available on all pages via the icon in the bottom-right corner."
  }
];
