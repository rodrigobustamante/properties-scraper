import Mongoose from 'mongoose';
import NeigborhoodSchema from './neigborhood';

const CommuneSchema = new Mongoose.Schema({
  name: { required: true, type: String },
  neigborhoods: { required: true, type: [NeigborhoodSchema] }
});

export default Mongoose.model('Commune', CommuneSchema);
