import { Route, HTTPMethod } from '../route'
import { BaseEntity } from 'typeorm'
import { Request, Response, NextFunction } from 'express'
import { classToPlain, plainToClass } from 'class-transformer'

export class CreateRoute<T extends BaseEntity> extends Route<T> {
  constructor(private model: typeof BaseEntity, path: string) {
    super(HTTPMethod.POST, path)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    // copy over all supplied params to entity
    const newClass = plainToClass<BaseEntity, Object>(this.model, request.body)

    // validate object
    const errors = await this.validateEntity(newClass)
    if (errors && errors.length > 0) {
      return response.status(400).json(errors)
    }

    // execute pre-operation hook
    await this.preEntityHook(request, newClass as T)

    // save object if valid
    const savedEntity = await newClass.save()

    // execute post-operation hook
    await this.postEntityHook(request, savedEntity as T)

    return response.status(201).json(classToPlain(savedEntity))
  }
}
