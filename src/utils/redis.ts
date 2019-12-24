import { promisify } from 'util';
import redisClient from '../services/redis';

const setAsync = promisify(redisClient.set).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);

export const setKey = (
  key: string,
  value: string,
  expiration?: number): Promise<void> => {
    if (expiration && expiration > 0) {
      return setAsync(key, value, 'EX', expiration);
    }

    return setAsync(key, value);
}

export const getKey = async ( key: string): Promise<void> => {
  return getAsync(key);
}
