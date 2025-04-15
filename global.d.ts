import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare global {
  var mongoose: {
    conn: any;
    promise: any;
  };
} 