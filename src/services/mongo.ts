import Mongoose from 'mongoose';

export default async function(): Promise<void> {
  // TODO: Change this for .env variables, in the code only for development purpose.
  await Mongoose.connect('mongodb://localhost:27017/properties', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}
