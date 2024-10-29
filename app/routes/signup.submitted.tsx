import WhatNext from "~/components/compositions/WhatNext";
import Divider from "~/components/elements/Divider";

import styles from "~/components/elements/PageShared.module.scss";

export default function Index() {
  return (
    <section className={styles.Content}>
      <div className={styles.Section}>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Form submitted
        </h1>
        <p className="max-w-[700px] text-lg">
          If this were a real form, your message would have been submitted.
        </p>
      </div>

      <Divider />

      <WhatNext />
    </section>
  );
}
