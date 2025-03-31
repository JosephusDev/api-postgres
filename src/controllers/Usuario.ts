import { FastifyRequest, FastifyReply } from 'fastify'
import { UserSchema } from '../schema/Usuario'
import { z } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { createUser, deleteUser, getUsers, updateUser } from '../models/Usuario'

export const getAll = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		console.time('Get users')
		const users = await getUsers()
		console.timeEnd('Get users')
		return res.status(200).send(users)
	} catch (error) {
		console.error('Erro ao buscar usuários:', error)
		return res.status(500).send({ error: 'Erro interno do servidor' })
	}
}

export const Create = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const data = UserSchema.parse(req.body)
		const result = await createUser(data)
		res.status(201).send(result)
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).send({
				message: error.errors[0].message,
			})
		} else if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
			res.status(400).send({ message: 'Este e-mail já existe.' })
		} else {
			res.status(500).send({
				message: 'Erro: ' + error,
			})
		}
	}
}

export const Update = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { id } = req.params as { id: string }
		const data = UserSchema.parse(req.body)
		await updateUser(id, data)
		res.status(204).send({ message: 'Atualizado com sucesso.' })
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.log(error)
			res.status(400).send({
				message: error.errors[0].message,
			})
		} else if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
			res.status(404).send({ message: 'Usuário inexistente' })
		} else {
			res.status(500).send({ message: 'Erro: ' + error })
		}
	}
}

export const Delete = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { id } = req.params as { id: string }
		await deleteUser(id)
		res.status(204).send({ message: 'Eliminado com sucesso.' })
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
			res.status(404).send({ message: 'Usuário inexistente' })
		} else {
			res.status(500).send({ message: 'Erro: ' + error })
		}
	}
}
