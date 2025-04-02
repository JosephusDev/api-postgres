import supertest from 'supertest'
import { app } from '../src/app'
import client from '../src/config/redis'

beforeAll(async () => {
	try {
		await client.connect().catch(err => {
			console.warn('Redis connection failed, proceeding with tests:', err.message)
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
