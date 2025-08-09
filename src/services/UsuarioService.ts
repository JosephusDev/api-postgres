import { Usuario, UsuarioValidationSchema } from '../entities/Usuario'
import { IUsuarioRepository, IUsuarioService, ICacheService } from '../interfaces'

/**
 * UsuarioService - Implementação da lógica de negócio
 * Segue o princípio SRP (Single Responsibility Principle)
 * Responsabilidade única: gerenciar regras de negócio de usuários
 * Segue o princípio DIP (Dependency Inversion Principle)
 * Depende de abstrações (interfaces) ao invés de implementações concretas
 * Segue o princípio OCP (Open/Closed Principle)
 * Pode ser estendido sem modificar o código existente
 */
export class UsuarioService implements IUsuarioService {
	private readonly CACHE_KEY = 'users'
	private readonly CACHE_TTL = 3600 // 1 hora

	constructor(
		private readonly usuarioRepository: IUsuarioRepository,
		private readonly cacheService: ICacheService,
	) {}

	async getAllUsuarios(): Promise<Usuario[]> {
		// Tenta buscar do cache primeiro
		const cached = await this.cacheService.get<Usuario[]>(this.CACHE_KEY)
		if (cached) {
			console.log('Dados vindos do cache')
			return cached.map(u => new Usuario(u.id, u.nome, u.email, u.createdAt))
		}

		// Se não encontrou no cache, busca do repositório
		const usuarios = await this.usuarioRepository.findAll()

		// Salva no cache para próximas consultas
		await this.cacheService.set(this.CACHE_KEY, usuarios, this.CACHE_TTL)

		return usuarios
	}

	async getUsuarioById(id: string): Promise<Usuario> {
		const usuario = await this.usuarioRepository.findById(id)
		if (!usuario) {
			throw new Error('Usuário não encontrado')
		}
		return usuario
	}

	async createUsuario(nome: string, email: string): Promise<Usuario> {
		// Validações de negócio usando Zod
		try {
			UsuarioValidationSchema.nome.parse(nome)
		} catch (error: any) {
			throw new Error(error.errors?.[0]?.message)
		}

		try {
			UsuarioValidationSchema.email.parse(email)
		} catch (error: any) {
			throw new Error(error.errors?.[0]?.message)
		}

		// Verifica se email já existe
		const existingUser = await this.usuarioRepository.findByEmail(email)
		if (existingUser) {
			throw new Error('Este e-mail já existe')
		}

		// Cria a entidade
		const usuario = Usuario.create(nome, email)

		// Persiste no repositório
		const created = await this.usuarioRepository.create(usuario)

		// Invalida o cache
		await this.cacheService.delete(this.CACHE_KEY)

		return created
	}

	async updateUsuario(id: string, nome: string, email: string): Promise<Usuario> {
		// Verifica se usuário existe
		const existingUser = await this.usuarioRepository.findById(id)
		if (!existingUser) {
			throw new Error('Usuário não encontrado')
		}

		// Validações de negócio usando Zod
		try {
			UsuarioValidationSchema.nome.parse(nome)
		} catch (error: any) {
			throw new Error(error.errors?.[0]?.message || 'O nome deve ter no mínimo 3 caracteres')
		}

		try {
			UsuarioValidationSchema.email.parse(email)
		} catch (error: any) {
			throw new Error(error.errors?.[0]?.message || 'O e-mail deve ser válido')
		}

		// Verifica se email já existe (exceto para o próprio usuário)
		const emailUser = await this.usuarioRepository.findByEmail(email)
		if (emailUser && emailUser.id !== id) {
			throw new Error('Este e-mail já existe')
		}

		// Atualiza no repositório
		const updated = await this.usuarioRepository.update(id, { nome, email })

		// Invalida o cache
		await this.cacheService.delete(this.CACHE_KEY)

		return updated
	}

	async deleteUsuario(id: string): Promise<void> {
		// Verifica se usuário existe
		const existingUser = await this.usuarioRepository.findById(id)
		if (!existingUser) {
			throw new Error('Usuário não encontrado')
		}

		// Remove do repositório
		await this.usuarioRepository.delete(id)

		// Invalida o cache
		await this.cacheService.delete(this.CACHE_KEY)
	}
}
