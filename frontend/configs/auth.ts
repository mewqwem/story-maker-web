// configs/auth.ts
import { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

interface ExtendedUser extends User {
  id: string;
}

interface ExtendedJWT extends JWT {
  id: string;
}

interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export const authConfig: NextAuthOptions = {
  // 1. Explicitly set the secret from env [cite: 2026-04-02]
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],

  // 2. Explicitly define JWT strategy [cite: 2026-04-02]
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      const extendedUser = user as ExtendedUser;
      if (extendedUser) {
        token.id = extendedUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
      const extendedToken = token as ExtendedJWT;

      if (extendedSession.user) {
        extendedSession.user.id = extendedToken.id;
      }

      return extendedSession;
    },
  },
};
