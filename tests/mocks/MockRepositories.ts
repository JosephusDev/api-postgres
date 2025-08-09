import { User } from '../../src/entities/User'
import { IUserRepository } from '../../src/interfaces'

/**
 * Mock implementations para testes
 * Simula comportamento de repositórios sem dependências externas
 */

export class InMemoryUserRepository implements IUserRepository {
	private users: User[] = []
	private nextId = 1

	async findAll(): Promise<User[]> {
		return [...this.users]
	}

	async findById(id: string): Promise<User | null> {
		return this.users.find(user => user.id === id) || null
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.users.find(user => user.email === email) || null
	}

	async create(user: User): Promise<User> {
		const newUser = new User(this.nextId.toString(), user.nome, user.email, new Date())
		this.users.push(newUser)
		this.nextId++
		return newUser
	}

	async update(id: string, data: Partial<User>): Promise<User> {
		const userIndex = this.users.findIndex(user => user.id === id)
		if (userIndex === -1) {
			throw new Error('Usuário não encontrado')
		}

		const existingUser = this.users[userIndex]
		const updatedUser = new User(
			id,
			data.nome || existingUser.nome,
			data.email || existingUser.email,
			existingUser.createdAt,
		)

		this.users[userIndex] = updatedUser
		return updatedUser
	}

	async delete(id: string): Promise<void> {
		const userIndex = this.users.findIndex(user => user.id === id)
		if (userIndex === -1) {
			throw new Error('Usuário não encontrado')
		}
		this.users.splice(userIndex, 1)
	}

	// Métodos auxiliares para testes
	clear(): void {
		this.users = []
		this.nextId = 1
	}

	seed(users: User[]): void {
		this.users = [...users]
	}
}

export class MockCacheService {
	private cache = new Map<string, any>()
	private connected = true

	async get<T>(key: string): Promise<T | null> {
		return this.cache.get(key) || null
	}

	async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
		this.cache.set(key, value)

		// Simula TTL se especificado
		if (ttlSeconds) {
			setTimeout(() => {
				this.cache.delete(key)
			}, ttlSeconds * 1000)
		}
	}

	async delete(key: string): Promise<void> {
		this.cache.delete(key)
	}

	isConnected(): boolean {
		return this.connected
	}

	// Métodos auxiliares para testes
	clear(): void {
		this.cache.clear()
	}

	setConnected(connected: boolean): void {
		this.connected = connected
	}

	getCache(): Map<string, any> {
		return this.cache
	}
}
