import { sensitiveInfo } from "@arcjet/remix";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
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
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

import styles from "~/components/elements/PageShared.module.scss";

export const meta: MetaFunction = () => {
  return [
    { title: "Arcjet Remix sensitive info detection example" },
    {
      name: "description",
      content:
        "An example of Arcjet's sensitive info detection for Remix. Detect credit card numbers and other PII with Remix.",
    },
  ];
};

// Add rules to the base Arcjet instance outside of the handler function
const aj = arcjet.withRule(
  sensitiveInfo({
    mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
    deny: ["CREDIT_CARD_NUMBER"], // Deny requests with credit card numbers
  }),
);

export async function action(args: ActionFunctionArgs) {
  // We use a custom fingerprint elsewhere, but here we just use the IP
  const fingerprint = args.context.ip as string;
  const decision = await aj.protect(args, { fingerprint });

  const formData = await args.request.formData();
  const supportMessage = formData.get("supportMessage") as string;

  console.log("Arcjet decision: ", decision);

  if (decision.isDenied()) {
    const values = { supportMessage };

    if (decision.reason.isSensitiveInfo()) {
      const errors = {
        supportMessage: "please do not include credit card numbers.",
      };
      return json({ errors, values }, { status: 400 });
    } else {
      const errors = { supportMessage: "forbidden" };
      return json({ errors, values }, { status: 403 });
    }
  } else if (decision.isErrored()) {
    console.error("Arcjet error:", decision.reason);
    if (decision.reason.message == "[unauthenticated] invalid key") {
      const errors = {
        supportMessage:
          "invalid Arcjet key. Is the ARCJET_KEY environment variable set?",
      };
      return json({ errors, values: { supportMessage } }, { status: 500 });
    } else {
      const errors = { supportMessage: "internal server error" };
      return json({ errors, values: { supportMessage } }, { status: 500 });
    }
  }

  return redirect("/sensitive-info/submitted");
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
          Arcjet sensitive info detection example
        </h1>
        <p className="max-w-[700px] text-lg">
          This form uses{" "}
          <Link
            to="https://docs.arcjet.com/sensitive-info/concepts"
            className="font-bold decoration-1 underline-offset-2 hover:underline"
          >
            Arcjet&apos;s sensitive info detection
          </Link>{" "}
          feature which is configured to detect credit card numbers. It can be
          configured to detect other types of sensitive information and custom
          patterns.
        </p>
        <p className="max-w-[700px] text-secondary-foreground">
          The request is analyzed entirely on your server so no sensitive
          information is sent to Arcjet.
        </p>
      </div>

      <Divider />

      <div className={styles.Section}>
        <h2 className="text-xl font-bold">Try it</h2>

        <div className="flex gap-4">
          <Form method="post" className="space-y-8">
            <fieldset disabled={navigation.state === "submitting"}>
              <Label>Message</Label>
              <p>
                <Textarea
                  name="supportMessage"
                  className="h-24 w-80 resize-none"
                  defaultValue={
                    actionData
                      ? actionData.values.supportMessage
                      : "4111111111111111"
                  }
                />
              </p>
              <br />
              {actionData && actionData.errors.supportMessage ? (
                <p className="text-red-400">
                  We could not submit your message:{" "}
                  {actionData.errors.supportMessage}
                </p>
              ) : null}

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
      </div>

      <Divider />

      <div className={styles.Section}>
        <h2 className="text-xl font-bold">See the code</h2>
        <p className="text-secondary-foreground">
          The{" "}
          <Link
            to="https://github.com/arcjet/example-remix/blob/main/app/routes/sensitive-info._index.tsx"
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
