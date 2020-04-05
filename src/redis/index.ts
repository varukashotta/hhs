import redis from 'redis';
import { logger } from '../log/index';
import dotenv from 'dotenv';

dotenv.config();

const useRedis = async (callback: (arg0: any) => void) => {
  let client:any;
  try{
    client = await redis.createClient(`${process.env.REDIS_URL}`);

  }catch(error){
    console.log(error);
  }

  callback(client);

  client.quit();
};

export default useRedis;
