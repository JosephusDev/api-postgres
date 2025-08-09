import { Usuario } from '../../src/entities/Usuario'
import { IUsuarioRepository } from '../../src/interfaces'

/**
 * Mock implementations para testes
 * Simula comportamento de repositórios sem dependências externas
 */

export class InMemoryUsuarioRepository implements IUsuarioRepository {
	private users: Usuario[] = []
	private nextId = 1

	async findAll(): Promise<Usuario[]> {
		return [...this.users]
	}

	async findById(id: string): Promise<Usuario | null> {
		return this.users.find(user => user.id === id) || null
	}

	async findByEmail(email: string): Promise<Usuario | null> {
		return this.users.find(user => user.email === email) || null
	}

	async create(usuario: Usuario): Promise<Usuario> {
		const newUser = new Usuario(this.nextId.toString(), usuario.nome, usuario.email, new Date())
		this.users.push(newUser)
		this.nextId++
		return newUser
	}

	async update(id: string, data: Partial<Usuario>): Promise<Usuario> {
		const userIndex = this.users.findIndex(user => user.id === id)
		if (userIndex === -1) {
			throw new Error('Usuário não encontrado')
		}

		const existingUser = this.users[userIndex]
		const updatedUser = new Usuario(
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

	seed(users: Usuario[]): void {
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
