import * as express from 'express'
import { json } from 'body-parser'
import { User } from './database/entities/user'
import { TypeCrud } from './crud/generator'
import { SortOrder, HTTPMethod } from './route'
import { Event } from './database/entities/event'

const app = express()

app.use(json())
app.use(
  '/api/v1/users',
  new TypeCrud<User>(User, {
    filterBy: ['age', 'firstname'],
    sortBy: { key: 'age', order: SortOrder.ASC },
    isPaginatable: true,
    softDeleteBy: 'deletedAt',
    hooks: {
      pre: {
        [HTTPMethod.POST]: (request, entity: User) => {}
      }
    },
    includeRelations: ['events']
  }).router
)

app.use('/api/v1/events', new TypeCrud<Event>(Event).router)

export { app }
