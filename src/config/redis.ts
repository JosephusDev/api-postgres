import { createClient } from 'redis'
import { env } from '../env'

const client = createClient({
	username: env.REDIS_USERNAME,
	password: env.REDIS_PASSWORD,
	socket: {
		host: env.REDIS_HOST,
		port: env.REDIS_PORT,
		reconnectStrategy: retries => {
			// Tentar reconectar até 5 vezes
			if (retries > 5) {
				console.log('Too many retries, giving up')
				return new Error('Could not connect after 5 attempts')
			}
			// Esperar 1 segundo entre tentativas
			return 1000
		},
	},
})

client.on('error', err => console.log('Redis Client Error', err))

export default client
