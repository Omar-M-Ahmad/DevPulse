import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // account and profile are only available on first sign-in
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      // profile.id is the GitHub numeric user ID — store it once
      if (profile?.id) {
        token.githubId = profile.id as unknown as number;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.githubId = token.githubId as number;
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
});
