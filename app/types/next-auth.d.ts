// types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
    token: string;
  }

  interface JWT {
    token: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone_number: string;
      role: string;
    };
    token: string;
  }
}
