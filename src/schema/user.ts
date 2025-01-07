import { z } from 'zod'
export const UserSchema = z.object({
    nome: z.string().min(2, 'O nome é obrigatório'),
    email: z.string().email('O e-mail deve ser válido'),
})