import { testServer } from './jest.setup'

let userId: string = ''

describe('User CRUD Operations', () => {
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
	it('should return an error when data is not valid', async () => {
		const result = await testServer.post('/users').send({
			nome: 'Teste',
		})
		expect(result.status).toBe(400)
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
