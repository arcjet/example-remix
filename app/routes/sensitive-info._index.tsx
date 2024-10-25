import { sensitiveInfo } from "@arcjet/remix";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, redirect, useActionData, useNavigation } from "@remix-run/react";
import arcjet from "~/arcjet";

// Add rules to the base Arcjet instance outside of the handler function
const aj = arcjet.withRule(
  sensitiveInfo({
    mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
    deny: ["CREDIT_CARD_NUMBER"], // Deny requests with credit card numbers
  }),
);

export async function action(args: ActionFunctionArgs) {
  const decision = await aj.protect(args);

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
    <Form method="post">
      <fieldset disabled={navigation.state === "submitting"}>
        <p>
          <label>
            Message:{" "}
            <textarea
              name="supportMessage"
              defaultValue={
                actionData
                  ? actionData.values.supportMessage
                  : "4111111111111111"
              }
            />
          </label>
        </p>

        {actionData && actionData.errors.supportMessage ? (
          <p style={{ color: "red" }}>
            We could not submit your message: {actionData.errors.supportMessage}
          </p>
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
