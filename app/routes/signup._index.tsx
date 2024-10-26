import { protectSignup } from "@arcjet/remix";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, redirect, useActionData, useNavigation } from "@remix-run/react";
import arcjet from "~/arcjet";

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
      return json({ errors, values }, { status: 400 });
    } else if (decision.reason.isRateLimit()) {
      const reset = decision.reason.resetTime;

      if (reset === undefined) {
        const errors = { email: "too many requests. Please try again later." };
        return json({ errors, values }, { status: 429 });
      }

      // Calculate number of seconds between reset Date and now
      const seconds = Math.floor((reset.getTime() - Date.now()) / 1000);
      const minutes = Math.ceil(seconds / 60);

      if (minutes > 1) {
        const errors = {
          email: `too many requests. Please try again in ${minutes} minutes.`,
        };
        return json({ errors, values }, { status: 429 });
      } else {
        const errors = {
          email: `too many requests. Please try again in ${seconds} seconds.`,
        };
        return json({ errors, values }, { status: 429 });
      }
    } else {
      const errors = { email: "forbidden" };
      return json({ errors, values }, { status: 403 });
    }
  } else if (decision.isErrored()) {
    console.error("Arcjet error:", decision.reason);
    if (decision.reason.message == "[unauthenticated] invalid key") {
      const errors = {
        email:
          "invalid Arcjet key. Is the ARCJET_KEY environment variable set?",
      };
      return json({ errors, values: { email } }, { status: 500 });
    } else {
      const errors = { email: "internal server error" };
      return json({ errors, values: { email } }, { status: 500 });
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
    <Form method="post">
      <fieldset disabled={navigation.state === "submitting"}>
        <p>
          <label>
            Email:{" "}
            <input
              name="email"
              type="text"
              defaultValue={
                actionData ? actionData.values.email : "nonexistent@arcjet.ai"
              }
            />
          </label>
        </p>

        {actionData && actionData.errors.email ? (
          <p style={{ color: "red" }}>{actionData.errors.email}</p>
        ) : null}

        <p>
          <button type="submit">
            {navigation.state === "submitting" ? "Submitting..." : "Submit"}
          </button>
        </p>
      </fieldset>
    </Form>
  );
}
