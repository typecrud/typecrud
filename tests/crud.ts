import 'chai'
import 'mocha'

import { expect } from 'chai'
import { app } from '../src/app'
import * as request from 'supertest'
import { createConnection } from 'typeorm'

describe('POST /api/v1/users', () => {
  before(done => {
    createConnection({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'typecrud',
      password: 'typecrud',
      database: 'typecrud-test',
      entities: ['src/database/entities/**/*.ts'],
      synchronize: true,
      logging: false
    }).then(() => {
      done()
    })
  })

  it('should create a user', done => {
    const user = { firstname: 'Tester', lastname: 'Testibus', age: 50 }
    request(app)
      .post(`/api/v1/users`)
      .send({ firstname: 'Tester', lastname: 'Testibus', age: 50 })
      .set('Accept', 'application/json')
      .expect(201)
      .end((err, res) => {
        expect(res.body).to.contain(user)
        if (err) {
          console.warn(res.body)
          return done(err)
        }
        done()
      })
  })
})
