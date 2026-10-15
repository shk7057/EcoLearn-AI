
'use server';
/**
 * @fileOverview Genkit flow for city comparisons with Groq fallback and fixed prompt syntax.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GROQ_KEY } from '@/lib/constants';

const CityComparisonDataSchema = z.object({
  name: z.string(),
  currentAqi: z.number(),
  analysis: z.object({
    trend: z.string(),
    weeklyAvg: z.number(),
  }).optional(),
});

const AiCityComparisonInputSchema = z.object({
  city1: CityComparisonDataSchema,
  city2: CityComparisonDataSchema,
});
export type AiCityComparisonInput = z.infer<typeof AiCityComparisonInputSchema>;

const AiCityComparisonOutputSchema = z.object({
  summary: z.string(),
  winnerCity: z.string(),
});
export type AiCityComparisonOutput = z.infer<typeof AiCityComparisonOutputSchema>;

async function callGroqComparisonFallback(input: AiCityComparisonInput): Promise<AiCityComparisonOutput> {
  try {
    const promptText = `You are an environmental analyst. Compare these two cities based on their air quality:
    1. ${input.city1.name}: Current AQI ${input.city1.currentAqi}
    2. ${input.city2.name}: Current AQI ${input.city2.currentAqi}
    
    Provide a concise summary of the comparison and name the 'winnerCity' (the one with the cleaner air/lower AQI).
    Return ONLY a JSON object: { "summary": "...", "winnerCity": "..." }`;
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: promptText }],
        response_format: { type: 'json_object' }
      }),
    });
    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return JSON.parse(data.choices[0].message.content);
    }
    throw new Error('Groq response empty');
  } catch (e) {
    console.error('Groq Comparison Fallback failed', e);
    return {
      summary: "Comparison currently unavailable. Typically, a lower AQI indicates better air quality and fewer health risks.",
      winnerCity: input.city1.currentAqi < input.city2.currentAqi ? input.city1.name : input.city2.name
    };
  }
}

export async function compareCities(input: AiCityComparisonInput): Promise<AiCityComparisonOutput> {
  try {
    return await aiCityComparisonFlow(input);
  } catch (err) {
    console.warn('Gemini failed, trying Groq fallback...', err);
    return await callGroqComparisonFallback(input);
  }
}

const aiCityComparisonPrompt = ai.definePrompt({
  name: 'aiCityComparisonPrompt',
  input: { schema: AiCityComparisonInputSchema },
  output: { schema: AiCityComparisonOutputSchema },
  prompt: `You are an expert environmental analyst. Compare the air quality of these two cities:

1. {{city1.name}}: Current AQI {{city1.currentAqi}}
2. {{city2.name}}: Current AQI {{city2.currentAqi}}

Provide a short, insightful summary of how they compare today. Identify the 'winnerCity' which has the cleaner air (lowest AQI).`,
});

const aiCityComparisonFlow = ai.defineFlow(
  {
    name: 'aiCityComparisonFlow',
    inputSchema: AiCityComparisonInputSchema,
    outputSchema: AiCityComparisonOutputSchema,
  },
  async (input) => {
    const { output } = await aiCityComparisonPrompt(input);
    if (!output) {
      throw new Error('Failed to get output from AI city comparison prompt.');
    }
    return output;
  }
);
