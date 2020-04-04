import Queue from 'bull';
import dotenv from 'dotenv';

dotenv.config();

const createQueue = (queuename:string) => new Queue(queuename, `${process.env.REDIS_URL}`);

export default createQueue;
