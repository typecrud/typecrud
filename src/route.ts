import { Router, RequestHandler, NextFunction, Response, Request } from 'express'
import { asyncRequestHandler } from './middleware/async'
import { BaseEntity } from 'typeorm'

export enum HTTPMethod {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'POST',
  DELETE = 'DELETE'
}

export abstract class Route<T extends BaseEntity> {
  constructor(router: Router, method: HTTPMethod, path: string) {
    const route = router.route(path) as any
    route[method.toLowerCase()](asyncRequestHandler(this.requestHandler.bind(this)))
  }

  abstract async requestHandler(request: Request, response: Response, next: NextFunction): Promise<void>
}
