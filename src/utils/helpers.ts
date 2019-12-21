import { PropertieSpecs } from '../interfaces/helpers';

const extractSpecs = (itemAttrs: string): PropertieSpecs => {
  const specs = itemAttrs.split('|');

  return {
    size: specs[0] && specs[0].trim(),
    rooms: specs[1] && specs[1].trim(),
    bathrooms: specs[2] && specs[2].trim(),
  }
}

export default extractSpecs;
