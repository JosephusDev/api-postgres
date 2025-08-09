import { PrismaClient } from '@prisma/client'
import { User } from '../entities/User'
import { IUserRepository } from '../interfaces/IUserRepository'

/**
 * UserRepository - Implementação concreta do repositório
 * Segue o princípio SRP (Single Responsibility Principle)
 * Responsabilidade única: gerenciar persistência de usuários
 * Segue o princípio DIP (Dependency Inversion Principle)
 * Implementa a interface IUserRepository
 * Segue o princípio OCP (Open/Closed Principle)
 * Pode ser estendido sem modificar o código existente
 */
export class UserRepository implements IUserRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAll(): Promise<User[]> {
		const Users = await this.prisma.user.findMany({
			orderBy: {
				nome: 'asc',
			},
		})

		return Users.map(user => new User(user.id, user.nome, user.email || '', user.createdAt))
	}

	async findById(id: string): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: { id },
		})

		if (!user) {
			return null
		}

		return new User(user.id, user.nome, user.email || '', user.createdAt)
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: { email },
		})

		if (!user) {
			return null
		}

		return new User(user.id, user.nome, user.email || '', user.createdAt)
	}

	async create(user: User): Promise<User> {
		const created = await this.prisma.user.create({
			data: {
				nome: user.nome,
				email: user.email,
			},
		})

		return new User(created.id, created.nome, created.email || '', created.createdAt)
	}

	async update(id: string, data: Partial<User>): Promise<User> {
		const updated = await this.prisma.user.update({
			where: { id },
			data: {
				nome: data.nome,
				email: data.email,
			},
		})

		return new User(updated.id, updated.nome, updated.email || '', updated.createdAt)
	}

	async delete(id: string): Promise<void> {
		await this.prisma.user.delete({
			where: { id },
		})
	}
}
