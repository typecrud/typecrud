import { Route, HTTPMethod } from '../route'
import { BaseEntity, FindOneOptions, Not, IsNull } from 'typeorm'
import { Request, Response, NextFunction } from 'express'

export class ReadOneRoute extends Route {
  constructor(private model: typeof BaseEntity, path: string, validatorFunction?: Function) {
    super(HTTPMethod.GET, path)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    const query: FindOneOptions<BaseEntity> = { relations: this.relations }

    // check for soft-deletion, filter those
    if (this.softDeletionKey) {
      Object.assign(query, { where: { [this.softDeletionKey]: IsNull() } })
    }

    const entity = await this.model.findOne(request.params.id, query)

    if (!entity) {
      return response.sendStatus(404)
    }

    return response.status(200).json(entity)
  }
}
