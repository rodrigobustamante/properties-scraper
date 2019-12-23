import { PropertySpecs } from '../interfaces/helpers';

export const extractSpecs = (itemAttrs: string): PropertySpecs => {
  const specs = itemAttrs.split('|');

  // TODO: Verify if size, rooms or bathrooms are included in the info.
  // https://www.portalinmobiliario.com/arriendo/departamento/providencia-metropolitana/4998497-plaza-las-lilas-uda#position=29&type=item&tracking_id=168f69f3-54f1-42af-8076-a15bfb66c56c
  return {
    size: specs[0] && specs[0].trim(),
    rooms: specs[1] && specs[1].trim(),
    bathrooms: specs[2] && specs[2].trim(),
  }
}

export const splitSeparatedFields = (fields: string, separator = ','): string[] => {
  return fields
    .split(separator)
    .map(field => field.trim())
    .filter(field => !!field);
}
