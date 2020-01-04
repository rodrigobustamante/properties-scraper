import CommuneModel from '../models/commune';
import PropertyModel from '../models/property';
import { Property } from '../interfaces/portal-inmobiliario';

export const createCommune = async (
  name: string,
  propertiesToSave: string[]
): Promise<string> => {
  try {
    const commune = await CommuneModel.findOne({ name });

    if (commune) {
      // Parsed ids to String, because mongo (or mongoose) return an object.
      const oldProperties = commune.get('properties').map((propertyId) => String(propertyId));
      const parsedPropertiesToSave = propertiesToSave.map((propertyId) => String(propertyId));
      const properties = [... new Set([...oldProperties, ...parsedPropertiesToSave])];

      await commune.updateOne({ properties });
      // eslint-disable-next-line no-underscore-dangle
      return commune._id;
    }

    const newCommune = new CommuneModel({ name, properties: propertiesToSave });
    await newCommune.save();

    // eslint-disable-next-line no-underscore-dangle
    return newCommune._id;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const createProperty = async (property: Property): Promise<string> => {
  try {
    const p = await PropertyModel.findOne({ link: property.link });

    if (p) {
      await p.updateOne(property);
      // eslint-disable-next-line no-underscore-dangle
      return p._id;
    }

    const newProperty = new PropertyModel(property);
    await newProperty.save();

    // eslint-disable-next-line no-underscore-dangle
    return newProperty._id;
  } catch (error) {
    throw new Error(error.message);
  }
};
