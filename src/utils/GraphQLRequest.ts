
import { GraphQLClient } from 'graphql-request';

require('dotenv').config();

const graphqlClient = new GraphQLClient(
  `${process.env.HASURA_GRAPHQL_ENDPOINT}`,
  {
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': `${process.env.HASURA_GRAPHQL_ADMIN_SECRET}`,
    },
  },
);


export default graphqlClient;
