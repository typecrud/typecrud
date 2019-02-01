import { Route, HTTPMethod } from '../route'
import { BaseEntity, FindOneOptions, IsNull } from 'typeorm'
import { Request, Response, NextFunction } from 'express'
import { classToPlain, plainToClass } from 'class-transformer'

export class UpdateRoute<T extends BaseEntity> extends Route<T> {
  constructor(private model: typeof BaseEntity, path: string) {
    super(HTTPMethod.PATCH, path)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    const query: FindOneOptions<BaseEntity> = { where: {}, relations: this.relations }

    // check for soft-deletion, filter those
    if (this.softDeletionKey) {
      Object.assign(query.where, { [this.softDeletionKey]: IsNull() })
    }

    // mandatory query-filter
    if (this.queryFilter) {
      Object.assign(query.where, this.queryFilter(request))
    }

    const entity = await this.model.findOne(request.params.id, query)

    if (!entity) {
      return response.sendStatus(404)
    }

    // convert request to class
    const newEntity = plainToClass<BaseEntity, Object>(this.model, request.body)

    // validate object, skip missing properties
    const errors = await this.validateEntity(newEntity, true)
    if (errors && errors.length > 0) {
      return response.status(400).json(errors)
    }

    // only copy over existing properties (no relations or such)
    Object.keys(newEntity)
      .filter(key => this.relations.indexOf(key) === -1)
      .filter(key => key !== 'id')
      .forEach(key => {
        ;(entity as any)[key] = (newEntity as any)[key]
      })

    // execute pre-operation hook
    await this.preEntityHook(request, entity as T)

    const savedEntity = await entity.save()

    // execute post-operation hook
    await this.postEntityHook(request, savedEntity as T)

    return response.status(200).json(classToPlain(savedEntity))
  }
}
