import useRedis from "./index";

export const saveData = (key: any, value: any, ttl: any) => {
  return new Promise((resolve, reject) => {
    useRedis(async (client) => {
      await client.set(key, value, "EX", ttl, (error: any, result: any) => {
        resolve(result);
        reject(error);
      });
    });
  });
};

export const getData = (key: string): any => {
  return new Promise((resolve, reject) => {
    useRedis(async (client) => {
      client.get(key, (err: any, result: any) => {
        resolve(result);
        reject(err);
      });
    });
  });
};
