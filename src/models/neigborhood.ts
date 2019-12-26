import Mongoose from 'mongoose';

const NeigborhoodSchema = new Mongoose.Schema({
  slug: { required: true, type: String },
  properties: [{type: Mongoose.Schema.Types.ObjectId, ref: 'Property'}],
});

export default Mongoose.model('Neigborhood', NeigborhoodSchema);
