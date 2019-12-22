import Mongoose from 'mongoose';

const CommuneSchema = new Mongoose.Schema({
  name: { required: true, type: String },
  neigborhoods: [String]
});

export default Mongoose.model('Commune', CommuneSchema);
