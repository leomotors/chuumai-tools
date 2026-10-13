import { SvelteKitAuth } from "@auth/sveltekit";
import Discord from "@auth/sveltekit/providers/discord";

export const { handle, signIn, signOut } = SvelteKitAuth({
  // Discord now sends RFC 9207 `iss` on the callback; without this Auth.js
  // expects its "https://authjs.dev" placeholder and rejects every sign-in.
  providers: [Discord({ issuer: "https://discord.com" })],
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
