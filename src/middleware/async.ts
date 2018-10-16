import { Request, Response } from 'express'
import { NextFunction } from 'connect'
import { RequestHandler } from 'express-serve-static-core'

const asyncRequestHandler = function(fn: any): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export { asyncRequestHandler }
