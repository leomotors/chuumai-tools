import { SvelteKitAuth } from "@auth/sveltekit";
import Discord from "@auth/sveltekit/providers/discord";

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [Discord],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.id;
      }
      delete token.email;
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  trustHost: true,
});
