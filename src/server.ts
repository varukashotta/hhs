import { ApolloServer, gql } from "apollo-server";
import YoutubeAPI from "./datasources/youtube";
import dotenv from "dotenv";
import RedditAPI from "./datasources/reddit";
import NewsAPI from "./datasources/news";
import TwitterAPI from "./datasources/twitter";
import { search } from './search/elasticsearch';
import { getCSV } from "./csvProcessor";

const EventEmitter = require("events");
EventEmitter.defaultMaxListeners = 100;
dotenv.config();

getCSV();

// search();


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
