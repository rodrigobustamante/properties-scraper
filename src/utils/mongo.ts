import CommuneModel from '../models/commune';
import NeigborhoodModel from '../models/neigborhood';
import PropertyModel from '../models/property';
import { Property, NeigborhoodInfo } from '../interfaces/portal-inmobiliario';

export const createCommune = async (name: string, neigborhoods: string[]): Promise<string> => {
  try {
    const newCommune = new CommuneModel({name, neigborhoods});
    await newCommune.save();

    return newCommune.id;
  } catch (error) {
    throw new Error(error.message)
  }
}

export const createNeigborhood = async (slug: string, properties: string[]): Promise<string> => {
  try {
    const newNeigborhood = new NeigborhoodModel({slug, properties});
    await newNeigborhood.save();

    return newNeigborhood.id;
  } catch (error) {
    throw new Error(error.message)
  }
}


export const createProperty = async (property: Property): Promise<string> => {
  try {
    const newProperty = new PropertyModel(property);
    await newProperty.save();

    return newProperty.id;
  } catch (error) {
    throw new Error(error.message)
  }
}
