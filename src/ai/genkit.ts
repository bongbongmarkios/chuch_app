import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({
    apiKey: 'AIzaSyDEgm7HL84OYFrPLEX5phO-zT_nQC5Gwq0'
  })],
  model: 'googleai/gemini-2.0-flash',
});
