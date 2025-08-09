import { User, UserSchema } from '../../src/entities/User'

/**
 * Testes unitários da Entity User
 * Testam apenas a lógica de domínio, sem dependências externas
 */
describe('User Entity - Unit Tests', () => {
	describe('Constructor', () => {
		it('should create user with valid data', () => {
			// Arrange
			const id = '123'
			const nome = 'João Silva'
			const email = 'joao@test.com'
			const createdAt = new Date()

			// Act
			const user = new User(id, nome, email, createdAt)

			// Assert
			expect(user.id).toBe(id)
			expect(user.nome).toBe(nome)
			expect(user.email).toBe(email)
			expect(user.createdAt).toBe(createdAt)
		})
	})

	describe('Factory Method - create', () => {
		it('should create user with factory method', () => {
			// Arrange
			const nome = 'Maria Silva'
			const email = 'maria@test.com'

			// Act
			const user = User.create(nome, email)

			// Assert
			expect(user.nome).toBe(nome)
			expect(user.email).toBe(email)
			expect(user.id).toBe('') // ID vazio por padrão
			expect(user.createdAt).toBeInstanceOf(Date)
		})

		it('should create user with custom id', () => {
			// Arrange
			const nome = 'Pedro Silva'
			const email = 'pedro@test.com'
			const customId = 'custom-123'

			// Act
			const user = User.create(nome, email, customId)

			// Assert
			expect(user.id).toBe(customId)
			expect(user.nome).toBe(nome)
			expect(user.email).toBe(email)
		})
	})

	describe('Validation Methods', () => {
		it('should validate correct user data', () => {
			// Arrange
			const user = new User('123', 'João Silva', 'joao@test.com', new Date())

			// Act & Assert
			expect(user.isValid()).toBe(true)
		})

		it('should invalidate user with short name', () => {
			// Arrange
			const user = new User('123', 'Jo', 'joao@test.com', new Date())

			// Act & Assert
			expect(user.isValid()).toBe(false)
		})

		it('should invalidate user with invalid email', () => {
			// Arrange
			const user = new User('123', 'João Silva', 'email-invalido', new Date())

			// Act & Assert
			expect(user.isValid()).toBe(false)
		})

		it('should return detailed validation errors', () => {
			// Arrange
			const user = new User('123', 'Jo', 'email-invalido', new Date())

			// Act
			const validation = user.validate()

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
			const result = UserSchema.safeParse(validData)

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
			const result = UserSchema.safeParse(invalidData)

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
			const result = UserSchema.safeParse(invalidData)

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
			const user = new User(id, nome, email, createdAt)

			// Act
			const json = user.toJSON()

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
