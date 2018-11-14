import { CreateRoute } from './create'
import { UpdateRoute } from './update'
import { ReadRoute } from './read'
import { DeleteRoute } from './delete'
import { BaseEntity } from 'typeorm'
import { Router } from 'express'
import { ReadOneRoute } from './read-one'
import { Route, FilterableRoute, SortOrder, SortableRoute, PaginatedRoute } from '../route'

const crudConstructors = {
  0: {
    route: CreateRoute,
    defaultSuffix: ''
  },
  1: {
    route: ReadRoute,
    defaultSuffix: ''
  },
  2: {
    route: ReadOneRoute,
    defaultSuffix: ':id'
  },
  3: {
    route: UpdateRoute,
    defaultSuffix: ':id'
  },
  4: {
    route: DeleteRoute,
    defaultSuffix: ':id'
  }
}

export enum CRUDType {
  Create,
  Read,
  ReadOne,
  Update,
  Delete
}

const defaultCrudTypes = [CRUDType.Create, CRUDType.ReadOne, CRUDType.Read, CRUDType.Update, CRUDType.Delete]

export class TypeCrud {
  router: Router

  private filterableRoutes: FilterableRoute[] = []
  private sortableRoutes: SortableRoute[] = []
  private paginatableRoutes: PaginatedRoute[] = []
  private routes: Route[] = []

  constructor(model: typeof BaseEntity, path: string, validatorFunction: Function, crud: CRUDType[] = defaultCrudTypes) {
    const uniqueCrud = crud.filter((x, i) => crud.indexOf(x) === i)
    this.router = Router()

    uniqueCrud.forEach(crud => {
      const crudConstructor = crudConstructors[crud]
      let missingParenthesis = false

      if (crudConstructor.defaultSuffix.length > 0) {
        if (!path.endsWith('/')) {
          missingParenthesis = true
        }
      }

      const url = `${path}${missingParenthesis ? '/' : ''}${crudConstructor.defaultSuffix}`
      const route = new crudConstructor.route(model, url, validatorFunction)
      const crudRouter = route.getRouter()

      // check if we support filterKeys
      if ((route as any).filterKeys !== undefined) {
        this.filterableRoutes.push(route as FilterableRoute)
      }

      // check if we support filterKeys
      if ((route as any).sortBy !== undefined) {
        this.sortableRoutes.push(route as SortableRoute)
      }

      // check if route is paginated
      if ((route as any).isPaginated !== undefined) {
        this.paginatableRoutes.push(route as PaginatedRoute)
      }

      this.routes.push(route)
      this.router.use(crudRouter)
    })
  }

  filterableBy(...filterKeys: string[]): TypeCrud {
    this.filterableRoutes.forEach(route => {
      route.filterKeys = filterKeys
    })

    return this
  }

  sortBy(key: string, order: SortOrder): TypeCrud {
    this.sortableRoutes.forEach(route => {
      route.sortBy = { key: key, order: order }
    })

    return this
  }

  paginate(isPaginatable: boolean = true): TypeCrud {
    this.paginatableRoutes.forEach(route => {
      route.isPaginated = isPaginatable
    })

    return this
  }

  includeRelations(...relations: string[]): TypeCrud {
    this.routes.forEach(route => {
      route.relations = relations
    })

    return this
  }

  softDeletable(softDeletionKey: string): TypeCrud {
    this.routes.forEach(route => {
      route.softDeletionKey = softDeletionKey
    })

    return this
  }
}
