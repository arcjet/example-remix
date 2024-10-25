import { detectBot, fixedWindow } from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import arcjet from "~/arcjet";

// Add rules to the base Arcjet instance outside of the handler function
const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // configured with a list of bots to allow from
      // https://arcjet.com/bot-list
      allow: [], // blocks all automated clients
    }),
  )
  // You can chain multiple rules, so we'll include a rate limit
  .withRule(
    fixedWindow({
      mode: "LIVE",
      max: 100,
      window: "60s",
    }),
  );

export async function loader(args: LoaderFunctionArgs) {
  const decision = await aj.protect(args);
  console.log("Arcjet decision: ", decision);

  // Use the IP analysis to customize the response based on the country
  if (decision.ip.hasCountry() && decision.ip.country == "JP") {
    return json({ message: "Konnichiwa!" }, { status: 200 });
  }

  // Always deny requests from VPNs
  if (decision.ip.isVpn()) {
    return json({ message: "VPNs are forbidden" }, { status: 403 });
  }

  if (decision.isDenied() && decision.reason.isBot()) {
    return json({ message: "Bots are forbidden" }, { status: 403 });
  } else if (decision.isDenied() && decision.reason.isRateLimit()) {
    return json({ message: "Too many requests" }, { status: 429 });
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
