import { Router, RequestHandler, NextFunction, Response, Request } from 'express'
import { asyncRequestHandler } from './middleware/async'
import { BaseEntity } from 'typeorm'
import { ValidationError, validate } from 'class-validator'

export enum HTTPMethod {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export abstract class Route {
  constructor(router: Router, method: HTTPMethod, path: string) {
    const route = router.route(path) as any
    route[method.toLowerCase()](asyncRequestHandler(this.requestHandler.bind(this)))
  }

  abstract async requestHandler(request: Request, response: Response, next: NextFunction): Promise<void>

  protected async validateEntity(entity: BaseEntity): Promise<ValidationError[]> {
    const errors = await validate(entity, {
      forbidUnknownValues: true,
      validationError: {
        target: false
      }
    })

    return errors
  }
}
