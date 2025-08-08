import supertest from 'supertest'
import client from '../src/config/redis'

// Mock do módulo antes de importar o app
jest.mock('@scalar/fastify-api-reference', () => {
	return {
		default: jest.fn(() => ({
			register: jest.fn(),
		})),
	}
})

import { app } from '../src/app'

// Aumenta o timeout para hooks para 10 segundos
jest.setTimeout(10000)

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
