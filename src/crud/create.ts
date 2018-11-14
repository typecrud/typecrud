import { Route, HTTPMethod } from '../route'
import { BaseEntity } from 'typeorm'
import { Request, Response, NextFunction } from 'express'

export class CreateRoute extends Route {
  constructor(private model: typeof BaseEntity, path: string, validatorFunction?: Function) {
    super(HTTPMethod.POST, path, validatorFunction)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    const entity = new this.model()

    // copy over all supplied params to entity
    Object.assign(entity, request.body)

    // validate object
    const errors = await this.validateEntity(entity)
    if (errors && errors.length > 0) {
      return response.status(400).json(errors)
    }

    // save object if valid
    const savedEntity = await entity.save()

    return response.status(201).json(savedEntity)
  }
}
