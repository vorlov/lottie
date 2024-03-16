import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { io } from 'socket.io-client';

export const socket = io('http://localhost:4000');

const httpLink = new HttpLink({
  uri: 'https://graphql.lottiefiles.com',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
