import { UsuarioService } from '../../src/services/UsuarioService'
import { Usuario } from '../../src/entities/Usuario'
import { IUsuarioRepository, ICacheService } from '../../src/interfaces'

/**
 * Testes unitários do UsuarioService usando mocks
 * Estes testes são rápidos e não dependem de infraestrutura externa
 */
describe('UsuarioService - Unit Tests', () => {
	let usuarioService: UsuarioService
	let mockRepository: jest.Mocked<IUsuarioRepository>
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
		usuarioService = new UsuarioService(mockRepository, mockCacheService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('getAllUsuarios', () => {
		it('should return cached users when cache is available', async () => {
			// Arrange
			const cachedUsers = [
				new Usuario('1', 'João', 'joao@test.com', new Date()),
				new Usuario('2', 'Maria', 'maria@test.com', new Date()),
			]
			mockCacheService.get.mockResolvedValue(cachedUsers)

			// Act
			const result = await usuarioService.getAllUsuarios()

			// Assert
			expect(result).toEqual(cachedUsers)
			expect(mockCacheService.get).toHaveBeenCalledWith('users')
			expect(mockRepository.findAll).not.toHaveBeenCalled()
		})

		it('should fetch from repository and cache when cache is empty', async () => {
			// Arrange
			const repoUsers = [new Usuario('1', 'João', 'joao@test.com', new Date())]
			mockCacheService.get.mockResolvedValue(null)
			mockRepository.findAll.mockResolvedValue(repoUsers)

			// Act
			const result = await usuarioService.getAllUsuarios()

			// Assert
			expect(result).toEqual(repoUsers)
			expect(mockCacheService.get).toHaveBeenCalledWith('users')
			expect(mockRepository.findAll).toHaveBeenCalled()
			expect(mockCacheService.set).toHaveBeenCalledWith('users', repoUsers, 3600)
		})
	})

	describe('createUsuario', () => {
		it('should create user successfully with valid data', async () => {
			// Arrange
			const nome = 'João Silva'
			const email = 'joao@test.com'
			const createdUser = new Usuario('123', nome, email, new Date())

			mockRepository.findByEmail.mockResolvedValue(null)
			mockRepository.create.mockResolvedValue(createdUser)

			// Act
			const result = await usuarioService.createUsuario(nome, email)

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
			const existingUser = new Usuario('456', 'Outro João', email, new Date())

			mockRepository.findByEmail.mockResolvedValue(existingUser)

			// Act & Assert
			await expect(usuarioService.createUsuario(nome, email)).rejects.toThrow('Este e-mail já existe')

			expect(mockRepository.create).not.toHaveBeenCalled()
		})

		it('should throw error when nome is invalid', async () => {
			// Arrange
			const nome = 'Jo' // menos de 3 caracteres
			const email = 'joao@test.com'

			// Act & Assert
			await expect(usuarioService.createUsuario(nome, email)).rejects.toThrow('O nome deve ter no mínimo 3 caracteres')

			expect(mockRepository.findByEmail).not.toHaveBeenCalled()
		})

		it('should throw error when email is invalid', async () => {
			// Arrange
			const nome = 'João Silva'
			const email = 'email-invalido' // sem @

			// Act & Assert
			await expect(usuarioService.createUsuario(nome, email)).rejects.toThrow('O e-mail deve ser válido')

			expect(mockRepository.findByEmail).not.toHaveBeenCalled()
		})
	})

	describe('updateUsuario', () => {
		it('should update user successfully', async () => {
			// Arrange
			const id = '123'
			const nome = 'João Atualizado'
			const email = 'joao.novo@test.com'
			const existingUser = new Usuario(id, 'João Antigo', 'joao.antigo@test.com', new Date())
			const updatedUser = new Usuario(id, nome, email, new Date())

			mockRepository.findById.mockResolvedValue(existingUser)
			mockRepository.findByEmail.mockResolvedValue(null)
			mockRepository.update.mockResolvedValue(updatedUser)

			// Act
			const result = await usuarioService.updateUsuario(id, nome, email)

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
			await expect(usuarioService.updateUsuario(id, nome, email)).rejects.toThrow('Usuário não encontrado')
		})
	})

	describe('deleteUsuario', () => {
		it('should delete user successfully', async () => {
			// Arrange
			const id = '123'
			const existingUser = new Usuario(id, 'João', 'joao@test.com', new Date())

			mockRepository.findById.mockResolvedValue(existingUser)

			// Act
			await usuarioService.deleteUsuario(id)

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
			await expect(usuarioService.deleteUsuario(id)).rejects.toThrow('Usuário não encontrado')

			expect(mockRepository.delete).not.toHaveBeenCalled()
		})
	})
})
