import { UsuarioService } from '../../src/services/UsuarioService'
import { InMemoryUsuarioRepository, MockCacheService } from '../mocks/MockRepositories'
import { Usuario } from '../../src/entities/Usuario'

/**
 * Testes de integração usando mocks in-memory
 * Testa a integração entre Service, Repository e Cache
 * Mais rápidos que testes E2E, mas testam fluxos completos
 */
describe('Usuario Integration Tests', () => {
	let usuarioService: UsuarioService
	let repository: InMemoryUsuarioRepository
	let cacheService: MockCacheService

	beforeEach(() => {
		repository = new InMemoryUsuarioRepository()
		cacheService = new MockCacheService()
		usuarioService = new UsuarioService(repository, cacheService)
	})

	afterEach(() => {
		repository.clear()
		cacheService.clear()
	})

	describe('Complete User Lifecycle', () => {
		it('should handle complete CRUD operations', async () => {
			// CREATE
			const createdUser = await usuarioService.createUsuario('João Silva', 'joao@test.com')
			expect(createdUser.nome).toBe('João Silva')
			expect(createdUser.email).toBe('joao@test.com')
			expect(createdUser.id).toBeTruthy()

			// READ
			const foundUser = await usuarioService.getUsuarioById(createdUser.id)
			expect(foundUser).toEqual(createdUser)

			// UPDATE
			const updatedUser = await usuarioService.updateUsuario(createdUser.id, 'João Santos', 'joao.santos@test.com')
			expect(updatedUser.nome).toBe('João Santos')
			expect(updatedUser.email).toBe('joao.santos@test.com')

			// LIST
			const allUsers = await usuarioService.getAllUsuarios()
			expect(allUsers).toHaveLength(1)
			expect(allUsers[0].nome).toBe('João Santos')

			// DELETE
			await usuarioService.deleteUsuario(createdUser.id)

			// Verify deletion
			await expect(usuarioService.getUsuarioById(createdUser.id)).rejects.toThrow('Usuário não encontrado')
		})

		it('should handle cache correctly', async () => {
			// Seed repository with data
			const user1 = new Usuario('1', 'João', 'joao@test.com', new Date())
			const user2 = new Usuario('2', 'Maria', 'maria@test.com', new Date())
			repository.seed([user1, user2])

			// First call should hit repository and cache
			const users1 = await usuarioService.getAllUsuarios()
			expect(users1).toHaveLength(2)
			expect(cacheService.getCache().has('users')).toBe(true)

			// Second call should hit cache
			const users2 = await usuarioService.getAllUsuarios()
			expect(users2).toHaveLength(2)

			// Cache should be invalidated after create
			await usuarioService.createUsuario('Pedro', 'pedro@test.com')
			expect(cacheService.getCache().has('users')).toBe(false)
		})

		it('should handle cache disconnection gracefully', async () => {
			// Simula cache desconectado
			cacheService.setConnected(false)

			const user = await usuarioService.createUsuario('João', 'joao@test.com')
			expect(user.nome).toBe('João')

			// Mesmo com cache desconectado, deve funcionar
			const users = await usuarioService.getAllUsuarios()
			expect(users).toHaveLength(1)
		})
	})

	describe('Business Rules Validation', () => {
		it('should prevent duplicate emails', async () => {
			// Create first user
			await usuarioService.createUsuario('João', 'joao@test.com')

			// Try to create user with same email
			await expect(usuarioService.createUsuario('Maria', 'joao@test.com')).rejects.toThrow('Este e-mail já existe')
		})

		it('should validate input data', async () => {
			// Invalid name
			await expect(usuarioService.createUsuario('Jo', 'joao@test.com')).rejects.toThrow(
				'O nome deve ter no mínimo 3 caracteres',
			)

			// Invalid email
			await expect(usuarioService.createUsuario('João Silva', 'email-invalido')).rejects.toThrow(
				'O e-mail deve ser válido',
			)
		})

		it('should prevent updating to existing email', async () => {
			// Create two users
			const user1 = await usuarioService.createUsuario('João', 'joao@test.com')
			await usuarioService.createUsuario('Maria', 'maria@test.com')

			// Try to update user1 to use user2's email
			await expect(usuarioService.updateUsuario(user1.id, 'João Silva', 'maria@test.com')).rejects.toThrow(
				'Este e-mail já existe',
			)
		})

		it('should allow updating user with same email', async () => {
			// Create user
			const user = await usuarioService.createUsuario('João', 'joao@test.com')

			// Update with same email should work
			const updatedUser = await usuarioService.updateUsuario(user.id, 'João Silva', 'joao@test.com')

			expect(updatedUser.nome).toBe('João Silva')
			expect(updatedUser.email).toBe('joao@test.com')
		})
	})

	describe('Error Handling', () => {
		it('should handle non-existent user operations', async () => {
			const fakeId = '999'

			await expect(usuarioService.getUsuarioById(fakeId)).rejects.toThrow('Usuário não encontrado')

			await expect(usuarioService.updateUsuario(fakeId, 'Nome', 'email@test.com')).rejects.toThrow(
				'Usuário não encontrado',
			)

			await expect(usuarioService.deleteUsuario(fakeId)).rejects.toThrow('Usuário não encontrado')
		})
	})
})
