import supertest from 'supertest'
import { app } from '../src/app'
import client from '../src/config/redis'

beforeAll(async () => {
	await client.connect() // Certifica-se que o Redis está rodando
	await app.ready() // Certifica-se de que o Fastify está pronto antes dos testes
})

afterAll(async () => {
	await app.close() // Fecha o servidor após os testes para evitar conflitos
	await client.disconnect() // Fecha o cliente do Redis após os testes para evitar conflitos
})

// Usa `supertest(app.server)` para garantir compatibilidade
export const testServer = supertest(app.server)
