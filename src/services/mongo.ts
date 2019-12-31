import Mongoose from 'mongoose';

require('../models/property');

export const connectToDB = async (): Promise<void> => {
  // TODO: Change this for .env variables, in the code only for development purpose.
  await Mongoose.connect('mongodb://localhost:27017/properties', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });
}

export const disconnectFromDB = async (): Promise<void> => {
  await Mongoose.disconnect();
}
