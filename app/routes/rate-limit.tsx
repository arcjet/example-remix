import { setRateLimitHeaders } from "@arcjet/decorate";
import { fixedWindow } from "@arcjet/remix";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import arcjet from "~/arcjet";
import { authenticator, User } from "~/services/auth.server";
import Login from "./login";
import Logout from "./logout";

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
        return json(
          { message: "too many requests. Please try again later." },
          { status: 429, headers },
        );
      }

      // Calculate number of seconds between reset Date and now
      const seconds = Math.floor((reset.getTime() - Date.now()) / 1000);
      const minutes = Math.ceil(seconds / 60);

      if (minutes > 1) {
        return json(
          {
            message: `too many requests. Please try again in ${minutes} minutes.`,
          },
          { status: 429, headers },
        );
      } else {
        return json(
          {
            message: `too many requests. Please try again in ${seconds} seconds.`,
          },
          { status: 429, headers },
        );
      }
    } else {
      return json({ message: "forbidden" }, { status: 403, headers });
    }
  } else if (decision.isErrored()) {
    console.error("Arcjet error:", decision.reason);
    if (decision.reason.message == "[unauthenticated] invalid key") {
      return json(
        {
          message:
            "invalid Arcjet key. Is the ARCJET_KEY environment variable set?",
        },
        { status: 500, headers },
      );
    } else {
      return json({ message: "internal server error" }, { status: 500 });
    }
  }

  return json(
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
    <div>
      {user ? (
        <div>
          <p>
            You are authenticated as {user.email}. Make a request using curl,
            which is considered an automated client:
          </p>
          <Logout />
        </div>
      ) : (
        <p>
          You are not logged in.
          <Login />
        </p>
      )}
      <Form method="post">
        <fieldset disabled={navigation.state === "submitting"}>
          {actionData && actionData.message ? (
            <p style={{ color: "red" }}>{actionData.message}</p>
          ) : null}

          <p>
            <button type="submit">
              {navigation.state === "submitting" ? "Submitting..." : "Submit"}
            </button>
          </p>
        </fieldset>
      </Form>
    </div>
  );
}
