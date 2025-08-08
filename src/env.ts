import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
	PORT: z.coerce.number().default(3333),
	DATABASE_URL: z.string(),
	REDIS_HOST: z.string(),
	REDIS_USERNAME: z.string(),
	REDIS_PASSWORD: z.string(),
	REDIS_PORT: z.coerce.number().default(6379),
	REDIS_URL: z.string(),
})

export const env = envSchema.parse(process.env)
