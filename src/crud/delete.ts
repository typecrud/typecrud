import { Route } from '../route'
import { BaseEntity, FindOneOptions } from 'typeorm'
import { Request, Response, NextFunction } from 'express'
import { TypeCrudConfig } from '..'
import { CRUDType } from './constants'

export class DeleteRoute<T extends BaseEntity> extends Route<T> {
  crudType = CRUDType.Delete

  constructor(private model: typeof BaseEntity, path: string, config: TypeCrudConfig<T>) {
    super(path, config)
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

    // execute pre-operation hook
    await this.preEntityHook(request, entity as T)

    // check if entity is able to be soft-deleted
    if (this.softDeletionKey) {
      ;(entity as any)[this.softDeletionKey] = new Date()
      await entity.save()
    } else {
      await entity.remove()
    }

    // execute pre-operation hook
    await this.postEntityHook(request, entity as T)

    return response.sendStatus(204)
  }
}
