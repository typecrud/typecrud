import { Router, NextFunction, Response, Request } from 'express'
import { asyncRequestHandler } from './middleware/async'
import { BaseEntity, getManager, FindOperator } from 'typeorm'
import { ValidationError, validate } from 'class-validator'
import 'reflect-metadata'
import { TypeCrudConfig } from '.'

export enum HTTPMethod {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface FilterableRoute {
  filterKeys: string[]
}

export interface SortableRoute {
  orderBy: { key: string; order: Order } | null
  orderKeys: string[]
}

export interface PaginatedRoute {
  isPaginated: boolean
}

export abstract class Route<T> {
  relations: string[] = []
  softDeletionKey?: string

  preEntityHooks: { [x: string]: (request: Request, entity: T) => void | Promise<void> } = {}
  postEntityHooks: { [x: string]: (request: Request, entity: T) => void | Promise<void> } = {}

  queryFilter?: (request: Request) => { [x: string]: FindOperator<any> }

  constructor(protected method: HTTPMethod, private path: string, protected config: TypeCrudConfig<T>) {}

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

  protected async preEntityHook(request: Request, entity: T) {
    if (this.preEntityHooks[this.method]) {
      this.preEntityHooks[this.method](request, entity)
    }
  }

  protected async postEntityHook(request: Request, entity: T) {
    if (this.postEntityHooks[this.method]) {
      this.postEntityHooks[this.method](request, entity)
    }
  }

  async queryBuilder(entity: typeof BaseEntity): Promise<BaseEntity[]> {
    const results = (await getManager()
      .createQueryBuilder(entity, 'alias')
      .where('user.name = :name', { name: 'Timber' })
      .getMany()) as BaseEntity[]

    return results
  }
}
