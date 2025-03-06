import mongoose from 'mongoose';
import { ENV } from '../common/config/config';

export class MongoDataBase {
  async initialize(): Promise<Error | null> {
    return await mongoose
      .connect(ENV.DB.MONGODB.URL, {
        dbName: ENV.DB.MONGODB.DATABASE_NAME,
        // useFindAndModify: false,
        // useUnifiedTopology: true,
        // useNewUrlParser: true,
        // useCreateIndex: true
      })
      .then(() => {
        mongoose.set('strictQuery', true);
        return null;
      })
      .catch((err) => {
        return err;
      });
  }

  async closeConnection(): Promise<Error | null> {
    await mongoose.disconnect();
    return null;
  }
}

export const mongoDataBase = new MongoDataBase();
