// import { Client } from "@elastic/elasticsearch";
// import processSearchQueue from "../queue/processes/search";
// import dotenv from "dotenv";
// import { logger } from "../log";
//
// dotenv.config();
//
// export const ElasticSearchClient = (): any => {
//   return new Promise((resolve, reject) => {
//     try {
//       const client = new Client({
//         node: `${process.env.ELASTIC_SEARCH_SERVER_URL}`,
//         auth: {
//           apiKey: {
//             api_key: `${process.env.ELASTIC_SEARCH_SERVER_API_KEY}`,
//             id: `${process.env.ELASTIC_SEARCH_SERVER_API_ID}`,
//           },
//         },
//       });
//
//       client.ping({}, (error: any) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(client);
//         }
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };
//
// const INDEX = "human-hope-today";
//
// export const addSearchDoc = async (params: any) => {
//   const executeSearch = (client: any) => {
//     return new Promise(
//       (resolve: (arg0: any) => void, reject: (arg0: any) => void) => {
//         processSearchQueue(params, undefined, async (info, job) => {
//           try {
//             const result = await client.index({
//               index: INDEX,
//               refresh: "true",
//               body: info.phrase,
//             });
//
//             resolve(result);
//           } catch (error) {
//             reject(error);
//           }
//         });
//       }
//     );
//   };
//
//   try {
//     let client: any = await ElasticSearchClient();
//     executeSearch(client);
//   } catch (e) {
//     // logger.error(e);
//     console.log("Error cannot connect");
//   }
// };
//
// export const searchDoc = async (
//   date: string,
//   combinedKey: string,
//   record: any
// ) => {
//   const client: Client = await ElasticSearchClient();
//
//   return new Promise(async (resolve, reject) => {
//     const { body } = await client.search({
//       index: INDEX,
//       body: {
//         query: {
//           bool: {
//             must: [
//               {
//                 match_phrase: {
//                   combined_key: combinedKey,
//                 },
//               },
//             ],
//             filter: [
//               {
//                 term: {
//                   last_updated: date,
//                 },
//               },
//             ],
//           },
//         },
//       },
//     });
//
//     if (body.hits.hits.length > 0) {
//       try {
//         const result = await updateDoc(body.hits.hits[0]._id, record);
//
//         resolve(result);
//       } catch (error) {
//         reject(error);
//       }
//     } else {
//       try {
//         const addResult = await addSearchDoc({ phrase: record });
//
//         resolve(addResult);
//       } catch (error) {
//         reject(error);
//       }
//     }
//   });
// };
//
// export const updateDoc = async (id: string, record: any) => {
//   const { active, confirmed, deaths, recovered } = record;
//
//   const client: Client = await ElasticSearchClient();
//
//   return new Promise(async (resolve, reject) => {
//     try {
//       const { body } = await client.update({
//         index: INDEX,
//         id: `${id}`,
//         body: {
//           doc: {
//             active,
//             confirmed,
//             deaths,
//             recovered,
//           },
//         },
//       });
//
//       resolve(body);
//     } catch (error) {
//       reject(error);
//     }
//   });
// };
//
// export const bulkAPI = async () => {
//   "use strict";
//
//   require("array.prototype.flatmap").shim();
//   const { Client } = require("@elastic/elasticsearch");
//   const client = new Client({
//     node: "http://localhost:9200",
//   });
//
//   async function run() {
//     await client.indices.create(
//       {
//         index: "tweets",
//         body: {
//           mappings: {
//             properties: {
//               id: { type: "integer" },
//               text: { type: "text" },
//               user: { type: "keyword" },
//               time: { type: "date" },
//             },
//           },
//         },
//       },
//       { ignore: [400] }
//     );
//
//     const dataset = [
//       {
//         id: 1,
//         text: "If I fall, don't bring me back.",
//         user: "jon",
//         date: new Date(),
//       },
//       {
//         id: 2,
//         text: "Witer is coming",
//         user: "ned",
//         date: new Date(),
//       },
//       {
//         id: 3,
//         text: "A Lannister always pays his debts.",
//         user: "tyrion",
//         date: new Date(),
//       },
//       {
//         id: 4,
//         text: "I am the blood of the dragon.",
//         user: "daenerys",
//         date: new Date(),
//       },
//       {
//         id: 5, // change this value to a string to see the bulk response with errors
//         text: "A girl is Arya Stark of Winterfell. And I'm going home.",
//         user: "arya",
//         date: new Date(),
//       },
//     ];
//
//     const body = dataset.flatMap((doc) => [
//       { index: { _index: "tweets" } },
//       doc,
//     ]);
//
//     const { body: bulkResponse } = await client.bulk({ refresh: true, body });
//
//     if (bulkResponse.errors) {
//       const erroredDocuments:any = [];
//       // The items array has the same order of the dataset we just indexed.
//       // The presence of the `error` key indicates that the operation
//       // that we did for the document has failed.
//       bulkResponse.items.forEach((action:any, i:any) => {
//         const operation = Object.keys(action)[0];
//         if (action[operation].error) {
//           erroredDocuments.push({
//             // If the status is 429 it means that you can retry the document,
//             // otherwise it's very likely a mapping error, and you should
//             // fix the document before to try it again.
//             status: action[operation].status,
//             error: action[operation].error,
//             operation: body[i * 2],
//             document: body[i * 2 + 1],
//           });
//         }
//       });
//       console.log(erroredDocuments);
//     }
//
//     const { body: count } = await client.count({ index: "tweets" });
//     console.log(count);
//   }
//
//   run().catch(console.log);
// };
