import { Route, HTTPMethod, FilterableRoute, SortableRoute, SortOrder, PaginatedRoute } from '../route'
import { BaseEntity, FindManyOptions, IsNull } from 'typeorm'
import { Request, Response, NextFunction } from 'express'
import { classToPlain } from 'class-transformer'

export class ReadRoute extends Route implements FilterableRoute, SortableRoute, PaginatedRoute {
  isPaginated = false
  filterKeys: string[] = []
  sortBy: { key: string; order: SortOrder } = { key: 'id', order: SortOrder.ASC }

  constructor(private model: typeof BaseEntity, path: string) {
    super(HTTPMethod.GET, path)
  }

  async requestHandler(request: Request, response: Response, next: NextFunction): Promise<any> {
    let filterBy: any = {}
    let sortBy = { [this.sortBy.key]: this.sortBy.order }

    let skip = parseInt(request.query.skip)
    let take = parseInt(request.query.limit)

    this.filterKeys.forEach(key => {
      if (request.query[key]) {
        filterBy[key] = request.query[key] === 'null' ? IsNull() : request.query[key]
      }
    })

    const query: FindManyOptions<BaseEntity> = { where: filterBy, order: sortBy, relations: this.relations }

    // check for soft-deletion, filter those
    if (this.softDeletionKey) {
      Object.assign(query.where, { [this.softDeletionKey]: IsNull() })
    }

    // mandatory query-filter
    if (this.queryFilter) {
      Object.assign(query.where, this.queryFilter(request))
    }

    // paginate query
    if (this.isPaginated && skip && take) {
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
