import CommuneModel from '../models/commune';
import NeigborhoodModel from '../models/neigborhood';
import PropertyModel from '../models/property';
import { Property } from '../interfaces/portal-inmobiliario';

export const createCommune = async (
  name: string,
  neigborhoods: string[]
): Promise<string> => {
  try {
    const commune = await CommuneModel.findOne({name});

    if (commune) {
      await commune.updateOne({name, neigborhoods});
      // eslint-disable-next-line no-underscore-dangle
      return commune._id;
    }

    const newNeigborhood = new CommuneModel({name, neigborhoods});
    newNeigborhood.save();

    // eslint-disable-next-line no-underscore-dangle
    return newNeigborhood._id;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const createNeigborhood = async (
  slug: string,
  properties: string[]
): Promise<string> => {
  try {
    const neigborhood = await NeigborhoodModel.findOne({slug});

    if (neigborhood) {
      await neigborhood.updateOne({slug, properties});
      // eslint-disable-next-line no-underscore-dangle
      return neigborhood._id;
    }

    const newNeigborhood = new NeigborhoodModel({slug, properties});
    newNeigborhood.save();

    // eslint-disable-next-line no-underscore-dangle
    return newNeigborhood._id;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const createProperty = async (property: Property): Promise<string> => {
  try {
    const p = await PropertyModel.findOne({link: property.link});

    if (p) {
      await p.updateOne(property);
      // eslint-disable-next-line no-underscore-dangle
      return p._id;
    }

    const newProperty = new PropertyModel(property);
    newProperty.save();

    // eslint-disable-next-line no-underscore-dangle
    return newProperty._id;
  } catch (error) {
    throw new Error(error.message);
  }
};
