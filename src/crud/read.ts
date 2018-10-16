import { Route, HTTPMethod } from '../route'
import { BaseEntity } from 'typeorm'
import { Router, Request, Response, NextFunction } from 'express'

export class ReadRoute extends Route {
  constructor(private model: typeof BaseEntity, router: Router, path: string) {
    super(router, HTTPMethod.GET, path)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    const entity = await this.model.findOne(request.params.id)

    if (!entity) {
      return response.sendStatus(404)
    }

    return response.status(200).json(entity)
  }
}
