import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import WhatNext from "~/components/compositions/WhatNext";
import Divider from "~/components/elements/Divider";

import styles from "~/components/elements/PageShared.module.scss";

export const meta: MetaFunction = () => {
  return [
    { title: "Arcjet Remix attack protection example" },
    {
      name: "description",
      content:
        "An example of Arcjet's attack protection for Remix. Protect Remix against SQL injection, cross-site scripting, and other attacks.",
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get the URL to use in the example curl command
  const url = new URL(request.url);
  return { url };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const url = data.url;

  return (
    <section className={styles.Content}>
      <div className={styles.Section}>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Arcjet attack protection example
        </h1>
        <p className="max-w-[700px] text-lg">
          This page is protected by{" "}
          <Link
            to="https://docs.arcjet.com/shield/concepts"
            className="font-bold decoration-1 underline-offset-2 hover:underline"
          >
            Arcjet Shield
          </Link>
          .
        </p>
        <p className="max-w-[700px] text-lg text-secondary-foreground">
          Once a certain suspicion threshold is reached, subsequent requests
          from that client are blocked for a period of time. Shield detects{" "}
          <Link
            to={
              "https://docs.arcjet.com/shield/concepts#which-attacks-will-arcjet-shield-block"
            }
            className="font-bold decoration-1 underline-offset-2 hover:underline"
          >
            suspicious behavior
          </Link>
          , such as SQL injection and cross-site scripting attacks.
        </p>
      </div>

      <Divider />

      <div className={styles.Section}>
        <h2 className="text-xl font-bold">Try it</h2>
        <p className="text-secondary-foreground">
          Simulate an attack using <code>curl</code>:
        </p>
        <pre className="p-4">
          curl -v -H &quot;x-arcjet-suspicious: true&quot; {url.href}/test
        </pre>
        <p className="max-w-[700px] text-secondary-foreground">
          After the 5th request, your IP will be blocked for 15 minutes.
          Suspicious requests must meet a threshold before they are blocked to
          avoid false positives.
        </p>
        <p className="max-w-[700px] text-secondary-foreground">
          Shield can also be installed in middleware to protect your entire
          site.
        </p>
      </div>

      <Divider />

      <div className={styles.Section}>
        <h2 className="text-xl font-bold">See the code</h2>
        <p className="text-secondary-foreground">
          The{" "}
          <Link
            to="https://github.com/arcjet/example-remix/blob/main/app/routes/attack.test/route.tsx"
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
