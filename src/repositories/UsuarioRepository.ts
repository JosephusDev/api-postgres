import { PrismaClient } from '@prisma/client'
import { Usuario } from '../entities/Usuario'
import { IUsuarioRepository } from '../interfaces/IUsuarioRepository'

/**
 * UsuarioRepository - Implementação concreta do repositório
 * Segue o princípio SRP (Single Responsibility Principle)
 * Responsabilidade única: gerenciar persistência de usuários
 * Segue o princípio DIP (Dependency Inversion Principle)
 * Implementa a interface IUsuarioRepository
 * Segue o princípio OCP (Open/Closed Principle)
 * Pode ser estendido sem modificar o código existente
 */
export class UsuarioRepository implements IUsuarioRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAll(): Promise<Usuario[]> {
		const usuarios = await this.prisma.usuario.findMany({
			orderBy: {
				nome: 'asc',
			},
		})

		return usuarios.map(usuario => new Usuario(usuario.id, usuario.nome, usuario.email || '', usuario.createdAt))
	}

	async findById(id: string): Promise<Usuario | null> {
		const usuario = await this.prisma.usuario.findUnique({
			where: { id },
		})

		if (!usuario) {
			return null
		}

		return new Usuario(usuario.id, usuario.nome, usuario.email || '', usuario.createdAt)
	}

	async findByEmail(email: string): Promise<Usuario | null> {
		const usuario = await this.prisma.usuario.findUnique({
			where: { email },
		})

		if (!usuario) {
			return null
		}

		return new Usuario(usuario.id, usuario.nome, usuario.email || '', usuario.createdAt)
	}

	async create(usuario: Usuario): Promise<Usuario> {
		const created = await this.prisma.usuario.create({
			data: {
				nome: usuario.nome,
				email: usuario.email,
			},
		})

		return new Usuario(created.id, created.nome, created.email || '', created.createdAt)
	}

	async update(id: string, data: Partial<Usuario>): Promise<Usuario> {
		const updated = await this.prisma.usuario.update({
			where: { id },
			data: {
				nome: data.nome,
				email: data.email,
			},
		})

		return new Usuario(updated.id, updated.nome, updated.email || '', updated.createdAt)
	}

	async delete(id: string): Promise<void> {
		await this.prisma.usuario.delete({
			where: { id },
		})
	}
}
