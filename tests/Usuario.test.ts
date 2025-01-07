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
	})

	// Teste de criação de usuário
	it('should update a user with valid data', async () => {
		const result = await testServer.put(`/users?id=${userId}`).send({
			nome: 'Joel',
			email: 'joel@gmail.com',
		})

		expect(result.status).toBe(204)
	})

	// Teste de exclusão de usuário
	it('should delete a user with existing id', async () => {
		// Verifica se o ID do usuário foi armazenado corretamente
		expect(userId).toBeDefined()

		// Executa a exclusão do usuário usando o ID
		const deleteResult = await testServer.delete(`/users?id=${userId}`)

		// Verifica se a exclusão foi bem-sucedida
		expect(deleteResult.status).toBe(204)
	})

	// Listar os usuários
	it('should return a list of users', async () => {
		const result = await testServer.get('/users')
		expect(result.status).toBe(200)
	})
})
