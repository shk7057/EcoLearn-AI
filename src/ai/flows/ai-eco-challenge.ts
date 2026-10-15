
'use server';
/**
 * @fileOverview Genkit flow for generating AI eco challenges with Groq fallback.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GROQ_KEY } from '@/lib/constants';

const AiEcoChallengeDifficultySchema = z.enum(['easy', 'medium', 'hard']);

const AiEcoChallengeInputSchema = z.object({
  difficulty: AiEcoChallengeDifficultySchema.optional(),
  theme: z.string().optional(),
});
export type AiEcoChallengeInput = z.infer<typeof AiEcoChallengeInputSchema>;

const AiEcoChallengeOutputSchema = z.object({
  challengeText: z.string(),
  points: z.number().int().positive(),
  difficulty: AiEcoChallengeDifficultySchema,
  icon: z.string().optional(),
});
export type AiEcoChallengeOutput = z.infer<typeof AiEcoChallengeOutputSchema>;

async function callGroqChallengeFallback(input: AiEcoChallengeInput): Promise<AiEcoChallengeOutput> {
  try {
    const diff = input.difficulty || 'medium';
    const theme = input.theme || 'Sustainability';
    const promptText = `Create a fun and practical daily eco-challenge for a student.
    Theme: ${theme}
    Difficulty: ${diff}
    
    Return ONLY a JSON object: { "challengeText": "...", "points": number, "difficulty": "${diff}", "icon": "emoji" }
    Points should be: easy=20, medium=35, hard=50.`;
    
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
    console.error('Groq Challenge Fallback failed', e);
    return {
      challengeText: "Walk or bike instead of using a car for your next short journey.",
      points: 35,
      difficulty: 'medium',
      icon: '🚲'
    };
  }
}

export async function generateEcoChallenge(input: AiEcoChallengeInput = {}): Promise<AiEcoChallengeOutput> {
  try {
    return await aiEcoChallengeFlow(input);
  } catch (err) {
    console.warn('Gemini failed, trying Groq fallback...', err);
    return await callGroqChallengeFallback(input);
  }
}

const ecoChallengePrompt = ai.definePrompt({
  name: 'ecoChallengePrompt',
  input: { schema: AiEcoChallengeInputSchema },
  output: { schema: AiEcoChallengeOutputSchema },
  prompt: `Generate a creative and achievable daily eco-challenge for a student.
Theme: {{theme}}
Difficulty: {{difficulty}}

Assign points based on difficulty: easy=20, medium=35, hard=50.
Provide a relevant emoji icon for the mission.`,
});

const aiEcoChallengeFlow = ai.defineFlow(
  {
    name: 'aiEcoChallengeFlow',
    inputSchema: AiEcoChallengeInputSchema,
    outputSchema: AiEcoChallengeOutputSchema,
  },
  async (input) => {
    const { output } = await ecoChallengePrompt(input);
    if (!output) {
      throw new Error('Failed to generate AI challenge output.');
    }
    return output;
  }
);
