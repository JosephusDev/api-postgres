import { FastifyRequest, FastifyReply } from 'fastify'
import { UsuarioSchema } from '../entities/Usuario'
import { z } from 'zod'
import { ServiceFactory } from '../factories/ServiceFactory'

/**
 * UsuarioController - Controlador refatorado seguindo SOLID
 * Segue o princípio SRP (Single Responsibility Principle)
 * Responsabilidade única: coordenar requisições HTTP e respostas
 * Segue o princípio DIP (Dependency Inversion Principle)
 * Depende da abstração (IUsuarioService) ao invés de implementação concreta
 * Segue o princípio OCP (Open/Closed Principle)
 * Fechado para modificação, aberto para extensão
 */

const serviceFactory = ServiceFactory.getInstance()

export const getAll = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		console.time('Get users')
		const usuarioService = serviceFactory.getUsuarioService()
		const users = await usuarioService.getAllUsuarios()
		console.timeEnd('Get users')

		// Converte as entidades para objetos simples para a resposta
		const response = users.map(user => user.toJSON())
		return res.status(200).send(response)
	} catch (error) {
		console.error('Erro ao buscar usuários:', error)
		return res.status(500).send({ error: 'Erro interno do servidor' })
	}
}

export const Create = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		// Validação manual de entrada usando Zod para controlar mensagens de erro
		const validation = UsuarioSchema.safeParse(req.body)

		if (!validation.success) {
			// Retorna apenas a mensagem de erro limpa
			const firstError = validation.error.errors[0]
			return res.status(400).send({
				message: firstError.message,
			})
		}

		const data = validation.data
		const usuarioService = serviceFactory.getUsuarioService()
		const result = await usuarioService.createUsuario(data.nome, data.email)

		res.status(201).send(result.toJSON())
	} catch (error) {
		if (error instanceof Error) {
			// Erros de negócio vindos do service
			if (
				error.message.includes('já existe') ||
				error.message.includes('deve ser válido') ||
				error.message.includes('mínimo')
			) {
				res.status(400).send({ message: error.message })
			} else {
				res.status(500).send({ message: 'Erro interno do servidor' })
			}
		} else {
			res.status(500).send({
				message: 'Erro interno do servidor',
			})
		}
	}
}

export const Update = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { id } = req.params as { id: string }

		// Validação manual de entrada usando Zod para controlar mensagens de erro
		const validation = UsuarioSchema.safeParse(req.body)

		if (!validation.success) {
			// Retorna apenas a mensagem de erro limpa
			const firstError = validation.error.errors[0]
			return res.status(400).send({
				message: firstError.message,
			})
		}

		const data = validation.data
		const usuarioService = serviceFactory.getUsuarioService()
		await usuarioService.updateUsuario(id, data.nome, data.email)

		res.status(204).send({ message: 'Atualizado com sucesso.' })
	} catch (error) {
		if (error instanceof Error) {
			// Erros de negócio vindos do service
			if (error.message === 'Usuário não encontrado') {
				res.status(404).send({ message: error.message })
			} else if (
				error.message.includes('já existe') ||
				error.message.includes('deve ser válido') ||
				error.message.includes('mínimo')
			) {
				res.status(400).send({ message: error.message })
			} else {
				res.status(500).send({ message: 'Erro interno do servidor' })
			}
		} else {
			res.status(500).send({ message: 'Erro interno do servidor' })
		}
	}
}

export const Delete = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { id } = req.params as { id: string }

		const usuarioService = serviceFactory.getUsuarioService()
		await usuarioService.deleteUsuario(id)

		res.status(204).send({ message: 'Eliminado com sucesso.' })
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === 'Usuário não encontrado') {
				res.status(404).send({ message: error.message })
			} else {
				res.status(500).send({ message: 'Erro interno do servidor' })
			}
		} else {
			res.status(500).send({ message: 'Erro interno do servidor' })
		}
	}
}
