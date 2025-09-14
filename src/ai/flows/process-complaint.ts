'use server';
/**
 * @fileOverview An AI agent for processing and assigning citizen complaints.
 *
 * - processComplaint - A function that analyzes a complaint and suggests assignment and priority.
 * - ProcessComplaintInput - The input type for the processComplaint function.
 * - ProcessComplaintOutput - The return type for the processComplaint function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { complaintCategories, departments } from '@/lib/types';

// Define schemas based on updated types
const OfficerSchema = z.object({
  id: z.string(),
  name: z.string(),
  department: z.enum(departments),
  location: z.string(),
  activeCases: z.number(),
});

const ComplaintSchema = z.object({
  description: z.string(),
  location: z.string(),
  photoDataUri: z.string().optional(),
});

// Input Schema for the Flow
const ProcessComplaintInputSchema = z.object({
  complaint: ComplaintSchema,
  officers: z.array(OfficerSchema),
});
export type ProcessComplaintInput = z.infer<typeof ProcessComplaintInputSchema>;

// Output Schema for the Flow
const ProcessComplaintOutputSchema = z.object({
  suggestedCategory: z.enum(complaintCategories).describe('The most likely category for the complaint.'),
  recommendedDepartment: z.enum(departments).describe('The government department best suited to handle this complaint.'),
  priority: z.enum(['High', 'Medium', 'Low']).describe('The assigned priority level.'),
  assignedOfficer: z.object({
    id: z.string().describe('The ID of the assigned officer.'),
    name: z.string().describe('The name of the assigned officer.'),
  }).describe('The officer assigned to the complaint.'),
  reasoning: z.string().describe('A brief explanation for the assignment and priority decisions.'),
});
export type ProcessComplaintOutput = z.infer<typeof ProcessComplaintOutputSchema>;


export async function processComplaint(input: ProcessComplaintInput): Promise<ProcessComplaintOutput> {
  return processComplaintFlow(input);
}


const departmentResponsibilities = `
- **Sanitation**: Garbage collection, street cleaning, waste management.
- **Public Works**: Potholes, road repairs, water leaks, public infrastructure maintenance.
- **Transportation**: Traffic lights, road signs, public transport issues.
- **Parks & Rec**: Issues in public parks, graffiti on public property.
`;

const prompt = ai.definePrompt({
  name: 'processComplaintPrompt',
  input: { schema: ProcessComplaintInputSchema },
  output: { schema: ProcessComplaintOutputSchema },
  prompt: `You are an expert AI complaint dispatcher for a city government. Your task is to analyze new citizen complaints and recommend the best course of action.

Analyze the provided complaint details (description, location, and photo).

**Your analysis must follow these steps:**

1.  **Categorize the Complaint:** Based on the details, select the most appropriate category from the available list.
2.  **Recommend a Department:** Use the category and the department responsibilities provided below to recommend the correct department.
    Department Responsibilities:
    ${departmentResponsibilities}
3.  **Assign Priority:** Determine a priority level (High, Medium, Low). Consider factors like safety risks (e.g., "dangerous pothole," "exposed wires"), public health (e.g., "overflowing garbage"), or scale of impact.
4.  **Select an Officer:** Assign the most suitable officer based on these strict rules, in this exact order:
    a. The officer **must** belong to the recommended department.
    b. Among those in the correct department, prefer the officer whose location is closest or most relevant to the complaint's location.
    c. If multiple officers are equally close, assign the one with the **lowest number of active cases** to ensure balanced workloads.

**Context:**
- Complaint Description: {{{complaint.description}}}
- Complaint Location: {{{complaint.location}}}
- Available Officers:
  {{#each officers}}
  - ID: {{id}}, Name: {{name}}, Department: {{department}}, Location: {{location}}, Active Cases: {{activeCases}}
  {{/each}}

{{#if complaint.photoDataUri}}
- Complaint Photo: {{media url=complaint.photoDataUri}}
{{/if}}

Based on your analysis, provide a structured response with the category, department, priority, assigned officer, and a short reasoning for your choices.
`,
});

const processComplaintFlow = ai.defineFlow(
  {
    name: 'processComplaintFlow',
    inputSchema: ProcessComplaintInputSchema,
    outputSchema: ProcessComplaintOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
