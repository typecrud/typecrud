import { Router, NextFunction, Response, Request } from 'express'
import { asyncRequestHandler } from './middleware/async'
import { BaseEntity, getManager, FindOperator } from 'typeorm'
import { ValidationError, validate } from 'class-validator'
import 'reflect-metadata'
import { TypeCrudConfig } from '.'
import { Order, CRUDType, CRUDTypeHTTPMethodMapping } from './crud/constants'
import { Hooks } from './crud/generator'

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
  protected crudType!: CRUDType

  hooks?: Hooks<T>

  queryFilter?: (request: Request) => { [x: string]: FindOperator<any> }

  constructor(private path: string, protected config: TypeCrudConfig<T>) {}

  getRouter(): Router {
    const router = Router()
    CRUDTypeHTTPMethodMapping[this.crudType].forEach((method: string) => {
      ;(router as any)[method.toLowerCase()](this.path, asyncRequestHandler(this.requestHandler.bind(this)))
    })
    return router
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

  protected async preEntityHook(request: Request, entity: T[]) {
    if (this.hooks && this.hooks.pre && this.hooks.pre[this.crudType]) {
      await this.hooks.pre[this.crudType]!(request, entity)
    }
  }

  protected async postEntityHook(request: Request, entity: T[]) {
    if (this.hooks && this.hooks.post && this.hooks.post[this.crudType]) {
      await this.hooks.post[this.crudType]!(request, entity)
    }
  }

  protected async postSerializationHook(request: Request, serializedObject: Object[]) {
    if (this.hooks && this.hooks.postSerialization && this.hooks.postSerialization[this.crudType]) {
      await this.hooks.postSerialization[this.crudType]!(request, serializedObject)
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
