import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
	PORT: z.coerce.number().default(3333),
	DATABASE_URL: z.string().url(),
	DATABASE_URL_DOCKER: z.string().url(),
	REDIS_HOST: z.string(),
	REDIS_PORT: z.coerce.number().default(6379),
	REDIS_CACHED_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
