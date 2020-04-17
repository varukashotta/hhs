// tslint:disable-next-line: no-var-requires
// require("elastic-apm-node").start({
//   serviceName: "hhs",
//   environment: `${process.env.NODE_ENV}`,
//   secretToken: "0gcOqtwZe2LBLhFWuA",
//   serverUrl:
//     "https://5937c8a340f749e8b814d3753ae70cd2.apm.ap-southeast-2.aws.cloud.es.io:443",
// });

// tslint:disable-next-line: no-var-requires
const EventEmitter = require("events");
EventEmitter.defaultMaxListeners = 100;

import { ApolloServer, gql } from "apollo-server";
import YoutubeAPI from "./datasources/youtube";
import dotenv from "dotenv";
import RedditAPI from "./datasources/reddit";
import NewsAPI from "./datasources/news";
import TwitterAPI from "./datasources/twitter";
import unleashDragon from "./cronjob";
import { logger } from "./log";

dotenv.config();

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
    execute: async (_parent: any, _args: any, _context: any, _info: any) => {
      // console.log(_parent, _info, _context, _args );

      return await unleashDragon();
    },
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
  logger.info(`🚀  Server ready at ${url.url}`);
});
