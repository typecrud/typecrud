import { Route } from '../route'
import { BaseEntity, FindOneOptions, IsNull } from 'typeorm'
import { Request, Response, NextFunction } from 'express'
import { classToPlain } from 'class-transformer'
import { TypeCrudConfig } from '..'
import { CRUDType } from './constants'

export class ReadOneRoute<T extends BaseEntity> extends Route<T> {
  crudType = CRUDType.ReadOne

  constructor(private model: typeof BaseEntity, path: string, config: TypeCrudConfig<T>) {
    super(path, config)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    const query: FindOneOptions<BaseEntity> = { where: {}, relations: this.relations }

    // check for soft-deletion, filter those
    if (this.softDeletionKey) {
      Object.assign(query.where, { [this.softDeletionKey]: IsNull() })
    }

    if (this.queryFilter) {
      Object.assign(query.where, this.queryFilter(request))
    }

    const entity = await this.model.findOne(request.params.id, query)

    if (!entity) {
      return response.sendStatus(404)
    }

    // execute post-operation hook
    await this.postEntityHook(request, entity as T)

    // serialize
    const serializedEntity = classToPlain(entity)

    // execute post-serialization hook
    await this.postSerializationHook(request, serializedEntity)

    return response.status(200).json(serializedEntity)
  }
}
