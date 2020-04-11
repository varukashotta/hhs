import { Client } from "@elastic/elasticsearch";
import processSearchQueue from "../queue/processes/search";
const client = new Client({ node: "http://search.alvail.com:9200" });

const INDEX = "human-hope-today";

export const addSearchDoc = async (params: any) => {
  processSearchQueue(params, undefined, async (info, job) => {
    try {
      const result = await client.index({
        index: INDEX,
        refresh: "true",
        body: info.phrase,
      });

      // console.log(job);

      console.log(result);

      // return result;
    } catch (e) {
      console.log(e);

      return e;
    }
  });
};

export const searchDoc = async (date: string, combinedKey: string) => {
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
      const result = await updateDoc(body.hits.hits[0]._id);

      console.log(result);
    } catch (e) {
      console.log(e);
    }
  }
};

export const updateDoc = async (id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { body } = await client.update({
        index: INDEX,
        id: `${id}`,
        body: {
          doc: {
            active: 0,
            confirmed: 8,
            deaths: 0,
          },
        },
      });

      resolve(body.hits);
    } catch (e) {
      reject(e);
    }
  });
};

// async function run () {
//   // Let's start by indexing some data
//   await client.index({
//     index: 'game-of-thrones',
//     body: {
//       character: 'Ned Stark',
//       quote: 'Winter is coming.'
//     }
//   })
//   await client.index({
//     index: 'game-of-thrones',
//     body: {
//       character: 'Daenerys Targaryen',
//       quote: 'I am the mother of dragons.'
//     }
//   })
//   await client.index({
//     index: 'game-of-thrones',
//     // here we are forcing an index refresh,
//     // otherwise we will not get any result
//     // in the consequent search
//     refresh: true,
//     body: {
//       character: 'Tyrion Lannister',
//       quote: 'A mind needs books like a sword needs a whetstone.'
//     }
//   })
//   // Let's search!
//   const { body } = await client.search({
//     index: 'game-of-thrones',
//     body: {
//       query: {
//         match: {
//           quote: 'winter'
//         }
//       }
//     }
//   })
//   console.log(body.hits.hits)
// }
// run().catch(console.log)
