import { app } from './app'
import client from './config/redis'
import { env } from './env'

const startServer = async () => {
	try {
		await client.connect()
		await app.listen({ port: env.PORT })
		console.log(`Server is running on http://localhost:${env.PORT}`)
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

startServer()
