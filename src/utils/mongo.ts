import CommuneModel from '../models/commune';
import NeigborhoodModel from '../models/neigborhood';
import PropertyModel from '../models/property';
import { Property, NeigborhoodInfo } from '../interfaces/portal-inmobiliario';

export const createCommune = async (name: string, neigborhoods: any): Promise<void> => {
  try {
    CommuneModel.create({ name, neigborhoods: ['hola', 'hola'] }, (err, commune) => {
      if (err) throw new Error(err);

      return console.log({commune});

    });

  } catch (error) {
    throw new Error(error.message)
  }
}

export const createNeigborhood = async (neigborhood: any): Promise<void> => {
  try {
    const newNeigborhood = new NeigborhoodModel(neigborhood);
    await newNeigborhood.save();

    return newNeigborhood.id;
  } catch (error) {
    throw new Error(error.message)
  }
}


export const createProperty = async (property: Property): Promise<void> => {
  try {
    const newProperty = new PropertyModel(property);
    await newProperty.save();

    return newProperty.id;
  } catch (error) {
    throw new Error(error.message)
  }
}
