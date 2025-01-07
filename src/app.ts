import express from 'express'
import cors from 'cors'
import userRouter from './routes/Usuario'

const app = express()

app.use(express.json())
app.use(cors())

app.use('/users', userRouter)

export { app }
