import { z } from 'zod'
import { getAll, Create, Delete, Update } from '../controllers/User'
import { UserSchema } from '../entities/User'
import { FastifyTypedInstance } from '../types'

// Schema para array de usuários
const UserArraySchema = z.array(UserSchema)

export async function userRoutes(app: FastifyTypedInstance) {
	app.post(
		'/users',
		{
			schema: {
				description: 'Create a new user',
				operationId: 'createUser',
				tags: ['users'],
				body: UserSchema,
				response: {
					201: UserSchema,
				},
			},
		},
		Create,
	)
	app.get(
		'/users',
		{
			schema: {
				description: 'Get all users',
				operationId: 'getUsers',
				tags: ['users'],
				response: {
					200: UserArraySchema,
				},
			},
		},
		getAll,
	)
	app.put(
		'/users/:id',
		{
			schema: {
				description: 'Update a user',
				operationId: 'updateUser',
				tags: ['users'],
				body: UserSchema,
				response: {
					204: z.object({
						message: z.string(),
					}),
				},
			},
		},
		Update,
	)
	app.delete(
		'/users/:id',
		{
			schema: {
				description: 'Delete a user',
				operationId: 'deleteUser',
				tags: ['users'],
				response: {
					204: z.object({
						message: z.string(),
					}),
				},
			},
		},
		Delete,
	)
}
