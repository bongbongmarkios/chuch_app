// 'use server'; // Temporarily disabled for mobile build
/**
 * @fileOverview A Genkit flow for basic chat with Gemini, with a tool for finding lyrics.
 *
 * - chatWithGemini - A function that takes a user prompt and returns Gemini's response.
 * - ChatInput - The type for the input.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { initialSampleHymns } from '@/data/hymns';

// Tool to find hymn lyrics
const findHymnLyrics = ai.defineTool(
    {
        name: 'findHymnLyrics',
        description: "Searches the app's local database for a Christian hymn based on a query. The query can be a title or a line from the lyrics. Searches English, Hiligaynon, and Filipino fields.",
        inputSchema: z.object({
            query: z.string().describe('The title or a line of lyrics from the hymn to search for.'),
        }),
        outputSchema: z.object({
            found: z.boolean(),
            title: z.string().optional(),
            lyrics: z.string().optional(),
            language: z.string().optional(),
        }),
    },
    async ({ query }) => {
        const lowerCaseQuery = query.toLowerCase().trim();
        if (!lowerCaseQuery) {
          return { found: false };
        }
        
        for (const h of initialSampleHymns) {
            // Check titles
            if (h.titleEnglish.toLowerCase().includes(lowerCaseQuery)) {
                return { found: true, title: h.titleEnglish, lyrics: h.lyricsEnglish, language: 'English' };
            }
            if (h.titleHiligaynon.toLowerCase().includes(lowerCaseQuery)) {
                return { found: true, title: h.titleHiligaynon, lyrics: h.lyricsHiligaynon, language: 'Hiligaynon' };
            }
            if (h.titleFilipino?.toLowerCase().includes(lowerCaseQuery)) {
                return { found: true, title: h.titleFilipino, lyrics: h.lyricsFilipino, language: 'Filipino' };
            }

            // Check lyrics
            if (h.lyricsEnglish.toLowerCase().includes(lowerCaseQuery)) {
                return { found: true, title: h.titleEnglish, lyrics: h.lyricsEnglish, language: 'English' };
            }
            if (h.lyricsHiligaynon.toLowerCase().includes(lowerCaseQuery)) {
                return { found: true, title: h.titleHiligaynon, lyrics: h.lyricsHiligaynon, language: 'Hiligaynon' };
            }
            if (h.lyricsFilipino?.toLowerCase().includes(lowerCaseQuery)) {
                return { found: true, title: h.titleFilipino, lyrics: h.lyricsFilipino, language: 'Filipino' };
            }
        }
        return { found: false };
    }
);

const ChatInputSchema = z.object({
  prompt: z.string().describe('The user message to send to the AI.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;


export async function chatWithGemini(input: ChatInput): Promise<string> {
  const { text } = await ai.generate({
    prompt: input.prompt,
    tools: [findHymnLyrics],
    system: `You are a helpful and versatile AI assistant for the SBC Church App. Your primary goal is to assist users with a wide range of tasks.

A special capability you have is finding Christian song lyrics. If the user's request is clearly about finding lyrics for a song, you MUST follow these specific instructions:

1.  **Use Local Database First**: Use the \`findHymnLyrics\` tool to check if the song exists in the app's local database. This is your primary resource for lyrics.

2.  **Present Found Lyrics**: If the tool finds the song, present the full lyrics immediately, stating you found it in the app's database.

3.  **Search Online if Not Found**: If the tool does not find the song (\`found: false\`), then search for the song online using your extensive knowledge base.

4.  **Provide Accurate Online Lyrics**: After searching online, provide the accurate, existing lyrics. You MUST NOT invent or generate lyrics. You can state that you found the lyrics online.

5.  **Handle Ambiguity**: If your online search yields multiple possible songs for a query, present a list of the top 2-3 most likely songs and ask the user to clarify. Do not provide full lyrics until they confirm.

6.  **Handle Vague Requests**: If a lyrics request is too vague (e.g., "a song about grace"), ask for more specific information like the title, author, or a unique line.

7.  **Lyric Formatting**: When you provide the final, correct lyrics, you MUST wrap them in [START_LYRICS] and [END_LYRICS] tags. For example:
    Here are the lyrics for 'Amazing Grace':
    [START_LYRICS]
    Amazing Grace, how sweet the sound...
    [END_LYRICS]

For all other requests that are NOT about finding song lyrics, act as a general-purpose, friendly, and helpful assistant. You can answer questions, provide information, and engage in conversation on any topic.`
  });
  return text;
}
