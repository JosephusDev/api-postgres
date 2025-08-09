/**
 * Interface ICacheService
 * Segue o princípio ISP (Interface Segregation Principle)
 * Define apenas os métodos necessários para operações de cache
 * Segue o princípio DIP (Dependency Inversion Principle)
 * Permite diferentes implementações de cache (Redis, Memory, etc.)
 */
export interface ICacheService {
	get<T>(key: string): Promise<T | null>
	set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
	delete(key: string): Promise<void>
	isConnected(): boolean
}
