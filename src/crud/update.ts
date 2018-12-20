import { Route, HTTPMethod } from '../route'
import { BaseEntity, FindOneOptions } from 'typeorm'
import { Request, Response, NextFunction } from 'express'
import { classToPlain } from 'class-transformer'

export class UpdateRoute extends Route {
  constructor(private model: typeof BaseEntity, path: string) {
    super(HTTPMethod.PATCH, path)
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

    // copy over all supplied params to entity
    Object.assign(entity, request.body)

    // validate object
    const errors = await this.validateEntity(entity)
    if (errors && errors.length > 0) {
      return response.status(400).json(errors)
    }

    // save object if valid
    const savedEntity = await entity.save()

    return response.status(200).json(classToPlain(savedEntity))
  }
}
