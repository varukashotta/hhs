import Queue from 'bull';
import dotenv from 'dotenv';

dotenv.config();

const {REDIS_URL} = process.env

import Redis from 'ioredis';
const client = new Redis(REDIS_URL);
const subscriber = new Redis(REDIS_URL);

const opts = {
  createClient (type: any) {
    switch (type) {
      case 'client':
        return client;
      case 'subscriber':
        return subscriber;
      default:
        return new Redis(REDIS_URL);
    }
  }
}

const createQueue = (queuename:string) => new Queue(queuename, opts);

export default createQueue;
