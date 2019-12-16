export interface NeigborhoodSimple {
  id: string,
  name: string,
  level: string,
}

export interface NeigborhoodUrl {
  url?: string,
}

export interface NeigborhoodInfo {
  neighborhoodSlug: string,
  neighborhoodData: Property[]
}

export interface Property {
  value: string,
  size: string,
  rooms: string,
  bathrooms: string,
  type: string,
  description: string,
}