import Redis from 'ioredis';

const redisClient = new Redis({ lazyConnect: true });

export default redisClient;
