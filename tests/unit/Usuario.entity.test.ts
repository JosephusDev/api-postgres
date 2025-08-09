import { Usuario, UsuarioSchema } from '../../src/entities/Usuario'

/**
 * Testes unitários da Entity Usuario
 * Testam apenas a lógica de domínio, sem dependências externas
 */
describe('Usuario Entity - Unit Tests', () => {
	describe('Constructor', () => {
		it('should create user with valid data', () => {
			// Arrange
			const id = '123'
			const nome = 'João Silva'
			const email = 'joao@test.com'
			const createdAt = new Date()

			// Act
			const usuario = new Usuario(id, nome, email, createdAt)

			// Assert
			expect(usuario.id).toBe(id)
			expect(usuario.nome).toBe(nome)
			expect(usuario.email).toBe(email)
			expect(usuario.createdAt).toBe(createdAt)
		})
	})

	describe('Factory Method - create', () => {
		it('should create user with factory method', () => {
			// Arrange
			const nome = 'Maria Silva'
			const email = 'maria@test.com'

			// Act
			const usuario = Usuario.create(nome, email)

			// Assert
			expect(usuario.nome).toBe(nome)
			expect(usuario.email).toBe(email)
			expect(usuario.id).toBe('') // ID vazio por padrão
			expect(usuario.createdAt).toBeInstanceOf(Date)
		})

		it('should create user with custom id', () => {
			// Arrange
			const nome = 'Pedro Silva'
			const email = 'pedro@test.com'
			const customId = 'custom-123'

			// Act
			const usuario = Usuario.create(nome, email, customId)

			// Assert
			expect(usuario.id).toBe(customId)
			expect(usuario.nome).toBe(nome)
			expect(usuario.email).toBe(email)
		})
	})

	describe('Validation Methods', () => {
		it('should validate correct user data', () => {
			// Arrange
			const usuario = new Usuario('123', 'João Silva', 'joao@test.com', new Date())

			// Act & Assert
			expect(usuario.isValid()).toBe(true)
		})

		it('should invalidate user with short name', () => {
			// Arrange
			const usuario = new Usuario('123', 'Jo', 'joao@test.com', new Date())

			// Act & Assert
			expect(usuario.isValid()).toBe(false)
		})

		it('should invalidate user with invalid email', () => {
			// Arrange
			const usuario = new Usuario('123', 'João Silva', 'email-invalido', new Date())

			// Act & Assert
			expect(usuario.isValid()).toBe(false)
		})

		it('should return detailed validation errors', () => {
			// Arrange
			const usuario = new Usuario('123', 'Jo', 'email-invalido', new Date())

			// Act
			const validation = usuario.validate()

			// Assert
			expect(validation.isValid).toBe(false)
			expect(validation.errors).toBeDefined()
			expect(validation.errors?.length).toBeGreaterThan(0)
		})
	})

	describe('Schema Validation', () => {
		it('should validate correct data with schema', () => {
			// Arrange
			const validData = {
				id: '123',
				nome: 'João Silva',
				email: 'joao@test.com',
				createdAt: new Date(),
			}

			// Act
			const result = UsuarioSchema.safeParse(validData)

			// Assert
			expect(result.success).toBe(true)
		})

		it('should reject invalid name with schema', () => {
			// Arrange
			const invalidData = {
				nome: 'Jo', // muito curto
				email: 'joao@test.com',
			}

			// Act
			const result = UsuarioSchema.safeParse(invalidData)

			// Assert
			expect(result.success).toBe(false)
		})

		it('should reject invalid email with schema', () => {
			// Arrange
			const invalidData = {
				nome: 'João Silva',
				email: 'email-invalido',
			}

			// Act
			const result = UsuarioSchema.safeParse(invalidData)

			// Assert
			expect(result.success).toBe(false)
		})
	})

	describe('toJSON Method', () => {
		it('should convert user to JSON object', () => {
			// Arrange
			const id = '123'
			const nome = 'João Silva'
			const email = 'joao@test.com'
			const createdAt = new Date()
			const usuario = new Usuario(id, nome, email, createdAt)

			// Act
			const json = usuario.toJSON()

			// Assert
			expect(json).toEqual({
				id,
				nome,
				email,
				createdAt,
			})
		})
	})
})
