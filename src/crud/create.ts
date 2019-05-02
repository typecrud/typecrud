import { Route } from '../route'
import { BaseEntity } from 'typeorm'
import { Request, Response, NextFunction } from 'express'
import { classToPlain, plainToClass } from 'class-transformer'
import { TypeCrudConfig } from '..'
import { CRUDType } from './constants'

export class CreateRoute<T extends BaseEntity> extends Route<T> {
  crudType = CRUDType.Create

  constructor(private model: typeof BaseEntity, path: string, config: TypeCrudConfig<T>) {
    super(path, config)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    if (Array.isArray(request.body) && !this.config.multiCreation) {
      return response.status(400).send()
    }

    // copy over all supplied params to entity
    const newEntities = plainToClass<BaseEntity, Array<Object>>(this.model, Array.isArray(request.body) ? request.body : [request.body])

    const savedEntities: BaseEntity[] = []

    // validate all entities
    const errors: any[] = []
    await Promise.all(
      newEntities.map(async newClass => {
        const err = await this.validateEntity(newClass)
        if (err && err.length > 0) {
          errors.push(err)
        }
      })
    )

    if (errors.length > 0) {
      return response.status(400).json(errors)
    }

    await Promise.all(
      newEntities.map(async newClass => {
        // execute pre-operation hook
        await this.preEntityHook(request, newClass as T)

        // save object if valid
        const savedEntity = await newClass.save()
        savedEntities.push(savedEntity)

        // execute post-operation hook
        await this.postEntityHook(request, savedEntity as T)
      })
    )

    if (savedEntities.length === 1) {
      return response.status(201).json(classToPlain(savedEntities[0]))
    }

    return response.status(201).json(classToPlain(savedEntities))
  }
}
