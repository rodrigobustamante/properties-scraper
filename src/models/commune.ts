import Mongoose from 'mongoose';

const CommuneSchema = new Mongoose.Schema({
  name: { required: true, type: String },
  neigborhoods: [{type: Mongoose.Schema.Types.ObjectId, ref: 'Neigborhood'}]
});

export default Mongoose.model('Commune', CommuneSchema);
