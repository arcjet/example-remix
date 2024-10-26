import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import arcjet from "~/arcjet";

export async function loader(args: LoaderFunctionArgs) {
  // We use a custom fingerprint elsewhere, but here we just use the IP
  const fingerprint = args.context.ip as string;
  // The Shield rule has already been added in the root Arcjet instance. Shield
  // detects suspicious behavior, such as SQL injection and cross-site scripting
  // attacks.
  const decision = await arcjet.protect(args, { fingerprint });
  console.log("Arcjet decision: ", decision);

  if (decision.isDenied() && decision.reason.isShield()) {
    return json({ message: "Forbidden" }, { status: 403 });
  } else if (decision.isErrored()) {
    console.error("Arcjet error:", decision.reason);

    if (decision.reason.message == "[unauthenticated] invalid key") {
      return json(
        {
          message:
            "Invalid Arcjet key. Is the ARCJET_KEY environment variable set?",
        },
        { status: 500 },
      );
    } else {
      return json(
        { message: "Internal server error: " + decision.reason.message },
        { status: 500 },
      );
    }
  }

  return json({ message: "Hello, world!" }, { status: 200 });
}
