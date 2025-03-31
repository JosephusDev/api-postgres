import { PrismaClient, Usuario } from '@prisma/client'
import redis from '../config/redis'

const prisma = new PrismaClient()

export const getUsers = async () => {
	const cachedKey = 'users:all'
	// Obtém os dados do cache com await
	const cache = await redis.get(cachedKey)
	if (cache) {
		console.log('cache')
		const cachedUsers = JSON.parse(cache, (key, value) => {
			// Converte strings de data de volta para objetos Date
			if (key === 'createdAt' || key === 'updatedAt') {
				return new Date(value)
			}
			return value
		}) as Usuario[]
		return cachedUsers
	}
	// Obtém os dados do banco de dados
	const users = await prisma.usuario.findMany()
	// Salva os dados no cache por 60 segundos
	await redis
		.set(cachedKey, JSON.stringify(users), 'EX', 120)
		.catch(err => console.error('Erro ao salvar no cache:', err))
	return users
}

export const createUser = async (data: Pick<Usuario, 'nome' | 'email'>) => {
	const result = await prisma.usuario.create({ data })
	return result
}

export const updateUser = async (id: string, data: Pick<Usuario, 'nome' | 'email'>) => {
	return await prisma.usuario.update({
		data,
		where: { id },
	})
}

export const deleteUser = async (id: string) => {
	await prisma.usuario.delete({
		where: { id: id },
	})
}
