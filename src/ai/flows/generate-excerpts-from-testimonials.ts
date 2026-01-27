'use server';
/**
 * @fileOverview A testimonials excerpt generator AI agent.
 *
 * - generateExcerptsFromTestimonials - A function that handles the testimonials excerpt generation process.
 * - GenerateExcerptsFromTestimonialsInput - The input type for the generateExcerptsFromTestimonials function.
 * - GenerateExcerptsFromTestimonialsOutput - The return type for the generateExcerptsFromTestimonials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExcerptsFromTestimonialsInputSchema = z.object({
  testimonials: z.array(z.string()).describe('An array of client testimonials.'),
  service: z.string().describe('The service for which to generate testimonial excerpts.'),
});
export type GenerateExcerptsFromTestimonialsInput = z.infer<typeof GenerateExcerptsFromTestimonialsInputSchema>;

const GenerateExcerptsFromTestimonialsOutputSchema = z.object({
  excerpts: z.array(z.string()).describe('An array of testimonial excerpts highlighting specific benefits of the service.'),
});
export type GenerateExcerptsFromTestimonialsOutput = z.infer<typeof GenerateExcerptsFromTestimonialsOutputSchema>;

export async function generateExcerptsFromTestimonials(input: GenerateExcerptsFromTestimonialsInput): Promise<GenerateExcerptsFromTestimonialsOutput> {
  return generateExcerptsFromTestimonialsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExcerptsFromTestimonialsPrompt',
  input: {schema: GenerateExcerptsFromTestimonialsInputSchema},
  output: {schema: GenerateExcerptsFromTestimonialsOutputSchema},
  prompt: `You are an expert in extracting key benefits from client testimonials.

  Given the following testimonials and service, extract excerpts that highlight specific benefits of the service.

  Service: {{{service}}}

  Testimonials:
  {{#each testimonials}}
  - {{{this}}}
  {{/each}}

  Excerpts should be concise and compelling, showcasing the value provided to clients.

  Output should be an array of strings.
  Ensure that the excerpts are relevant to the service provided.
  Do not include any introductory or concluding sentences, only the excerpts.
  Do not include any duplicate excerpts.
  Return empty array if no testimonial matches the service.

  Here's how you generate the array:
  1. Read through the testimonials.
  2. Identify excerpts that showcase the value provided by the service.
  3. Ensure that the excerpts are concise and compelling.
  4. Return array.
  `,
});

const generateExcerptsFromTestimonialsFlow = ai.defineFlow(
  {
    name: 'generateExcerptsFromTestimonialsFlow',
    inputSchema: GenerateExcerptsFromTestimonialsInputSchema,
    outputSchema: GenerateExcerptsFromTestimonialsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
