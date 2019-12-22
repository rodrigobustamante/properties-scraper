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
  formattedPrice: string,
  priceCurrency: string,
  bathrooms: string,
  price: number,
  size: string,
  rooms: string,
  description: string,
  link?: string,
}
