import { app } from './app'

const startServer = async () => {
	const PORT = process.env.PORT ? Number(process.env.PORT) : 3333
	try {
		await app.listen({ port: PORT })
		console.log(`Server is running on http://localhost:${PORT}`)
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

startServer()
