import { Route, HTTPMethod } from '../route'
import { BaseEntity } from 'typeorm'
import { Router, Request, Response, NextFunction } from 'express'

export class UpdateRoute extends Route {
  constructor(private model: typeof BaseEntity, router: Router, path: string) {
    super(router, HTTPMethod.PATCH, path)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    const entity = await this.model.findOne(request.params.id)

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

    return response.status(200).json(savedEntity)
  }
}
