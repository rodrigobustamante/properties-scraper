// import { promisify } from 'util';
import redisClient from '../services/redis';

// const setAsync = promisify(redisClient.set).bind(redisClient);
// const getAsync = promisify(redisClient.get).bind(redisClient);
// const quitAsync = promisify(redisClient.quit).bind(redisClient);

export const setKey = (
  key: string,
  value: string,
  expiration?: number): Promise<string> => {
    if (expiration && expiration > 0) {
      return redisClient.set(key, value, 'EX', expiration);
    }

    return redisClient.set(key, value);
}

export const getKey = async (key: string): Promise<string> => {
  const value = await redisClient.get(key);
  return value;
}
