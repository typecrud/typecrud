import * as express from 'express'
import { json } from 'body-parser'
import { User } from './database/entities/user'
import { TypeCrud } from './crud/generator'
import { Event } from './database/entities/event'
import { Order, CRUDType } from '.'

const app = express()

app.use(json())
app.use(
  '/api/v1/users',
  new TypeCrud<User>(User, {
    filterBy: ['age', 'firstname'],
    orderBy: { key: 'age', order: Order.ASC },
    isPaginatable: true,
    softDeleteBy: 'deletedAt',
    hooks: {
      pre: {
        [CRUDType.Create]: (request, entity: User[]) => {}
      }
    },
    includeRelations: ['events', 'tags']
  }).router
)

app.use('/api/v1/events', new TypeCrud<Event>(Event, { multiCreation: true }).router)

export { app }
