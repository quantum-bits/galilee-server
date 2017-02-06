# Pattern for CRUD operations in Galilee

To keep these generic,
the RESTful resource is assumed to be called
`resource`.
For an endpoint, this is always plural,
but varies for CRUD methods
in the corresponding service.

## Service

* Source file: `resource.service.ts`
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
createResource(payload: Resource): Observable<Resource> 
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

## Update

* Method: `PATCH`
* Path: `/resources/{id}`
* Request payload: JS object
  with fields to be updated
* Reply: `Resource`
* Service:
```typescript
updateResource(resourceId: number): Observable<Resource>
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
