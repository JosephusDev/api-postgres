import { ICacheService } from '../interfaces/ICacheService'

/**
 * CacheService - Implementação concreta do serviço de cache
 * Segue o princípio SRP (Single Responsibility Principle)
 * Responsabilidade única: gerenciar operações de cache
 * Segue o princípio DIP (Dependency Inversion Principle)
 * Implementa a interface ICacheService
 * Segue o princípio OCP (Open/Closed Principle)
 * Pode ser estendido sem modificar o código existente
 */
export class CacheService implements ICacheService {
	constructor(private readonly client: any) {}

	async get<T>(key: string): Promise<T | null> {
		if (!this.isConnected()) {
			return null
		}

		try {
			const cached = await this.client.get(key)
			if (!cached) {
				return null
			}

			return JSON.parse(cached, (k, value) => {
				// Converte strings de data de volta para objetos Date
				if (k === 'createdAt' || k === 'updatedAt') {
					return new Date(value)
				}
				return value
			}) as T
		} catch (error) {
			console.error('Erro ao buscar do cache:', error)
			return null
		}
	}

	async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
		if (!this.isConnected()) {
			return
		}

		try {
			const serialized = JSON.stringify(value)
			if (ttlSeconds) {
				await this.client.setEx(key, ttlSeconds, serialized)
			} else {
				await this.client.set(key, serialized)
			}
		} catch (error) {
			console.error('Erro ao salvar no cache:', error)
		}
	}

	async delete(key: string): Promise<void> {
		if (!this.isConnected()) {
			return
		}

		try {
			await this.client.del(key)
		} catch (error) {
			console.error('Erro ao deletar do cache:', error)
		}
	}

	isConnected(): boolean {
		return this.client.isOpen
	}
}
