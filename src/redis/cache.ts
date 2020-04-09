import useRedis from "./index";

export const saveData = (key: any, value: any, ttl: any) => {
  useRedis(async (client) => {
    const result = await client.set(key, value, "EX", ttl);
    return result;
  });
};

export const getData = (key: string): any => {
  return new Promise((resolve, reject) => {
    useRedis(async (client) => {
      client.get(key, (err: any, result: any) => {
        if (result) resolve(result);
        if (err) reject(err);
      });
    });
  });
};
