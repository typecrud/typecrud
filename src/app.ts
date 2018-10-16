import * as express from 'express'
import { CreateRoute } from './crud/create'
import { json } from 'body-parser'
import { User } from './database/entities/user'

const app = express()
app.use(json())

const router = express.Router()

const createUser = new CreateRoute<User>(User, router, '/api/v1/users')

app.use(router)

export { app }
