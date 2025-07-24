// This is an AI-powered function to suggest related content (readings, hymns) based on user activity.
// 'use server'; // Temporarily disabled for mobile build

/**
 * @fileOverview AI agent for suggesting related content based on user activity.
 *
 * - suggestRelatedContent - A function that suggests related content.
 * - SuggestRelatedContentInput - The input type for the suggestRelatedContent function.
 * - SuggestRelatedContentOutput - The return type for the suggestRelatedContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema expects English titles for hymns
const SuggestRelatedContentInputSchema = z.object({
  recentProgramItems: z
    .array(z.string())
    .describe('List of recently viewed program item titles.'),
  recentHymns: z.array(z.string()).describe('List of recently read hymn titles (English).'),
  recentReadings: z
    .array(z.string())
    .describe('List of recently explored responsive reading titles.'),
});
export type SuggestRelatedContentInput = z.infer<typeof SuggestRelatedContentInputSchema>;

// Output schema will also refer to titles (assumed to be English for hymns, or the original title for readings)
const SuggestRelatedContentOutputSchema = z.object({
  suggestedReadings: z
    .array(z.string())
    .describe('List of suggested responsive reading titles.'),
  suggestedHymns: z.array(z.string()).describe('List of suggested hymn titles (English).'),
  reasoning: z.string().describe('Explanation for why the content is suggested.'),
});
export type SuggestRelatedContentOutput = z.infer<typeof SuggestRelatedContentOutputSchema>;

export async function suggestRelatedContent(input: SuggestRelatedContentInput): Promise<SuggestRelatedContentOutput> {
  return suggestRelatedContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedContentPrompt',
  input: {schema: SuggestRelatedContentInputSchema},
  output: {schema: SuggestRelatedContentOutputSchema},
  prompt: `Based on the user's recent activity (hymn titles provided are in English), suggest related readings and hymns (provide hymn titles in English).

Recent Program Items: {{#each recentProgramItems}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Recent Hymns (English): {{#each recentHymns}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Recent Readings: {{#each recentReadings}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Consider themes, complementary messages, and authors when making suggestions.
Explain why each suggestion is valuable. Be brief, use one sentence to explain why the recommendation is valuable.

Output in the following JSON format:
{
  "suggestedReadings": ["Title 1", "Title 2"],
  "suggestedHymns": ["English Hymn Title 1", "English Hymn Title 2"],
  "reasoning": "Brief explanation for the suggestions."
}
`,
});

const suggestRelatedContentFlow = ai.defineFlow(
  {
    name: 'suggestRelatedContentFlow',
    inputSchema: SuggestRelatedContentInputSchema,
    outputSchema: SuggestRelatedContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
