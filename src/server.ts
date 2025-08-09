import { app } from './app'
import { ServiceFactory } from './factories/ServiceFactory'
import { env } from './env'

const startServer = async () => {
	try {
		// Inicializa a factory e conecta o Redis
		const serviceFactory = ServiceFactory.getInstance()
		await serviceFactory.connectRedis()

		await app.listen({ port: env.PORT })
		console.log(`Server is running on http://localhost:${env.PORT}`)

		// Graceful shutdown
		process.on('SIGTERM', async () => {
			console.log('SIGTERM received, shutting down gracefully')
			await serviceFactory.disconnect()
			process.exit(0)
		})

		process.on('SIGINT', async () => {
			console.log('SIGINT received, shutting down gracefully')
			await serviceFactory.disconnect()
			process.exit(0)
		})
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

startServer()
