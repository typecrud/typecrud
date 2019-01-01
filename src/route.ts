import { Router, NextFunction, Response, Request } from 'express'
import { asyncRequestHandler } from './middleware/async'
import { BaseEntity, getManager, FindOperator } from 'typeorm'
import { ValidationError, validate } from 'class-validator'
import 'reflect-metadata'

export enum HTTPMethod {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface FilterableRoute {
  filterKeys: string[]
}

export interface SortableRoute {
  sortBy: { key: string; order: SortOrder }
}

export interface PaginatedRoute {
  isPaginated: boolean
}

export abstract class Route {
  relations: string[] = []
  softDeletionKey?: string
  queryFilter?: (request: Request) => { [x: string]: FindOperator<any> }

  constructor(private method: HTTPMethod, private path: string) {}

  getRouter(): Router {
    return (Router() as any)[this.method.toLowerCase()](this.path, asyncRequestHandler(this.requestHandler.bind(this)))
  }

  abstract async requestHandler(request: Request, response: Response, next: NextFunction): Promise<void>

  protected async validateEntity(entity: BaseEntity, skipMissingProperties = false): Promise<ValidationError[]> {
    const errors = await validate(entity, {
      forbidUnknownValues: true,
      skipMissingProperties: skipMissingProperties,
      validationError: {
        target: false
      }
    })

    return errors
  }

  async queryBuilder(entity: typeof BaseEntity): Promise<BaseEntity[]> {
    const results = (await getManager()
      .createQueryBuilder(entity, 'alias')
      .where('user.name = :name', { name: 'Timber' })
      .getMany()) as BaseEntity[]

    return results
  }
}
