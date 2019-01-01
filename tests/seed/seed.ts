import { User } from '../../src/database/entities/user'
import { Event } from '../../src/database/entities/event'

export class SeedGenerator {
  static async generateUsers(): Promise<User[]> {
    const insertPromises = []

    for (let i = 0; i < 100; i++) {
      let user = new User()
      user.firstname = 'Tester' + i
      user.lastname = 'Testibus' + i
      user.age = i
      insertPromises.push(user.save())
    }

    const users = await Promise.all(insertPromises)

    return users
  }

  static async generateEvents(users: User[]): Promise<Event[]> {
    const insertPromises = []

    for (let i = 0; i < 100; i++) {
      let event = new Event()
      event.user = users[i]
      event.name = 'Event' + i
      event.startsAt = new Date()
      insertPromises.push(event.save())
    }

    const events = await Promise.all(insertPromises)

    return events
  }
}
