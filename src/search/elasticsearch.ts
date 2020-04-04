import { Client } from "@elastic/elasticsearch";
import processSearch from "../queue/processes/search";
const client = new Client({ node: "http://search.alvail.com:9200" });

export const search = async (params: any) => {
  await processSearch(params, undefined, async info => {
    console.log(info);

    const result = await client.index({
      index: "human-hope",
      refresh: "true",
      body: info.phrase
    });

    console.log(result);
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
