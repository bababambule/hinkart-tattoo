// 1. import utilities from 'astro:content
import { defineCollection } from 'astro:content';

// 2. Import loader(s)
import { glob } from 'astro/loaders';

// 3. Import Zod
import { z } from 'astro/zod';

// 4. define a 'loader' and 'schema' for each collection
const artists = defineCollection({
	loader: glob({ base: './src/pages/artists', pattern: '**/*.md' }),
	schema: z.object({
		name: z.string().min(2),
		order: z.number(),
		//image: z.file(),
		video: z.string(),
		pronouns: z.string(),
		languages: z.array(z.string()),
		biography: z.string(),
		tags: z.array(z.string()),
		mail: z.email(),
		instagram: z.url(),
	}),
});

const generalFaq = defineCollection({
	loader: glob({ base: './src/data/faq', pattern: '*.md' }),
	schema: z.object({
		question: z.string(),
		answer: z.string(),
		group: z.enum(['general', 'appointment', 'payment']).default('general'),
	}),
});

// 5. export a single 'collections' object to register your collection(s)
export const collections = { artists, generalFaq };
