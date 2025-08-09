import { User, UserValidationSchema } from '../entities/User'
import { IUserRepository, IUserService, ICacheService } from '../interfaces'

/**
 * UserService - Implementação da lógica de negócio
 * Segue o princípio SRP (Single Responsibility Principle)
 * Responsabilidade única: gerenciar regras de negócio de usuários
 * Segue o princípio DIP (Dependency Inversion Principle)
 * Depende de abstrações (interfaces) ao invés de implementações concretas
 * Segue o princípio OCP (Open/Closed Principle)
 * Pode ser estendido sem modificar o código existente
 */
export class UserService implements IUserService {
	private readonly CACHE_KEY = 'users'
	private readonly CACHE_TTL = 3600 // 1 hora

	constructor(
		private readonly UserRepository: IUserRepository,
		private readonly cacheService: ICacheService,
	) {}

	async getAllUsers(): Promise<User[]> {
		// Tenta buscar do cache primeiro
		const cached = await this.cacheService.get<User[]>(this.CACHE_KEY)
		if (cached) {
			console.log('Dados vindos do cache')
			return cached.map(u => new User(u.id, u.nome, u.email, u.createdAt))
		}

		// Se não encontrou no cache, busca do repositório
		const Users = await this.UserRepository.findAll()

		// Salva no cache para próximas consultas
		await this.cacheService.set(this.CACHE_KEY, Users, this.CACHE_TTL)

		return Users
	}

	async getUserById(id: string): Promise<User> {
		const User = await this.UserRepository.findById(id)
		if (!User) {
			throw new Error('Usuário não encontrado')
		}
		return User
	}

	async createUser(nome: string, email: string): Promise<User> {
		// Validações de negócio usando Zod
		try {
			UserValidationSchema.nome.parse(nome)
		} catch (error: any) {
			throw new Error(error.errors?.[0]?.message)
		}

		try {
			UserValidationSchema.email.parse(email)
		} catch (error: any) {
			throw new Error(error.errors?.[0]?.message)
		}

		// Verifica se email já existe
		const existingUser = await this.UserRepository.findByEmail(email)
		if (existingUser) {
			throw new Error('Este e-mail já existe')
		}

		// Cria a entidade
		const user = User.create(nome, email)

		// Persiste no repositório
		const created = await this.UserRepository.create(user)

		// Invalida o cache
		await this.cacheService.delete(this.CACHE_KEY)

		return created
	}

	async updateUser(id: string, nome: string, email: string): Promise<User> {
		// Verifica se usuário existe
		const existingUser = await this.UserRepository.findById(id)
		if (!existingUser) {
			throw new Error('Usuário não encontrado')
		}

		// Validações de negócio usando Zod
		try {
			UserValidationSchema.nome.parse(nome)
		} catch (error: any) {
			throw new Error(error.errors?.[0]?.message || 'O nome deve ter no mínimo 3 caracteres')
		}

		try {
			UserValidationSchema.email.parse(email)
		} catch (error: any) {
			throw new Error(error.errors?.[0]?.message || 'O e-mail deve ser válido')
		}

		// Verifica se email já existe (exceto para o próprio usuário)
		const emailUser = await this.UserRepository.findByEmail(email)
		if (emailUser && emailUser.id !== id) {
			throw new Error('Este e-mail já existe')
		}

		// Atualiza no repositório
		const updated = await this.UserRepository.update(id, { nome, email })

		// Invalida o cache
		await this.cacheService.delete(this.CACHE_KEY)

		return updated
	}

	async deleteUser(id: string): Promise<void> {
		// Verifica se usuário existe
		const existingUser = await this.UserRepository.findById(id)
		if (!existingUser) {
			throw new Error('Usuário não encontrado')
		}

		// Remove do repositório
		await this.UserRepository.delete(id)

		// Invalida o cache
		await this.cacheService.delete(this.CACHE_KEY)
	}
}
