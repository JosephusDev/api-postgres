import { z } from 'zod'

export const UserSchema = z.object({
	id: z.string().optional(),
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
	createdAt: z.date().optional(),
})

// Esquema correto para múltiplos usuários
export const UserArraySchema = z.array(UserSchema)

// tipagem do esquema com infer
export type User = z.infer<typeof UserSchema>
export type UserArray = z.infer<typeof UserArraySchema>
