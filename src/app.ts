import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import {
	validatorCompiler,
	serializerCompiler,
	type ZodTypeProvider,
	jsonSchemaTransform,
} from 'fastify-type-provider-zod'
import { userRoutes } from './routes/Usuario'
import fastifySwagger from '@fastify/swagger'
import scalarFastifyApiReference from '@scalar/fastify-api-reference'

const app = fastify().withTypeProvider<ZodTypeProvider>()

// Configuração dos validadores
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Middlewares
app.register(fastifyCors, { origin: '*' })

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: 'API de Usuários',
			version: '1.0.0',
		},
	},
	transform: jsonSchemaTransform,
})

app.register(scalarFastifyApiReference, {
	routePrefix: '/docs',
	configuration: {
		theme: 'kepler',
	},
})

// Rotas
app.register(userRoutes)

export { app }
