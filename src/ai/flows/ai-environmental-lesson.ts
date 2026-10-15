
'use server';
/**
 * @fileOverview A Genkit flow for generating personalized environmental lessons with Groq fallback.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {GROQ_KEY} from '@/lib/constants';

const AiEnvironmentalLessonInputSchema = z.object({
  city: z.string().describe('The city name relevant to the lesson.'),
  aqi: z.number().describe("The current Air Quality Index (AQI)."),
  pm25: z.number().describe("The current PM2.5 particulate matter level."),
  temp: z.number().describe("The current temperature in Celsius."),
  trend: z.string().describe("The weekly AQI trend."),
  diffFromAvg: z.number().describe("The percentage difference from average."),
  weeklyAvg: z.number().describe("The weekly average AQI."),
  bestDay: z.object({
    aqi: z.number().describe("The AQI on the best day."),
    date: z.string().describe("The date of the best day."),
  }),
});
export type AiEnvironmentalLessonInput = z.infer<typeof AiEnvironmentalLessonInputSchema>;

const AiEnvironmentalLessonOutputSchema = z.object({
  lesson: z.string().describe("A personalized environmental science lesson text."),
});

async function callGroqLessonFallback(input: AiEnvironmentalLessonInput): Promise<string> {
  try {
    const promptText = `You are an expert environmental science teacher. Write a personalized lesson for someone in ${input.city}.
    Context Data:
    - Current AQI: ${input.aqi}
    - Temperature: ${input.temp}°C
    - Trend: ${input.trend}
    
    The lesson should include:
    1. Analysis of current conditions.
    2. Health impact explanation.
    3. 3 Practical actions.
    4. A fun environmental fact.
    5. A final reflection.
    
    Write in an engaging style with emojis. Max 250 words.`;
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: promptText }],
      }),
    });
    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }
    throw new Error('Groq response empty');
  } catch (e) {
    console.error('Groq Fallback failed', e);
    return "The environment is constantly changing. Understanding air quality indices like AQI " + input.aqi + " helps us make better health decisions. Stay hydrated and check for local trends often.";
  }
}

export async function generateEnvironmentalLesson(input: AiEnvironmentalLessonInput): Promise<string> {
  try {
    const result = await aiEnvironmentalLessonFlow(input);
    return result.lesson;
  } catch (err) {
    console.warn('Gemini failed, trying Groq fallback...', err);
    return await callGroqLessonFallback(input);
  }
}

const aiEnvironmentalLessonPrompt = ai.definePrompt({
  name: 'aiEnvironmentalLessonPrompt',
  input: {schema: AiEnvironmentalLessonInputSchema},
  output: {schema: AiEnvironmentalLessonOutputSchema},
  prompt: `You are an expert environmental science teacher. Write a personalized environmental lesson for a student in {{city}}.

Use this real-time data to make the lesson relevant:
- Current AQI: {{aqi}}
- PM2.5 Level: {{pm25}}
- Temperature: {{temp}}°C
- Trend: {{trend}}

The lesson MUST follow this structure:
1. Analysis: What do these numbers mean for {{city}} today?
2. Impact: How does this affect health and local ecosystems?
3. 3 Actions: What can the student do today?
4. Fun Fact: A surprising fact about environmental science.
5. Reflection: A thought-provoking question.

Keep the tone encouraging and use relevant emojis. Max 250 words.`,
});

const aiEnvironmentalLessonFlow = ai.defineFlow(
  {
    name: 'aiEnvironmentalLessonFlow',
    inputSchema: AiEnvironmentalLessonInputSchema,
    outputSchema: AiEnvironmentalLessonOutputSchema,
  },
  async (input) => {
    const {output} = await aiEnvironmentalLessonPrompt(input);
    if (!output) {
      throw new Error('Failed to generate environmental lesson content.');
    }
    return output;
  }
);
