export interface NeigborhoodSimple {
  id: string,
  name: string,
  level: string,
}

export interface NeigborhoodUrl {
  url?: string,
}

export interface NeigborhoodInfo {
  slug: string,
  properties: Property[]
}

export interface Property {
  priceCurrency: string,
  bathrooms: number,
  price: number,
  size: number,
  rooms: number,
  description: string,
  link?: string,
}
