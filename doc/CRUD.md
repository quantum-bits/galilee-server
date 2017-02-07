# Pattern for CRUD operations in Galilee

To keep these generic,
the RESTful resource is assumed to be called
`resource`.
For an endpoint, this is always plural,
but varies for CRUD methods
in the corresponding service.

As shown, these methods are perhaps _too_ generic.
Some may, in practice, require additional arguments,
(e.g., to resolve foreign key references).
Consider `resource1`
that has a foreign key to `resource2`.
The `create` method for `resource1` might look like:
```typescript
createResource1(resource1: Resource1, resource2: Resource2): Observable<Resource1>
```
where the table for `resource1` has a `NOT NULL` foreign key
to the table for `resource2`.

## Service

* Source file: `resource.service.ts`
* Class: `ResourceService`
* Interface:
  Should contain all fields for the resource,
  including those created by the server
  when a new resource is created
  (e.g., `id`, maybe `createdAt`, etc.).
```typescript
export interface Resource {
    id: number,
    key1: value1,
    key2: value2,
    //...
}
```

## Create

* Method: `POST`
* Path: `/resources`
* Request payload: JS object
  compatible with `Resource`,
  but containing only fields that
  are specified by the user
  (not those created by server, e.g., `id`)
* Reply: `Resource`
* Service:
```typescript
createResource(resource: Resource): Observable<Resource> 
```

## Read

* Method: `GET`
* Path: `/resources/{id}`
* Request payload: *none*
* Reply: `Resource`
* Service:
```typescript
readResource(resourceId: number): Observable<Resource>
```

## Read All

* Method: `GET`
* Path: `/resources`
* Request payload: *none*
* Reply: `Array<Resource>`
* Service:
```typescript
readAllResources(): Observable<Array<Resource>>
```

## Update

* Method: `PATCH`
* Path: `/resources/{id}`
* Request payload: JS object
  with fields to be updated
* Reply: `Resource`
* Service:
```typescript
updateResource(resourceId: number, resource: Resource): Observable<Resource>
```

## Delete

* Method: `DELETE`
* Path: `/resources/{id}`
* Request payload: *none*
* Reply: Number of resources deleted (usually `1`)
* Service:
```typescript
deleteResource(resourceId: number): Observable<number>
```
