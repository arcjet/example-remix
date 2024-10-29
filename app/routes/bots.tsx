import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import WhatNext from "~/components/compositions/WhatNext";
import Divider from "~/components/elements/Divider";

import styles from "~/components/elements/PageShared.module.scss";

export const meta: MetaFunction = () => {
  return [
    { title: "Arcjet Remix bot protection example" },
    {
      name: "description",
      content: "An example of Arcjet's bot protection for Remix.",
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
          Arcjet bot protection example
        </h1>
        <p className="max-w-[700px] text-lg">
          This page is protected by{" "}
          <Link
            to="https://docs.arcjet.com/bot-protection/concepts"
            className="font-bold decoration-1 underline-offset-2 hover:underline"
          >
            Arcjet&apos;s bot protection
          </Link>{" "}
          configured to block automated clients.
        </p>
      </div>

      <Divider />

      <div className={styles.Section}>
        <h2 className="text-xl font-bold">Try it</h2>
        <p className="text-secondary-foreground">
          Make a request using <code>curl</code>, which is considered an
          automated client:
        </p>
        <pre className="p-4">curl -v {url.href}/test</pre>
        <p className="text-secondary-foreground">
          Your IP will be blocked for 60 seconds.
        </p>
        <p className="max-w-[700px] text-secondary-foreground">
          Bot protection can also be installed in middleware to protect your
          entire site.
        </p>
      </div>

      <Divider />

      <div className={styles.Section}>
        <h2 className="text-xl font-bold">See the code</h2>
        <p className="text-secondary-foreground">
          The{" "}
          <Link
            to="https://github.com/arcjet/example-remix/blob/main/app/routes/bots.test/route.tsx"
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
