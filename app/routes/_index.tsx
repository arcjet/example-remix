import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import WhatNext from "~/components/compositions/WhatNext";
import Divider from "~/components/elements/Divider";
import { buttonVariants } from "~/components/ui/button";

import styles from "~/components/elements/PageShared.module.scss";

export const meta: MetaFunction = () => {
  return [
    { title: "Arcjet Remix example app" },
    {
      name: "description",
      content:
        "An example Remix application protected by Arcjet. Bot detection. Rate limiting. Email validation. Attack protection. Data redaction. A developer-first approach to security.",
    },
  ];
};

export default function Index() {
  return (
    <section className={styles.Content}>
      <div className={styles.Section}>
        <div className="flex max-w-[980px] flex-col items-start gap-6">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Arcjet Remix example app
          </h1>
          <p className="max-w-[700px] text-lg">
            <Link
              to="https://arcjet.com"
              target="_blank"
              rel="noreferrer"
              className="font-bold decoration-1 underline-offset-2 hover:underline"
            >
              Arcjet
            </Link>{" "}
            helps developers protect their apps in just a few lines of code. Bot
            detection. Rate limiting. Email validation. Attack protection. Data
            redaction. A developer-first approach to security.
          </p>
          <p className="max-w-[700px] text-secondary-foreground">
            This is an example Remix application using Arcjet. The code is{" "}
            <Link
              to="https://github.com/arcjet/example-remix"
              target="_blank"
              rel="noreferrer"
              className="font-bold decoration-1 underline-offset-2 hover:underline"
            >
              on GitHub
            </Link>
            .
          </p>
        </div>

        <div className="flex max-w-[980px] flex-col items-start gap-6 pt-8">
          <h2 className="text-xl font-bold">Examples</h2>
          <div className="flex gap-4">
            <Link
              to="/signup"
              className={buttonVariants({ variant: "default" })}
            >
              Signup form protection
            </Link>
            <Link to="/bots" className={buttonVariants({ variant: "default" })}>
              Bot protection
            </Link>
            <Link
              to="/rate-limiting"
              className={buttonVariants({ variant: "default" })}
            >
              Rate limiting
            </Link>
            <Link
              to="/attack"
              className={buttonVariants({ variant: "default" })}
            >
              Attack protection
            </Link>
            <Link
              to="/sensitive-info"
              className={buttonVariants({ variant: "default" })}
            >
              Sensitive info
            </Link>
          </div>
        </div>
      </div>

      <Divider />

      <WhatNext />
    </section>
  );
}
