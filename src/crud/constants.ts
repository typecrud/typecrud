export enum CRUDType {
  Create = 'CREATE',
  Read = 'READ',
  ReadOne = 'READONE',
  Update = 'UPDATE',
  Delete = 'DELETE'
}

export enum HTTPMethod {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC'
}

const CRUDTypeHTTPMethodMapping: { [x: string]: string[] } = {}
CRUDTypeHTTPMethodMapping[CRUDType.Create] = [HTTPMethod.POST]
CRUDTypeHTTPMethodMapping[CRUDType.Read] = [HTTPMethod.GET]
CRUDTypeHTTPMethodMapping[CRUDType.ReadOne] = [HTTPMethod.GET]
CRUDTypeHTTPMethodMapping[CRUDType.Update] = [HTTPMethod.PUT, HTTPMethod.PATCH]
CRUDTypeHTTPMethodMapping[CRUDType.Delete] = [HTTPMethod.DELETE]

export { CRUDTypeHTTPMethodMapping }
