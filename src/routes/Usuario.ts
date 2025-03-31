import { z } from 'zod'
import { getAll, Create, Delete, Update } from '../controllers/Usuario'
import { UserArraySchema, UserSchema } from '../schema/Usuario'
import { FastifyTypedInstance } from '../types'

export async function userRoutes(app: FastifyTypedInstance) {
	app.post(
		'/users',
		{
			schema: {
				description: 'Create a new user',
				tags: ['users'],
				body: UserSchema,
			},
		},
		Create,
	)
	app.get(
		'/users',
		{
			schema: {
				description: 'Get all users',
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
