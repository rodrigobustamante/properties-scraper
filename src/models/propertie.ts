import Mongoose from 'mongoose';

const PropertieSchema = new Mongoose.Schema({
  formattedPrice: { required: true, type: String},
  priceCurrency: { required: true, type: String},
  bathrooms: { required: true, type: String},
  price: { required: true, type: String},
  size: { required: true, type: String},
  rooms: { required: true, type: String},
  description: { required: true, type: String},
  link: { required: false, type: String},
});

export default Mongoose.model('Propertie', PropertieSchema);
