import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import {
	validatorCompiler,
	serializerCompiler,
	type ZodTypeProvider,
	jsonSchemaTransform,
} from 'fastify-type-provider-zod'
import { userRoutes } from './routes/User'
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
		theme: 'kepler', //purple,
	},
})

// Error handler customizado para limpar mensagens de erro do Zod
app.setErrorHandler((error, request, reply) => {
	// Se for erro de validação do Fastify/Zod
	if (error.statusCode === 400 && error.code === 'FST_ERR_VALIDATION') {
		// Extrai apenas a mensagem de erro limpa
		const message = error.message.split(' ').slice(1).join(' ') // Remove "body/campo"
		return reply.status(400).send({
			message: message,
		})
	}

	// Para outros erros, mantém o comportamento padrão
	reply.send(error)
})

// Rotas
app.register(userRoutes)

export { app }
