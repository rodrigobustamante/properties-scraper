export interface CommuneInfo {
  id: number,
  name: string,
  label: string
}

export interface SearchCommuneResponse {
  suggest: Suggest
}

export interface Property {
  price: number,
  size: number,
  bathrooms: number,
  rooms: number,
  link: string,
  description: string,
}

interface Suggest {
  autocompletesuggest: AutocompleteSuggestion[]
}

interface AutocompleteSuggestion {
  text: string,
  offset: number,
  length: number,
  options: SuggestionOptions[]
}

interface SuggestionOptions {
  text: string,
  _index: string,
  _type: string,
  _id: string,
  _score: number,
  _source: OptionSource
}

interface OptionSource {
  suggest: OptionSourceSuggestions[]
  Texto: string,
  IdInterno: number,
  IdTipo: string
}

interface OptionSourceSuggestions {
  input: string,
  weight: number
}
