import { faker } from '@faker-js/faker'
import { PrismaClient, Usuario } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	const users: Pick<Usuario, 'nome' | 'email'>[] = []
	for (let i = 0; i < 1000; i++) {
		users.push({
			nome: faker.person.fullName(),
			email: faker.internet.email().replace('@', `${i}@`),
		})
	}

	await prisma.usuario.createMany({ data: users })
}

main()
	.catch(error => {
		console.error('Error connecting to database:', error)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
