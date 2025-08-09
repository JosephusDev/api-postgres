import { z } from 'zod'

/**
 * Schemas de validação para a entidade Usuario
 * Centraliza todas as regras de validação usando Zod
 */
export const UsuarioValidationSchema = {
	nome: z
		.string({
			message: 'O nome é obrigatório',
		})
		.min(3, 'O nome deve ter no mínimo 3 caracteres'),

	email: z
		.string({
			message: 'O e-mail é obrigatório',
		})
		.email('O e-mail deve ser válido'),

	id: z.string().optional(),

	createdAt: z.date().optional(),
}

/**
 * Schema completo para validação de Usuario
 */
export const UsuarioSchema = z.object(UsuarioValidationSchema)

/**
 * Entity Usuario - Representa a entidade de domínio Usuario
 * Segue o princípio SRP (Single Responsibility Principle)
 * Responsabilidade única: representar um usuário no domínio
 */
export class Usuario {
	constructor(
		public readonly id: string,
		public readonly nome: string,
		public readonly email: string,
		public readonly createdAt: Date,
	) {}

	/**
	 * Método de fábrica para criar um novo usuário
	 * Garante que as regras de criação estão centralizadas
	 */
	static create(nome: string, email: string, id?: string): Usuario {
		return new Usuario(id || '', nome, email, new Date())
	}

	/**
	 * Valida toda a entidade usando Zod
	 * Retorna true se válida, false caso contrário
	 */
	isValid(): boolean {
		try {
			UsuarioSchema.parse({
				id: this.id,
				nome: this.nome,
				email: this.email,
				createdAt: this.createdAt,
			})
			return true
		} catch {
			return false
		}
	}

	/**
	 * Valida toda a entidade e retorna os erros detalhados
	 * Útil para debug e mensagens de erro específicas
	 */
	validate(): { isValid: boolean; errors?: string[] } {
		try {
			UsuarioSchema.parse({
				id: this.id,
				nome: this.nome,
				email: this.email,
				createdAt: this.createdAt,
			})
			return { isValid: true }
		} catch (error) {
			if (error instanceof z.ZodError) {
				return {
					isValid: false,
					errors: error.errors.map(err => err.message),
				}
			}
			return { isValid: false, errors: ['Erro de validação desconhecido'] }
		}
	}

	/**
	 * Converte a entidade para um objeto simples
	 * Útil para serialização e resposta da API
	 */
	toJSON() {
		return {
			id: this.id,
			nome: this.nome,
			email: this.email,
			createdAt: this.createdAt,
		}
	}
}
