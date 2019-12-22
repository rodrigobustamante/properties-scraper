import Mongoose from 'mongoose';

const PropertySchema = new Mongoose.Schema({
  formattedPrice: { required: true, type: String},
  priceCurrency: { required: true, type: String},
  bathrooms: { required: false, type: String},
  price: { required: true, type: String},
  size: { required: false, type: String},
  rooms: { required: false, type: String},
  description: { required: true, type: String},
  link: { required: false, type: String},
});

export default Mongoose.model('Property', PropertySchema);
