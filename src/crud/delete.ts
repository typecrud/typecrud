import { Route, HTTPMethod } from '../route'
import { BaseEntity, FindOneOptions } from 'typeorm'
import { Request, Response, NextFunction } from 'express'

export class DeleteRoute extends Route {
  constructor(private model: typeof BaseEntity, path: string) {
    super(HTTPMethod.DELETE, path)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    const query: FindOneOptions<BaseEntity> = {}

    // mandatory query-filter
    if (this.queryFilter) {
      Object.assign(query, { where: this.queryFilter(request) })
    }

    const entity = await this.model.findOne(request.params.id, query)

    if (!entity) {
      return response.sendStatus(404)
    }

    // execute pre-operation hook
    await this.preEntityHook(request, entity)

    // check if entity is able to be soft-deleted
    if (this.softDeletionKey) {
      ;(entity as any)[this.softDeletionKey] = new Date()
      await entity.save()
    } else {
      await entity.remove()
    }

    // execute pre-operation hook
    await this.preEntityHook(request, entity)

    return response.sendStatus(204)
  }
}
