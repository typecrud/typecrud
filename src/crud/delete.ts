import { Route, HTTPMethod } from '../route'
import { BaseEntity } from 'typeorm'
import { Request, Response, NextFunction } from 'express'

export class DeleteRoute extends Route {
  constructor(private model: typeof BaseEntity, path: string) {
    super(HTTPMethod.DELETE, path)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    const entity = await this.model.findOne(request.params.id)

    if (!entity) {
      return response.sendStatus(404)
    }

    // check if entity is able to be soft-deleted
    if (this.softDeletionKey) {
      ;(entity as any)[this.softDeletionKey] = new Date()
      await entity.save()
    } else {
      await entity.remove()
    }

    return response.sendStatus(204)
  }
}
