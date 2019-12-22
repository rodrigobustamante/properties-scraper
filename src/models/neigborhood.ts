import Mongoose from 'mongoose';

const NeigborhoodSchema = new Mongoose.Schema({
  slug: { required: true, type: String },
  properties: [String],
})

export default Mongoose.model('Neigborhood', NeigborhoodSchema);
