import Mongoose from 'mongoose';
import PropertieSchema from './propertie';

const NeigborhoodSchema = new Mongoose.Schema({
  name: { required: true, type: String },
  slug: { required: true, type: String },
  properties: { required: true, type: [PropertieSchema] }
})

export default Mongoose.model('Neigborhood', NeigborhoodSchema);
