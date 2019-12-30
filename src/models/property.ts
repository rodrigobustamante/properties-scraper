import Mongoose from 'mongoose';

const PropertySchema = new Mongoose.Schema({
  formattedPrice: { required: true, type: String},
  priceCurrency: { required: true, type: String},
  bathrooms: { required: false, type: Number},
  price: { required: true, type: Number},
  size: { required: false, type: Number},
  rooms: { required: false, type: Number},
  description: { required: true, type: String},
  link: { required: false, type: String},
});

export default Mongoose.model('Property', PropertySchema);
