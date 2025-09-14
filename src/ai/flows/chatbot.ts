'use server';
/**
 * @fileOverview A simple chatbot flow for answering FAQs about the app.
 *
 * - chat - A function that takes a chat history and returns a response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the user query.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a friendly and helpful AI assistant for an app called JANConnect Lite. Your purpose is to answer user questions about the app and how to use it.

  Keep your answers concise and easy to understand.

  Here are some facts about the app:
  - JANConnect Lite is a platform for citizens to report non-emergency civic issues (e.g., garbage, potholes).
  - Citizens can submit complaints with a description, location, and a photo.
  - An AI feature helps categorize the complaint based on the uploaded photo.
  - Citizens can view the history and status of their submitted complaints.
  - Complaint statuses are: Received, Under Review, Work in Progress, Resolved.
  - When a complaint is resolved, citizens can provide feedback with a rating and comments.
  - Admins can view all complaints, update their status, and add "work in progress" or "resolved" photos.
  - The app has a citizen dashboard and an admin dashboard.

  Here is the chat history so far:
  {{#each history}}
  {{role}}: {{{content}}}
  {{/each}}
  
  Now, answer the latest user query.`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const llmResponse = await prompt(input);
    const output = llmResponse.output;

    if (!output) {
      return {response: "I'm sorry, I couldn't generate a response. Please try again."};
    }
    
    return { response: output.response };
  }
);
