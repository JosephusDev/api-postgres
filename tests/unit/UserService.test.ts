import { UserService } from '../../src/services/UserService'
import { User } from '../../src/entities/User'
import { IUserRepository, ICacheService } from '../../src/interfaces'

/**
 * Testes unitários do UserService usando mocks
 * Estes testes são rápidos e não dependem de infraestrutura externa
 */
describe('UserService - Unit Tests', () => {
	let userService: UserService
	let mockRepository: jest.Mocked<IUserRepository>
	let mockCacheService: jest.Mocked<ICacheService>

	beforeEach(() => {
		// Mock do Repository
		mockRepository = {
			findAll: jest.fn(),
			findById: jest.fn(),
			findByEmail: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		}

		// Mock do Cache Service
		mockCacheService = {
			get: jest.fn(),
			set: jest.fn(),
			delete: jest.fn(),
			isConnected: jest.fn(),
		}

		// Instância do service com dependências mockadas
		userService = new UserService(mockRepository, mockCacheService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('getAllUsers', () => {
		it('should return cached users when cache is available', async () => {
			// Arrange
			const cachedUsers = [
				new User('1', 'João', 'joao@test.com', new Date()),
				new User('2', 'Maria', 'maria@test.com', new Date()),
			]
			mockCacheService.get.mockResolvedValue(cachedUsers)

			// Act
			const result = await userService.getAllUsers()

			// Assert
			expect(result).toEqual(cachedUsers)
			expect(mockCacheService.get).toHaveBeenCalledWith('users')
			expect(mockRepository.findAll).not.toHaveBeenCalled()
		})

		it('should fetch from repository and cache when cache is empty', async () => {
			// Arrange
			const repoUsers = [new User('1', 'João', 'joao@test.com', new Date())]
			mockCacheService.get.mockResolvedValue(null)
			mockRepository.findAll.mockResolvedValue(repoUsers)

			// Act
			const result = await userService.getAllUsers()

			// Assert
			expect(result).toEqual(repoUsers)
			expect(mockCacheService.get).toHaveBeenCalledWith('users')
			expect(mockRepository.findAll).toHaveBeenCalled()
			expect(mockCacheService.set).toHaveBeenCalledWith('users', repoUsers, 3600)
		})
	})

	describe('createUser', () => {
		it('should create user successfully with valid data', async () => {
			// Arrange
			const nome = 'João Silva'
			const email = 'joao@test.com'
			const createdUser = new User('123', nome, email, new Date())

			mockRepository.findByEmail.mockResolvedValue(null)
			mockRepository.create.mockResolvedValue(createdUser)

			// Act
			const result = await userService.createUser(nome, email)

			// Assert
			expect(result).toEqual(createdUser)
			expect(mockRepository.findByEmail).toHaveBeenCalledWith(email)
			expect(mockRepository.create).toHaveBeenCalled()
			expect(mockCacheService.delete).toHaveBeenCalledWith('users')
		})

		it('should throw error when email already exists', async () => {
			// Arrange
			const nome = 'João Silva'
			const email = 'joao@test.com'
			const existingUser = new User('456', 'Outro João', email, new Date())

			mockRepository.findByEmail.mockResolvedValue(existingUser)

			// Act & Assert
			await expect(userService.createUser(nome, email)).rejects.toThrow('Este e-mail já existe')

			expect(mockRepository.create).not.toHaveBeenCalled()
		})

		it('should throw error when nome is invalid', async () => {
			// Arrange
			const nome = 'Jo' // menos de 3 caracteres
			const email = 'joao@test.com'

			// Act & Assert
			await expect(userService.createUser(nome, email)).rejects.toThrow('O nome deve ter no mínimo 3 caracteres')

			expect(mockRepository.findByEmail).not.toHaveBeenCalled()
		})

		it('should throw error when email is invalid', async () => {
			// Arrange
			const nome = 'João Silva'
			const email = 'email-invalido' // sem @

			// Act & Assert
			await expect(userService.createUser(nome, email)).rejects.toThrow('O e-mail deve ser válido')

			expect(mockRepository.findByEmail).not.toHaveBeenCalled()
		})
	})

	describe('updateUser', () => {
		it('should update user successfully', async () => {
			// Arrange
			const id = '123'
			const nome = 'João Atualizado'
			const email = 'joao.novo@test.com'
			const existingUser = new User(id, 'João Antigo', 'joao.antigo@test.com', new Date())
			const updatedUser = new User(id, nome, email, new Date())

			mockRepository.findById.mockResolvedValue(existingUser)
			mockRepository.findByEmail.mockResolvedValue(null)
			mockRepository.update.mockResolvedValue(updatedUser)

			// Act
			const result = await userService.updateUser(id, nome, email)

			// Assert
			expect(result).toEqual(updatedUser)
			expect(mockRepository.findById).toHaveBeenCalledWith(id)
			expect(mockRepository.update).toHaveBeenCalledWith(id, { nome, email })
			expect(mockCacheService.delete).toHaveBeenCalledWith('users')
		})

		it('should throw error when user not found', async () => {
			// Arrange
			const id = '999'
			const nome = 'João'
			const email = 'joao@test.com'

			mockRepository.findById.mockResolvedValue(null)

			// Act & Assert
			await expect(userService.updateUser(id, nome, email)).rejects.toThrow('Usuário não encontrado')
		})
	})

	describe('deleteUser', () => {
		it('should delete user successfully', async () => {
			// Arrange
			const id = '123'
			const existingUser = new User(id, 'João', 'joao@test.com', new Date())

			mockRepository.findById.mockResolvedValue(existingUser)

			// Act
			await userService.deleteUser(id)

			// Assert
			expect(mockRepository.findById).toHaveBeenCalledWith(id)
			expect(mockRepository.delete).toHaveBeenCalledWith(id)
			expect(mockCacheService.delete).toHaveBeenCalledWith('users')
		})

		it('should throw error when user not found', async () => {
			// Arrange
			const id = '999'

			mockRepository.findById.mockResolvedValue(null)

			// Act & Assert
			await expect(userService.deleteUser(id)).rejects.toThrow('Usuário não encontrado')

			expect(mockRepository.delete).not.toHaveBeenCalled()
		})
	})
})
