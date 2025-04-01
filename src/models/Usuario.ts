import { PrismaClient, Usuario } from '@prisma/client'
import client from '../config/redis'
import { env } from '../env'

const prisma = new PrismaClient()

export const getUsers = async () => {
	if (client.isOpen) {
		// Obtém os dados do cache com await
		const cache = await client.get(env.REDIS_CACHED_KEY)
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
	}
	// Obtém os dados do banco de dados
	const users = await prisma.usuario.findMany()

	if (client.isOpen) {
		// Salva os dados no cache
		const cachedUsers = JSON.stringify(users)
		await client.set(env.REDIS_CACHED_KEY, cachedUsers).catch(err => console.error('Erro ao salvar no cache:', err))
	}

	return users
}

export const createUser = async (data: Pick<Usuario, 'nome' | 'email'>) => {
	const result = await prisma.usuario.create({ data })
	if (client.isOpen) {
		// Remove o cache caso o usuário seja criado
		await client.del(env.REDIS_CACHED_KEY)
	}

	return result
}

export const updateUser = async (id: string, data: Pick<Usuario, 'nome' | 'email'>) => {
	if (client.isOpen) {
		// Remove o cache caso o usuário seja atualizado
		await client.del(env.REDIS_CACHED_KEY)
	}

	return await prisma.usuario.update({
		data,
		where: { id },
	})
}

export const deleteUser = async (id: string) => {
	if (client.isOpen) {
		// Remove o cache caso o usuário seja deletado
		await client.del(env.REDIS_CACHED_KEY)
	}
	return await prisma.usuario.delete({
		where: { id: id },
	})
}
