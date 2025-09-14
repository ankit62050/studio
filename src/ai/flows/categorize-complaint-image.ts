'use server';
/**
 * @fileOverview AI-powered categorization of complaint images.
 *
 * - categorizeComplaintImage - A function that suggests a category for a complaint based on an uploaded image.
 * - CategorizeComplaintImageInput - The input type for the categorizeComplaintImage function.
 * - CategorizeComplaintImageOutput - The return type for the categorizeComplaintImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeComplaintImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo related to the complaint, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CategorizeComplaintImageInput = z.infer<typeof CategorizeComplaintImageInputSchema>;

const CategorizeComplaintImageOutputSchema = z.object({
  suggestedCategory: z.string().describe('The AI-suggested category for the complaint.'),
});
export type CategorizeComplaintImageOutput = z.infer<typeof CategorizeComplaintImageOutputSchema>;

export async function categorizeComplaintImage(
  input: CategorizeComplaintImageInput
): Promise<CategorizeComplaintImageOutput> {
  return categorizeComplaintImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeComplaintImagePrompt',
  input: {schema: CategorizeComplaintImageInputSchema},
  output: {schema: CategorizeComplaintImageOutputSchema},
  prompt: `You are an AI assistant that helps categorize citizen complaints based on images.

  Analyze the image provided and suggest a relevant category for the complaint. Here are some example categories:

  ["Garbage", "Pothole", "Traffic Light", "Graffiti", "Water Leak", "Other"]

  Based on the image, pick one of the categories that is most relevant.  If you are unsure, pick "Other".

  Image: {{media url=photoDataUri}}
  `,
});

const categorizeComplaintImageFlow = ai.defineFlow(
  {
    name: 'categorizeComplaintImageFlow',
    inputSchema: CategorizeComplaintImageInputSchema,
    outputSchema: CategorizeComplaintImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
