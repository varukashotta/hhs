import { Client } from "@elastic/elasticsearch";
import processSearchQueue from "../queue/processes/search";
import dotenv from "dotenv";
import { logger } from "../log";

dotenv.config();

export const ElasticSearchClient = (): any => {
  return new Promise((resolve, reject) => {
    try {
      const client = new Client({
        node: `${process.env.ELASTIC_SEARCH_SERVER_URL}`,
        auth: {
          apiKey: {
            api_key: `${process.env.ELASTIC_SEARCH_SERVER_API_KEY}`,
            id:  `${process.env.ELASTIC_SEARCH_SERVER_API_ID}`,
          },
        },
      });

      client.ping({}, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(client);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

const INDEX = "human-hope-today";

export const addSearchDoc = async (params: any) => {
  const executeSearch = (client:any) => {
      return new Promise((resolve: (arg0: any) => void, reject: (arg0: any) => void) => {
        processSearchQueue(params, undefined, async (info, job) => {
          try {
            const result = await client.index({
              index: INDEX,
              refresh: "true",
              body: info.phrase,
            });

            resolve(result);

          } catch (error) {

            reject(error);
          }
        });
      });
  };

  try {
    let client: any = await ElasticSearchClient();
    executeSearch(client);
  } catch (e) {
    // logger.error(e);
    console.log('Error cannot connect');

  }
};

export const searchDoc = async (
  date: string,
  combinedKey: string,
  record: any
) => {
  const client: Client = await ElasticSearchClient();

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

  const client: Client = await ElasticSearchClient();

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
