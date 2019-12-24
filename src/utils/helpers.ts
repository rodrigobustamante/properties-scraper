import { PropertySpecs } from '../interfaces/helpers';

const extractNumbersOfString = (str: string): string => {
  if (!str) return null;

  const matched = str.match(/\d+/g)

  if (!matched) return null;

  return str.match(/\d+/g).map(Number).join('');
}

export const extractSpecs = (itemAttrs: string): PropertySpecs => {
  const specs = itemAttrs.split('|');

  return {
    size: extractNumbersOfString(specs.find(spec => spec.includes('m²'))),
    rooms: extractNumbersOfString(specs.find(spec => spec.includes('dormitorio'))),
    bathrooms: extractNumbersOfString(specs.find(spec => spec.includes('baño'))),
  }
}

export const splitSeparatedFields = (fields: string, separator = ','): string[] => {
  return fields
    .split(separator)
    .map(field => field.trim())
    .filter(field => !!field);
}
