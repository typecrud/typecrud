import 'chai'
import 'mocha'

import { expect } from 'chai'
import { app } from '../src/app'
import * as request from 'supertest'
import { createConnection, Connection } from 'typeorm'
import { User } from '../src/database/entities/user'

describe('CRUD', () => {
  let connection: Connection
  beforeEach(done => {
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
    }).then(c => {
      connection = c
      done()
    })
  })

  describe('POST', () => {
    it('should create an entity', done => {
      const user = { firstname: 'Tester', lastname: 'Testibus', age: 50 }
      request(app)
        .post(`/api/v1/users`)
        .send(user)
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

    it('should give validation errors for incorrect fields', done => {
      const user = { firstname: '', lastname: 'Testibus', age: 50 }
      request(app)
        .post(`/api/v1/users`)
        .send(user)
        .set('Accept', 'application/json')
        .expect(400)
        .end((err, res) => {
          if (err) {
            console.warn(res.body)
            return done(err)
          }
          done()
        })
    })
  })

  describe('GET', () => {
    let user: User

    beforeEach(async () => {
      user = new User()
      user.firstname = 'Tester'
      user.lastname = 'Testibus'
      user.age = 50
      user = await user.save()
    })

    it('should read an existing record', done => {
      request(app)
        .get(`/api/v1/users/${user.id}`)
        .set('Accept', 'application/json')
        .expect(200)
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

  describe('PATCH / PUT', () => {
    let user: User

    beforeEach(async () => {
      user = new User()
      user.firstname = 'Tester'
      user.lastname = 'Testibus'
      user.age = 50
      user = await user.save()
    })

    it('should patch an existing record', done => {
      user.firstname = 'changedName'
      request(app)
        .patch(`/api/v1/users/${user.id}`)
        .send(user)
        .set('Accept', 'application/json')
        .expect(200)
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

  describe('DELETE', () => {
    let user: User

    beforeEach(async () => {
      user = new User()
      user.firstname = 'Tester'
      user.lastname = 'Testibus'
      user.age = 50
      user = await user.save()
    })

    it('should delete an existing record', done => {
      request(app)
        .delete(`/api/v1/users/${user.id}`)
        .set('Accept', 'application/json')
        .expect(204)
        .end((err, res) => {
          if (err) {
            console.warn(res.body)
            return done(err)
          }
          done()
        })
    })
  })

  afterEach(done => {
    connection.close()
    done()
  })
})
