import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export const loader = async () => {
  let needToConfigureGitHub: boolean;
  if (process.env.AUTH_GITHUB_ID === undefined) {
    needToConfigureGitHub = true;
  } else {
    needToConfigureGitHub = false;
  }
  return { needToConfigureGitHub };
};

export default function Login() {
  const { needToConfigureGitHub } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  return (
    <Form action="/auth/github" method="post">
      <Button variant={"outline"}>
        {navigation.state === "submitting"
          ? "Signing in with GitHub..."
          : needToConfigureGitHub
            ? "Configure your GitHub OAuth app credentials in .env to sign in"
            : "Sign in with GitHub to see a different rate limit"}
      </Button>
    </Form>
  );
}
