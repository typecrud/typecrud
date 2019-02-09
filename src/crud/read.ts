import { Route, HTTPMethod, FilterableRoute, SortableRoute, PaginatedRoute, Order } from '../route'
import { BaseEntity, FindManyOptions, IsNull, Not } from 'typeorm'
import { Request, Response, NextFunction } from 'express'
import { classToPlain } from 'class-transformer'

export class ReadRoute<T extends BaseEntity> extends Route<T> implements FilterableRoute, SortableRoute, PaginatedRoute {
  isPaginated = false
  filterKeys: string[] = []
  orderBy: { key: string; order: Order } | null = null
  orderKeys: string[] = []

  constructor(private model: typeof BaseEntity, path: string) {
    super(HTTPMethod.GET, path)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    let filterBy: any = {}

    let orderQuery

    // sorting
    if (this.orderBy !== null) {
      orderQuery = { [this.orderBy.key]: this.orderBy.order || Order.ASC }
    }

    if (request.query.orderBy && this.orderKeys.some(val => val === request.query.orderBy)) {
      orderQuery = { [request.query.orderBy]: Order.ASC }

      if (request.query.sortOrder) {
        orderQuery[request.query.orderBy] = request.query.sortOrder.toUpperCase() === Order.ASC ? Order.ASC : Order.DESC
      }
    }

    let skip = parseInt(request.query.skip)
    let take = parseInt(request.query.limit)

    this.filterKeys.forEach(key => {
      if (request.query[key]) {
        filterBy[key] = request.query[key]
        if (request.query[key] === 'null') {
          filterBy[key] = IsNull()
        }
        if (request.query[key] === '!null') {
          filterBy[key] = Not(IsNull())
        }
      }
    })

    const query: FindManyOptions<BaseEntity> = { where: filterBy, relations: this.relations }

    if (orderQuery) {
      Object.assign(query, { order: orderQuery })
    }

    // check for soft-deletion, filter those
    if (this.softDeletionKey) {
      Object.assign(query.where, { [this.softDeletionKey]: IsNull() })
    }

    // mandatory query-filter
    if (this.queryFilter) {
      Object.assign(query.where, this.queryFilter(request))
    }

    // paginate query
    if (this.isPaginated && skip >= 0 && take >= 0) {
      query.take = take
      query.skip = skip
    }

    const [entities, entitiesCount] = await this.model.findAndCount(query)

    // add pagination headers
    if (this.isPaginated) {
      response.set('Access-Control-Expose-Headers', 'X-Pagination-Count, X-Pagination-Skip, X-Pagination-Limit')
      response.set('X-Pagination-Count', entitiesCount.toString())
      response.set('X-Pagination-Skip', skip.toString())
      response.set('X-Pagination-Limit', take.toString())
    }

    if (!entities || entities.length === 0) {
      return response.status(200).json([])
    }

    return response.status(200).json(classToPlain(entities))
  }
}
