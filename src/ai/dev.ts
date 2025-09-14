import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-complaint-image.ts';
import '@/ai/flows/chatbot.ts';
import '@/ai/flows/process-complaint.ts';
