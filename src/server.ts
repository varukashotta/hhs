//tslint:disable-next-line: no-var-requires
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

import YoutubeAPI from "./datasources/youtube";
import dotenv from "dotenv";
import RedditAPI from "./datasources/reddit";
import NewsAPI from "./datasources/news";
import TwitterAPI from "./datasources/twitter";
import unleashDragon from "./cronjob";
import { logger } from "./log";
import Koa from 'koa';
import { ApolloServer, gql } from 'apollo-server-koa';
import Router from 'koa-router';

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

  type Query {
    youtube: [Info]
    reddit: [Info]
    news: [Info]
    twitter: [Info]
    execute: String!
  }
`;

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

const router = new Router();

router.get('/auth', (ctx) => {
  // console.log(ctx);

  ctx.body = {
    'X-Hasura-Role': 'user',
  };
  // ctx.router available
});

const app = new Koa().use(router.routes());


// @ts-ignore
server.applyMiddleware({app});

// The `listen` method launches a web server.
app.listen({ port: process.env.PORT || 4000 }, () => {
  logger.info(`🚀  Server ready`);
})
