import * as express from 'express'
import { CreateRoute } from './crud/create'
import { json } from 'body-parser'
import { User } from './database/entities/user'
import { UpdateRoute } from './crud/update'
import { ReadRoute } from './crud/read'
import { DeleteRoute } from './crud/delete'

const app = express()
app.use(json())

const router = express.Router()

const createUser = new CreateRoute(User, router, '/api/v1/users')
const readUser = new ReadRoute(User, router, '/api/v1/users/:id')
const updateUser = new UpdateRoute(User, router, '/api/v1/users/:id')
const deleteUser = new DeleteRoute(User, router, '/api/v1/users/:id')

app.use(router)

export { app }
