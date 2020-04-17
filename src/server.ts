
var apm = require("elastic-apm-node").start({
  // Override service name from package.json
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: "hhs",

  environment: `${process.env.NODE_ENV}`,

  // Use if APM Server requires a token
  secretToken: "0gcOqtwZe2LBLhFWuA",

  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl:
    "https://5937c8a340f749e8b814d3753ae70cd2.apm.ap-southeast-2.aws.cloud.es.io:443",
});


import { ApolloServer, gql } from "apollo-server";
import YoutubeAPI from "./datasources/youtube";
import dotenv from "dotenv";
import RedditAPI from "./datasources/reddit";
import NewsAPI from "./datasources/news";
import TwitterAPI from "./datasources/twitter";
import { getCSV } from "./csvProcessor";
import { cleanUpCSV } from "./csvProcessor/directImport";
import { sendToDB } from "./csvProcessor/dbImport";
import { readLocalFile } from "./utils";
import fs from "fs";
import { addSearchDoc, ElasticSearchClient } from "./search/elasticsearch";
import { logger } from './log/index';
import { gitHub } from './csvProcessor/getData';
import unleashDragon from './cronjob/index';


const EventEmitter = require("events");
EventEmitter.defaultMaxListeners = 100;

dotenv.config();

console.log(process.env.NODE_ENV);




// const test = async() => {
//   try {
//     const client = await ElasticSearchClient();
//     const result = await client.index({
//       index: "human-hope-today",
//       refresh: "true",
//       body: {
//         "info": "phrase"
//       },
//     });
//     console.log(result.body);
//   } catch (e) {
//     console.log(e);
//   }

// }

// test()

// sendToDB();

// getCSV();

// search();

// const go = async () => {
//   const file: any = await fs.readFileSync("./src/data/date.csv");

//   let csv: string = String(file);

//   csv = csv.replace(/,/g, "\t");

//   // console.log(String(csv));

//   csv = csv.replace(/"[^"]+"/g, function(match) {
//     return match.replace(/\t/g, ",");
//   });

//   fs.writeFile("test-sync.csv", csv, (err) => console.log(err));
//   // sendToDB()
// };

// go();
const go = async() => {
  console.log(await gitHub());
}

// go();

const typeDefs = gql`
  scalar Date

  type Info {
    id: ID!
    title: String!
    publishedAt: Date!
    link: String
    author: String
    thumbnail: String
    description: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    youtube: [Info]
    reddit: [Info]
    news: [Info]
    twitter: [Info]
    execute: String!
  }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    youtube: async (_source: any, { id }: any, { dataSources }: any) => {
      return dataSources.youtubeAPI.getVideos();
    },
    reddit: async (_source: any, { id }: any, { dataSources }: any) => {
      return dataSources.redditAPI.getRedits();
    },
    news: async (_source: any, { id }: any, { dataSources }: any) => {
      return dataSources.newsAPI.getNews();
    },
    twitter: async (_source: any, { id }: any, { dataSources }: any) => {
      return dataSources.twitterAPI.getTweets();
    },
    execute: async(_parent: any, _args: any, _context: any, _info: any) => {
      // console.log(_parent, _info, _context, _args );
      
      return await unleashDragon();
    }
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  tracing: true,
  introspection: true,
  debug: true,
  playground: true,
  dataSources: () => ({
    youtubeAPI: new YoutubeAPI(),
    redditAPI: new RedditAPI(),
    newsAPI: new NewsAPI(),
    twitterAPI: new TwitterAPI(),
  }),
});

// The `listen` method launches a web server.
server.listen({ port: process.env.PORT || 4000 }).then((url: any) => {
  console.log(`🚀  Server ready at ${url.url}`);
});
