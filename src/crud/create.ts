import { Route, HTTPMethod } from '../route'
import { BaseEntity } from 'typeorm'
import { Router, Request, Response, NextFunction } from 'express'
import { validate } from 'class-validator'

export class CreateRoute<T extends BaseEntity> extends Route<T> {
  constructor(private model: new () => T, router: Router, path: string) {
    super(router, HTTPMethod.POST, path)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    const entity = new this.model()

    Object.assign(entity, request.body)

    const errors = await validate(entity, {
      forbidUnknownValues: true,
      validationError: {
        target: false
      }
    })

    if (errors && errors.length > 0) {
      return response.status(400).json(errors)
    }

    const savedEntitiy = await entity.save()

    return response.status(201).json(savedEntitiy)
  }
}
