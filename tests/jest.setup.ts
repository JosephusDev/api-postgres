import supertest from 'supertest'
import { app } from '../src/app'
import client from '../src/config/redis'
import { env } from '../src/env'

// Aumenta o timeout para hooks para 10 segundos
jest.setTimeout(30000)

beforeAll(async () => {
	try {
		await client.connect().catch(err => {
			console.warn('Redis connection failed, proceeding with tests:', err.message)
			console.log(env.REDIS_HOST, env.DATABASE_URL, env.REDIS_PASSWORD, env.REDIS_PORT, env.REDIS_USERNAME)
		})
		await app.ready()
	} catch (error) {
		console.error('Test setup failed:', error)
		throw error
	}
})

afterAll(async () => {
	await app.close()
	if (client.isOpen) {
		await client.disconnect()
	}
})

export const testServer = supertest(app.server)
