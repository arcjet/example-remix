import { protectSignup } from "@arcjet/remix";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import arcjet from "~/arcjet";
import WhatNext from "~/components/compositions/WhatNext";
import Divider from "~/components/elements/Divider";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import styles from "~/components/elements/PageShared.module.scss";

export const meta: MetaFunction = () => {
  return [
    { title: "Arcjet Remix signup form protection example" },
    {
      name: "description",
      content:
        "An example of Arcjet's signup form protection for Remix which includes email verification, rate limiting, and bot protection.",
    },
  ];
};

// Add rules to the base Arcjet instance outside of the handler function
const aj = arcjet.withRule(
  // Arcjet's protectSignup rule is a combination of email validation, bot
  // protection and rate limiting. Each of these can also be used separately
  // on other routes e.g. rate limiting on a login route. See
  // https://docs.arcjet.com/get-started
  protectSignup({
    email: {
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // Block emails that are disposable, invalid, or have no MX records
      block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    },
    bots: {
      mode: "LIVE",
      // configured with a list of bots to allow from
      // https://arcjet.com/bot-list
      allow: [], // prevents bots from submitting the form
    },
    // It would be unusual for a form to be submitted more than 5 times in 10
    // minutes from the same IP address
    rateLimit: {
      // uses a sliding window rate limit
      mode: "LIVE",
      interval: "2m", // counts requests over a 10 minute sliding window
      max: 5, // allows 5 submissions within the window
    },
  }),
);

export async function action(args: ActionFunctionArgs) {
  const formData = await args.request.formData();
  const email = formData.get("email") as string;

  // We use a custom fingerprint elsewhere, but here we just use the IP
  const fingerprint = args.context.ip as string;
  const decision = await aj.protect(args, { email, fingerprint });

  console.log("Arcjet decision: ", decision);

  if (decision.isDenied()) {
    const values = { email };

    if (decision.reason.isEmail()) {
      let message: string;

      // These are specific errors to help the user, but will also reveal the
      // validation to a spammer.
      if (decision.reason.emailTypes.includes("INVALID")) {
        message = "email address format is invalid. Is there a typo?";
      } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
        message = "we do not allow disposable email addresses.";
      } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
        message =
          "your email domain does not have an MX record. Is there a typo?";
      } else {
        // This is a catch all, but the above should be exhaustive based on the
        // configured rules.
        message = "invalid email.";
      }

      if (decision.ip.hasCountry()) {
        message += ` PS: Hello to you in ${decision.ip.countryName}!`;
      }

      const errors = { email: message };
      return Response.json({ errors, values }, { status: 400 });
    } else if (decision.reason.isRateLimit()) {
      const reset = decision.reason.resetTime;

      if (reset === undefined) {
        const errors = { email: "too many requests. Please try again later." };
        return Response.json({ errors, values }, { status: 429 });
      }

      // Calculate number of seconds between reset Date and now
      const seconds = Math.floor((reset.getTime() - Date.now()) / 1000);
      const minutes = Math.ceil(seconds / 60);

      if (minutes > 1) {
        const errors = {
          email: `too many requests. Please try again in ${minutes} minutes.`,
        };
        return Response.json({ errors, values }, { status: 429 });
      } else {
        const errors = {
          email: `too many requests. Please try again in ${seconds} seconds.`,
        };
        return Response.json({ errors, values }, { status: 429 });
      }
    } else {
      const errors = { email: "forbidden" };
      return Response.json({ errors, values }, { status: 403 });
    }
  } else if (decision.isErrored()) {
    console.error("Arcjet error:", decision.reason);
    if (decision.reason.message == "[unauthenticated] invalid key") {
      const errors = {
        email:
          "invalid Arcjet key. Is the ARCJET_KEY environment variable set?",
      };
      return Response.json({ errors, values: { email } }, { status: 500 });
    } else {
      const errors = { email: "internal server error" };
      return Response.json({ errors, values: { email } }, { status: 500 });
    }
  }

  return redirect("/signup/submitted");
}

export default function Index() {
  // when the form is being processed on the server, this returns different
  // navigation states to help us build pending and optimistic UI.
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  return (
    <section className={styles.Content}>
      <div className={styles.Section}>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Arcjet signup form protection
        </h1>
        <p className="max-w-[700px] text-lg">
          This form uses{" "}
          <Link
            to="https://docs.arcjet.com/signup-protection/concepts"
            className="font-bold decoration-1 underline-offset-2 hover:underline"
          >
            Arcjet&apos;s signup form protection
          </Link>{" "}
          which includes:
        </p>
        <ul className="ms-8 max-w-[700px] list-outside list-disc text-secondary-foreground">
          <li className="text-lg">
            Arcjet server-side email verification configured to block disposable
            providers and ensure that the domain has a valid MX record.
          </li>
          <li className="pt-4 text-lg">
            Rate limiting set to 5 requests over a 2 minute sliding window - a
            reasonable limit for a signup form, but easily configurable.
          </li>
          <li className="pt-4 text-lg">
            Bot protection to stop automated clients from submitting the form.
          </li>
        </ul>
      </div>

      <Divider />

      <div className={styles.Section}>
        <h2 className="text-xl font-bold">Try it</h2>

        <div className="flex gap-4">
          <Form method="post" className="space-y-8">
            <fieldset disabled={navigation.state === "submitting"}>
              <Label>Email:</Label>
              <p>
                <Input
                  name="email"
                  type="text"
                  defaultValue={
                    actionData
                      ? actionData.values.email
                      : "nonexistent@arcjet.ai"
                  }
                />
              </p>

              {actionData && actionData.errors.email ? (
                <p className="text-red-400">
                  We couldn&apos;t sign you up: {actionData.errors.email}
                </p>
              ) : null}

              <br />
              <p>
                <Button type="submit">
                  {navigation.state === "submitting"
                    ? "Submitting..."
                    : "Submit"}
                </Button>
              </p>
            </fieldset>
          </Form>
        </div>

        <h2 className="text-xl font-bold">Test emails</h2>
        <p className="text-secondary-foreground">
          Try these emails to see how it works:
        </p>
        <ul className="ms-8 list-outside list-disc">
          <li className="text-muted-foreground">
            <code className="text-secondary-foreground">invalid.@arcjet</code> -
            is an invalid email address.
          </li>
          <li className="pt-2 text-muted-foreground">
            <code className="text-secondary-foreground">
              test@0zc7eznv3rsiswlohu.tk
            </code>{" "}
            - is from a disposable email provider.
          </li>
          <li className="pt-2 text-muted-foreground">
            <code className="text-secondary-foreground">
              nonexistent@arcjet.ai
            </code>{" "}
            - is a valid email address & domain, but has no MX records.
          </li>
        </ul>
      </div>

      <Divider />

      <div className={styles.Section}>
        <h2 className="text-xl font-bold">See the code</h2>
        <p className="text-secondary-foreground">
          The{" "}
          <Link
            to="https://github.com/arcjet/example-remix/blob/main/app/routes/signup._index.tsx"
            target="_blank"
            rel="noreferrer"
            className="font-bold decoration-1 underline-offset-2 hover:underline"
          >
            API route
          </Link>{" "}
          imports a{" "}
          <Link
            to="https://github.com/arcjet/example-remix/blob/main/app/arcjet.ts"
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
