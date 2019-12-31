import Mongoose from 'mongoose';

const CommuneSchema = new Mongoose.Schema({
  name: { required: true, type: String },
  properties: [{type: Mongoose.Schema.Types.ObjectId, ref: 'Property'}]
});

export default Mongoose.model('Commune', CommuneSchema);
