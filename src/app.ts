import * as express from 'express'
import { json } from 'body-parser'
import { User } from './database/entities/user'
import { TypeCrud } from './crud/generator'
import { SortOrder } from './route'
import { Event } from './database/entities/event'

const app = express()

app.use(json())
app.use(
  new TypeCrud(User, '/api/v1/users')
    .filterableBy('age', 'firstname')
    .sortBy('age', SortOrder.ASC)
    .paginate()
    .softDeletable('deletedAt')
    .includeRelations('events').router
)

app.use(new TypeCrud(Event, '/api/v1/events').router)

export { app }
