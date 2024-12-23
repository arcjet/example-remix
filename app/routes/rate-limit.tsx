import { setRateLimitHeaders } from "@arcjet/decorate";
import { fixedWindow } from "@arcjet/remix";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import arcjet from "~/arcjet";
import WhatNext from "~/components/compositions/WhatNext";
import Divider from "~/components/elements/Divider";
import { authenticator, User } from "~/services/auth.server";
import Login from "./login";
import Logout from "./logout";

import styles from "~/components/elements/PageShared.module.scss";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "Arcjet Remix rate limit example" },
    {
      name: "description",
      content: "An example of Arcjet's rate limit for Remix.",
    },
  ];
};

// Returns ad-hoc rules depending on whether the session is present. You could
// inspect more details about the session to dynamically adjust the rate limit.
function getClient(user: User | null) {
  if (user?.email) {
    return arcjet.withRule(
      fixedWindow({
        mode: "LIVE",
        max: 5,
        window: "60s",
      }),
    );
  } else {
    return arcjet.withRule(
      fixedWindow({
        mode: "LIVE",
        max: 2,
        window: "60s",
      }),
    );
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  return { user };
};

export async function action(args: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(args.request);

  // If the user is logged in then we use their user ID as the fingerprint. This
  // means the rate limit will track them across browsers. If the user is
  // anonymous then we use their IP.
  const fingerprint = user?.id ?? (args.context.ip as string);
  const decision = await getClient(user).protect(args, { fingerprint });

  console.log("Arcjet decision: ", decision);

  // Return the RFC headers for rate limiting
  // https://www.ietf.org/archive/id/draft-polli-ratelimit-headers-02.html
  const headers = new Headers();
  setRateLimitHeaders(headers, decision);

  let message = "";
  let remaining = 0;

  // Display a more user-friendly message for rate limiting
  if (decision.reason.isRateLimit()) {
    const reset = decision.reason.resetTime;
    remaining = decision.reason.remaining;

    if (reset === undefined) {
      message = "";
    } else {
      // Calculate number of seconds between reset Date and now
      const seconds = Math.floor((reset.getTime() - Date.now()) / 1000);
      const minutes = Math.ceil(seconds / 60);

      if (minutes > 1) {
        message = `Reset in ${minutes} minutes.`;
      } else {
        message = `Reset in ${seconds} seconds.`;
      }
    }
  }

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      const reset = decision.reason.resetTime;

      if (reset === undefined) {
        return Response.json(
          { message: "too many requests. Please try again later." },
          { status: 429, headers },
        );
      }

      // Calculate number of seconds between reset Date and now
      const seconds = Math.floor((reset.getTime() - Date.now()) / 1000);
      const minutes = Math.ceil(seconds / 60);

      if (minutes > 1) {
        return Response.json(
          {
            message: `too many requests. Please try again in ${minutes} minutes.`,
          },
          { status: 429, headers },
        );
      } else {
        return Response.json(
          {
            message: `too many requests. Please try again in ${seconds} seconds.`,
          },
          { status: 429, headers },
        );
      }
    } else {
      return Response.json({ message: "forbidden" }, { status: 403, headers });
    }
  } else if (decision.isErrored()) {
    console.error("Arcjet error:", decision.reason);
    if (decision.reason.message == "[unauthenticated] invalid key") {
      return Response.json(
        {
          message:
            "invalid Arcjet key. Is the ARCJET_KEY environment variable set?",
        },
        { status: 500, headers },
      );
    } else {
      return Response.json(
        { message: "internal server error" },
        { status: 500 },
      );
    }
  }

  return Response.json(
    { message: `HTTP 200: OK. ${remaining} requests remaining. ${message}` },
    { status: 200, headers },
  );
}

export default function Index() {
  // when the form is being processed on the server, this returns different
  // navigation states to help us build pending and optimistic UI.
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const user = data.user;

  return (
    <section className={styles.Content}>
      <div className={styles.Section}>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Arcjet rate limiting example
        </h1>
        <p className="max-w-[700px] text-lg">
          This page is protected by{" "}
          <Link
            to="https://docs.arcjet.com/bot-protection/concepts"
            className="font-bold decoration-1 underline-offset-2 hover:underline"
          >
            Arcjet&apos;s rate limiting
          </Link>
          .
        </p>
      </div>

      <Divider />

      <div className={styles.Section}>
        <h2 className="text-xl font-bold">Try it</h2>
        <Form method="post">
          <fieldset disabled={navigation.state === "submitting"}>
            {actionData && actionData.message ? (
              <p className="text-red-400">
                {actionData.message}
                <br />
                <br />
              </p>
            ) : null}

            <p>
              <Button type="submit">
                {navigation.state === "submitting"
                  ? "Submitting..."
                  : "Test rate limit"}
              </Button>
            </p>
          </fieldset>
        </Form>

        {user ? (
          <>
            <p className="text-green-500">
              You are authenticated as {user.email}
              <span className="text-secondary-foreground">
                {" "}
                - the limit is set to 5 requests every 60 seconds.
              </span>
            </p>
          </>
        ) : (
          <>
            <p className="text-red-400">
              You are not authenticated
              <span className="text-secondary-foreground">
                {" "}
                - the limit is set to 2 requests every 60 seconds.
              </span>
            </p>
          </>
        )}

        <p className="max-w-[700px] text-secondary-foreground">
          Rate limits can be dynamically adjusted e.g. to set a limit based on
          the authenticated user.
        </p>

        {user ? <Logout /> : <Login />}
      </div>

      <Divider />

      <div className={styles.Section}>
        <h2 className="text-xl font-bold">See the code</h2>
        <p className="text-secondary-foreground">
          The{" "}
          <Link
            to="https://github.com/arcjet/example-remix/blob/main/app/routes/rate-limit.tsx"
            target="_blank"
            rel="noreferrer"
            className="font-bold decoration-1 underline-offset-2 hover:underline"
          >
            API route
          </Link>{" "}
          imports a{" "}
          <Link
            to="https://github.com/arcjet/example-remix/blob/main/lib/arcjet.ts"
            target="_blank"
            rel="noreferrer"
            className="font-bold decoration-1 underline-offset-2 hover:underline"
          >
            centralized Arcjet client
          </Link>{" "}
          which sets base rules.
        </p>
      </div>

      <Divider />

      <WhatNext />
    </section>
  );
}
