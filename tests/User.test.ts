import client from '../src/config/redis'
import { testServer } from './jest.setup'

let userId: string = ''

/**
 * Testes E2E (End-to-End) da API de Usuários
 * Testa a aplicação completa através de requisições HTTP
 * Usa infraestrutura real (banco de dados, Redis)
 */
describe('User API - E2E Tests', () => {
	// Verifica conexão com Redis antes de cada teste
	beforeEach(async () => {
		if (!client.isOpen) {
			console.warn('Redis is not connected - some tests might fail')
		}

		// Limpa cache para garantir testes isolados
		if (client.isOpen) {
			await client.del('users')
		}
	})

	// Teste de criação de usuário
	it('should create a user with valid data', async () => {
		const result = await testServer.post('/users').send({
			nome: 'Teste',
			email: 'teste@teste.com',
		})

		expect(result.status).toBe(201)
		expect(result.body).toHaveProperty('id')

		// Armazena o ID do usuário criado para uso no teste de exclusão
		userId = result.body.id
	}, 30000)

	// teste de erro de criação de usuário
	it('should return clean error message when data is not valid', async () => {
		const result = await testServer.post('/users').send({
			nome: 'Teste',
			// email ausente
		})

		expect(result.status).toBe(400)
		expect(result.body).toHaveProperty('message')
		expect(result.body.message).toBe('O e-mail é obrigatório')
		// Verifica que não há código de erro do Fastify
		expect(result.body.message).not.toContain('body/')
		expect(result.body.message).not.toContain('FST_ERR_VALIDATION')
	}, 30000)

	// teste de validação de nome muito curto
	it('should return error for short name', async () => {
		const result = await testServer.post('/users').send({
			nome: 'Jo', // menos de 3 caracteres
			email: 'jo@test.com',
		})

		expect(result.status).toBe(400)
		expect(result.body.message).toBe('O nome deve ter no mínimo 3 caracteres')
	}, 30000)

	// teste de validação de email inválido
	it('should return error for invalid email', async () => {
		const result = await testServer.post('/users').send({
			nome: 'João Silva',
			email: 'email-invalido',
		})

		expect(result.status).toBe(400)
		expect(result.body.message).toBe('O e-mail deve ser válido')
	}, 30000)

	// Teste de alteração de usuário
	it('should update a user with valid data', async () => {
		const result = await testServer.put(`/users/${userId}`).send({
			nome: 'Joel',
			email: 'joel@gmail.com',
		})

		expect(result.status).toBe(204)
	}, 30000)

	// Teste de exclusão de usuário
	it('should delete a user with existing id', async () => {
		// Verifica se o ID do usuário foi armazenado corretamente
		expect(userId).toBeDefined()

		// Executa a exclusão do usuário usando o ID
		const deleteResult = await testServer.delete(`/users/${userId}`)

		// Verifica se a exclusão foi bem-sucedida
		expect(deleteResult.status).toBe(204)
	}, 30000)

	// Listar os usuários
	it('should return a list of users', async () => {
		const result = await testServer.get('/users')
		expect(result.status).toBe(200)
	}, 30000)
})
