import supertest from 'supertest'
import { app } from '../src/app'

beforeAll(async () => {
	await app.ready() // Certifica-se de que o Fastify está pronto antes dos testes
})

afterAll(async () => {
	await app.close() // Fecha o servidor após os testes para evitar conflitos
})

// Usa `supertest(app.server)` para garantir compatibilidade
export const testServer = supertest(app.server)
