import { routes } from '@/config/routes';
import type { NextAuthOptions, RequestInternal } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  token: string;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // Max age for the session, in seconds
  },

  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',

      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(
        credentials: Record<'email' | 'password', string> | undefined,
        req: Pick<RequestInternal, 'body' | 'method' | 'headers' | 'query'>
      ): Promise<User | null> {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        try {
          // 1. Get token from login API
          const loginRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
            }
          );

          const loginData = await loginRes.json();

          if (loginRes.ok && loginData.token) {
            // 2. Use the token to fetch user data
            const userRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/user`,
              {
                headers: {
                  Authorization: `Bearer ${loginData.token}`,
                },
              }
            );

            const userData = await userRes.json();

            if (userRes.ok && userData.user) {
              return {
                id: userData.user.id.toString(),
                email: userData.user.email,
                first_name: userData.user.first_name,
                last_name: userData.user.last_name,
                phone_number: userData.user.phone_number,
                role: userData.user.role,
                token: loginData.token,
              };
            }
          }
          return null;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: routes.signIn,
    signOut: routes.signIn,
    error: routes.signIn,
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    jwt: async ({ token, user }) => {
      // Initial sign-in: include all user data in the JWT
      if (user) {
        // Add all user properties to the token
        token.id = user.id;
        token.email = user.email;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.phone_number = user.phone_number;
        token.role = user.role;
        token.token = user.token;
        console.log('JWT user data added:', user);
      }
      return token;
    },

    session: async ({ session, token }) => {
      console.log('Building session from token:', token);

      // Properly map token properties to session
      session.user = {
        id: token.id as string,
        email: token.email as string,
        first_name: token.first_name as string,
        last_name: token.last_name as string,
        phone_number: token.phone_number as string,
        role: token.role as string,
      };

      // Add token to session
      session.token = token.token as string;

      console.log('Final session:', session);
      return session;
    },
  },
};
