# TypeCRUD
This library aims to be a drop-in CRUD route generator for `node.js` express applications, using TypeORM. TypeCRUD works if you are using the `active record` pattern of TypeORM, extending your models from `BaseEntity`.

## Usage
To let TypeCRUD generate routes, simply use the provided TypeCrud class:

```
// generates all CRUD endpoints on /events for the Event class
app.use(new TypeCrud(Event, '/events').router)
```

By default, TypeCrud will generate all CRUD routes (Create/Read/Update/Delete) as follows:

* POST /
* GET /
* GET /:id
* PUT/PATCH /:id
* DELETE /:id

You can adjust this using the (optional) parameter that takes an array of `CRUDType`.

```
// generates only a POST endpoint on /events for the Event class
app.use('/events', new TypeCrud(Event, { crudTypes: [CRUDType.Create] }).router)
```

There are also a couple of methods that allow you to further customize the routes:
```
const typeCrudRouter = new TypeCrud(Event, {
  filterBy: ['name'], // allows to append query parameters to filter, such as ?name=superevent
  includeRelations: ['guests'], // includes fully populated relations based on their property name
  isPaginatable: true, // enabled pagination
  softDeleteBy: 'deletedAt', // DELETE does not remove the entitiy, but only sets a "deletedAt" flag. GET will not return those.
  hooks: {
    pre: {
      [CRUDType.Create]: (request: Express.Request, entity: Guestlist) => {
        entity.owner = request.user.owner
      }
    }
  }
}).router
```
