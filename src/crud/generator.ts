import { CreateRoute } from './create'
import { UpdateRoute } from './update'
import { ReadRoute } from './read'
import { DeleteRoute } from './delete'
import { BaseEntity, FindOperator } from 'typeorm'
import { Router, Request } from 'express'
import { ReadOneRoute } from './read-one'
import { Route, FilterableRoute, SortableRoute, PaginatedRoute } from '../route'
import { Order, CRUDType } from './constants'

const crudConstructors = {
  [CRUDType.Create]: {
    route: CreateRoute,
    defaultSuffix: '/'
  },
  [CRUDType.Read]: {
    route: ReadRoute,
    defaultSuffix: '/'
  },
  [CRUDType.ReadOne]: {
    route: ReadOneRoute,
    defaultSuffix: '/:id'
  },
  [CRUDType.Update]: {
    route: UpdateRoute,
    defaultSuffix: '/:id'
  },
  [CRUDType.Delete]: {
    route: DeleteRoute,
    defaultSuffix: '/:id'
  }
}

export interface Hooks<T> {
  pre?: { [x in CRUDType]?: (request: Request, entity: T[]) => void | Promise<void> }
  post?: { [x in CRUDType]?: (request: Request, entity: T[]) => void | Promise<void> }
  postSerialization?: { [x in CRUDType]?: (request: Request, object: Object[]) => void | Promise<void> }
}

export interface TypeCrudConfig<T> {
  crudTypes?: CRUDType[]
  queryFilter?: (request: Request) => { [x: string]: FindOperator<any> }
  filterBy?: string[]
  orderBy?: { key: string; order: Order }
  orderKeys?: string[]
  softDeleteBy?: string
  isPaginatable?: boolean
  includeRelations?: string[]
  multiCreation?: boolean
  hooks?: Hooks<T>
}

const defaultCrudTypes = [CRUDType.Create, CRUDType.ReadOne, CRUDType.Read, CRUDType.Update, CRUDType.Delete]

export class TypeCrud<T extends BaseEntity> {
  router: Router

  private filterableRoutes: FilterableRoute[] = []
  private sortableRoutes: SortableRoute[] = []
  private paginatableRoutes: PaginatedRoute[] = []
  private routes: Route<T>[] = []

  constructor(model: typeof BaseEntity, protected config: TypeCrudConfig<T> = {} as TypeCrudConfig<T>) {
    const crud = config.crudTypes || defaultCrudTypes
    const uniqueCrud = crud.filter((x, i) => crud.indexOf(x) === i)
    this.router = Router()

    uniqueCrud.forEach(crud => {
      const crudConstructor = crudConstructors[crud]

      const route = this.routeFactory(crudConstructor.route, model, crudConstructor.defaultSuffix, config)
      const crudRouter = route.getRouter()

      // check if we support filterKeys
      if ((route as any).filterKeys !== undefined) {
        this.filterableRoutes.push(route as any)
      }

      // check if we support filterKeys
      if ((route as any).orderBy !== undefined) {
        this.sortableRoutes.push(route as any)
      }

      // check if route is paginated
      if ((route as any).isPaginated !== undefined) {
        this.paginatableRoutes.push(route as any)
      }

      this.routes.push(route)
      this.router.use(crudRouter)
    })

    if (config.queryFilter) this.queryFilter(config.queryFilter)
    if (config.filterBy) this.filterBy(config.filterBy)
    if (config.orderBy) this.orderBy(config.orderBy)
    if (config.orderKeys) this.orderKeys(config.orderKeys)
    if (config.isPaginatable) this.isPaginatable(config.isPaginatable)
    if (config.includeRelations) this.includeRelations(config.includeRelations)
    if (config.softDeleteBy) this.softDeleteBy(config.softDeleteBy)
    if (config.hooks) this.hooks(config.hooks)
  }

  private routeFactory(
    type: new (model: typeof BaseEntity, path: string, config: TypeCrudConfig<T>) => Route<T>,
    model: typeof BaseEntity,
    defaultSuffix: string,
    config: TypeCrudConfig<T>
  ): Route<T> {
    return new type(model, defaultSuffix, config)
  }

  private hooks(hooks: Hooks<T>) {
    this.routes.forEach(route => {
      route.hooks = hooks
    })

    return this
  }

  private queryFilter(filter: (request: Request) => { [x: string]: FindOperator<any> }) {
    this.routes.forEach(route => {
      route.queryFilter = filter
    })
  }

  private filterBy(filterKeys: string[]) {
    this.filterableRoutes.forEach(route => {
      route.filterKeys = filterKeys
    })
  }

  private orderBy(config: { key: string; order: Order }) {
    this.sortableRoutes.forEach(route => {
      route.orderBy = { key: config.key, order: config.order }
    })
  }

  private orderKeys(orderKeys: string[]) {
    this.sortableRoutes.forEach(route => {
      route.orderKeys = orderKeys
    })
  }

  private isPaginatable(isPaginatable: boolean) {
    this.paginatableRoutes.forEach(route => {
      route.isPaginated = isPaginatable
    })
  }

  private includeRelations(relations: string[]) {
    this.routes.forEach(route => {
      route.relations = relations
    })
  }

  private softDeleteBy(softDeletionKey: string) {
    this.routes.forEach(route => {
      route.softDeletionKey = softDeletionKey
    })
  }
}
