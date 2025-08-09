import { PrismaClient } from '@prisma/client'
import { createClient } from 'redis'
import { UsuarioRepository } from '../repositories/UsuarioRepository'
import { UsuarioService } from '../services/UsuarioService'
import { CacheService } from '../services/CacheService'
import { env } from '../env'

/**
 * ServiceFactory - Fábrica para criação de serviços
 * Segue o princípio DIP (Dependency Inversion Principle)
 * Centraliza a criação e injeção de dependências
 * Segue o princípio SRP (Single Responsibility Principle)
 * Responsabilidade única: criação e configuração de serviços
 */
export class ServiceFactory {
	private static instance: ServiceFactory
	private prisma: PrismaClient
	private redisClient: any
	private usuarioService: UsuarioService | null = null

	private constructor() {
		this.prisma = new PrismaClient()
		this.redisClient = createClient({ url: env.REDIS_URL })
		this.redisClient.on('error', (err: any) => console.log('Redis Client Error', err))
	}

	static getInstance(): ServiceFactory {
		if (!ServiceFactory.instance) {
			ServiceFactory.instance = new ServiceFactory()
		}
		return ServiceFactory.instance
	}

	async connectRedis(): Promise<void> {
		if (!this.redisClient.isOpen) {
			await this.redisClient.connect()
		}
	}

	async disconnectRedis(): Promise<void> {
		if (this.redisClient.isOpen) {
			await this.redisClient.disconnect()
		}
	}

	getUsuarioService(): UsuarioService {
		if (!this.usuarioService) {
			const usuarioRepository = new UsuarioRepository(this.prisma)
			const cacheService = new CacheService(this.redisClient)
			this.usuarioService = new UsuarioService(usuarioRepository, cacheService)
		}
		return this.usuarioService
	}

	getPrismaClient(): PrismaClient {
		return this.prisma
	}

	async disconnect(): Promise<void> {
		await this.disconnectRedis()
		await this.prisma.$disconnect()
	}
}
