// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { GitHubStrategy } from "remix-auth-github";

export type User = {
  id: string;
  email: string;
};

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<User>(sessionStorage);

const gitHubStrategy = new GitHubStrategy(
  {
    clientId: process.env.AUTH_GITHUB_ID!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
    redirectURI: "http://localhost:3000/auth/github/callback",
  },
  async ({ profile }) => {
    const user: User = {
      id: profile.id,
      email: profile.emails[0].value,
    };

    return user;
  },
);

authenticator.use(gitHubStrategy);
