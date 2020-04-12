import { Client } from "@elastic/elasticsearch";
import processSearchQueue from "../queue/processes/search";
const client = new Client({ node: "http://search.alvail.com:9200" });

const INDEX = "human-hope-today";

export const addSearchDoc = async (params: any) => {
  return new Promise((resolve, reject) => {
  processSearchQueue(params, undefined, async (info, job) => {
    try {
      const result = await client.index({
        index: INDEX,
        refresh: "true",
        body: info.phrase,
      });

      // console.log(job);

      resolve(result);

      // return result;
    } catch (error) {
      console.log(error);

      reject(error);
    }
  });
});
};

export const searchDoc = async (
  date: string,
  combinedKey: string,
  record: any
) => {
  return new Promise(async (resolve, reject) => {
    const { body } = await client.search({
      index: INDEX,
      body: {
        query: {
          bool: {
            must: [
              {
                match_phrase: {
                  combined_key: combinedKey,
                },
              },
            ],
            filter: [
              {
                term: {
                  last_updated: date,
                },
              },
            ],
          },
        },
      },
    });

    if (body.hits.hits.length > 0) {
      try {
        const result = await updateDoc(body.hits.hits[0]._id, record);

        resolve(result);
      } catch (error) {

        reject(error);
      }
    } else {
      try {
        const addResult = await addSearchDoc({ phrase: record });

        resolve(addResult);
      } catch (error) {
        reject(error);
      }
    }
  });
};

export const updateDoc = async (id: string, record: any) => {
  const { active, confirmed, deaths, recovered } = record;

  return new Promise(async (resolve, reject) => {
    try {
      const { body } = await client.update({
        index: INDEX,
        id: `${id}`,
        body: {
          doc: {
            active,
            confirmed,
            deaths,
            recovered,
          },
        },
      });

      resolve(body);
    } catch (error) {
      reject(error);
    }
  });
};
