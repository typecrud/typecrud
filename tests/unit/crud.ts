import 'chai'
import 'mocha'

import { expect } from 'chai'
import { app } from '../../src/app'
import * as request from 'supertest'
import { createConnection, Connection } from 'typeorm'
import { User } from '../../src/database/entities/user'
import { Event } from '../../src/database/entities/event'
import { SeedGenerator } from './../seed/seed'
import { classToPlain } from 'class-transformer'
import { convertDates } from '../helpers/toDate'

describe('CRUD', () => {
  let connection: Connection
  beforeEach(async () => {
    connection = await createConnection({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'typecrud',
      password: 'typecrud',
      database: 'typecrud-test',
      entities: ['src/database/entities/**/*.ts'],
      synchronize: true,
      dropSchema: true
    })
  })

  describe('POST', () => {
    it('should create an entity', done => {
      const event = { name: 'TestName', startsAt: new Date() }
      request(app)
        .post(`/api/v1/events`)
        .send(event)
        .set('Accept', 'application/json')
        .expect(201)
        .end((err, res) => {
          if (err || res.status !== 201) {
            console.warn(res.body)
            return done(err)
          }
          expect(res.body).to.contain(convertDates(classToPlain(event)))
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
    let users: User[]
    let events: Event[]

    beforeEach(async () => {
      users = await SeedGenerator.generateUsers()
      events = await SeedGenerator.generateEvents(users)
    })

    it('should read an existing record', done => {
      request(app)
        .get(`/api/v1/users/${users[2].id}`)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          let comparisonUser: any = users[2]
          comparisonUser.createdAt = users[2].createdAt.toISOString()
          comparisonUser.updatedAt = users[2].updatedAt.toISOString()
          expect(res.body).to.contain(comparisonUser)
          expect(res.body.events[0]).to.contain({ id: events[2].id, name: events[2].name }) // check for relations
          if (err) {
            console.warn(res.body)
            return done(err)
          }
          done()
        })
    })

    it('should read all existing records', done => {
      request(app)
        .get(`/api/v1/users`)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.equal(100)

          let comparisonUser: any = users[0]
          comparisonUser.createdAt = users[0].createdAt.toISOString()
          comparisonUser.updatedAt = users[0].updatedAt.toISOString()

          expect(res.body[0]).to.contain(comparisonUser)
          expect(res.body[1].events[0]).to.contain({ id: events[1].id, name: events[1].name }) // check for relations
          if (err) {
            console.warn(res.body)
            return done(err)
          }
          done()
        })
    })

    it('should filter all existing records using query-parameters', done => {
      request(app)
        .get(`/api/v1/users?age=49`)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.equal(1)

          let comparisonUser: any = users[49]
          comparisonUser.createdAt = users[49].createdAt.toISOString()
          comparisonUser.updatedAt = users[49].updatedAt.toISOString()

          expect(res.body[0]).to.contain(comparisonUser)
          if (err) {
            console.warn(res.body)
            return done(err)
          }
          done()
        })
    })

    it('should filter all existing records using multiple query-parameters', done => {
      request(app)
        .get(`/api/v1/users?age=49&firstname=Tester`)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.equal(0)
          if (err) {
            console.warn(res.body)
            return done(err)
          }
          done()
        })
    })

    it('should properly paginate records', done => {
      request(app)
        .get(`/api/v1/users?skip=10&limit=10`)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.equal(10)

          let comparisonUser10: any = users[10]
          comparisonUser10.createdAt = users[10].createdAt.toISOString()
          comparisonUser10.updatedAt = users[10].updatedAt.toISOString()

          let comparisonUser19: any = users[19]
          comparisonUser19.createdAt = users[19].createdAt.toISOString()
          comparisonUser19.updatedAt = users[19].updatedAt.toISOString()

          expect(res.body[0]).to.contain(comparisonUser10)
          expect(res.body[9]).to.contain(comparisonUser19)
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
    let event: Event

    beforeEach(async () => {
      event = new Event()
      event.name = 'TestEvent'
      event.startsAt = new Date()
      event = await event.save()

      user = new User()
      user.firstname = 'Tester'
      user.lastname = 'Testibus'
      user.age = 50
      user.events = [event]
      user = await user.save()
    })

    it('should patch an existing record', done => {
      user.firstname = 'changedName'
      user.events[0].name = 'TestEvent2'
      request(app)
        .patch(`/api/v1/users/${user.id}`)
        .send(user)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          expect(res.body.firstname).to.equal(user.firstname)
          expect(res.body.lastname).to.equal(user.lastname)
          expect(res.body.events[0].name).to.equal('TestEvent2')
          if (err) {
            console.warn(res.body)
            return done(err)
          }
          done()
        })
    })

    it('should patch an existing record with a nested object', done => {
      user.firstname = 'changedName'
      user.events[0].name = 'TestEvent2'

      request(app)
        .patch(`/api/v1/users/${user.id}`)
        .send(user)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          expect(res.body.firstname).to.equal(user.firstname)
          expect(res.body.lastname).to.equal(user.lastname)
          expect(res.body.events[0].name).to.equal('TestEvent2')
          if (err) {
            console.warn(res.body)
            return done(err)
          }
          done()
        })
    })
  })

  describe('DELETE', () => {
    let users: User[]
    let events: Event[]

    beforeEach(async () => {
      users = await SeedGenerator.generateUsers()
      events = await SeedGenerator.generateEvents(users)
    })

    it('should soft-delete an existing record', done => {
      request(app)
        .delete(`/api/v1/users/${users[0].id}`)
        .set('Accept', 'application/json')
        .expect(204)
        .end(async (err, res) => {
          await users[0].reload()
          expect(users[0].deletedAt).not.to.eq(undefined)
          if (err) {
            console.warn(res.body)
            return done(err)
          }
          done()
        })
    })

    it('should delete an existing record', done => {
      request(app)
        .delete(`/api/v1/events/${events[0].id}`)
        .set('Accept', 'application/json')
        .expect(204)
        .end(async (err, res) => {
          let deletedEvent = await Event.findOne(events[0].id)
          expect(deletedEvent).to.eq(undefined)
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
