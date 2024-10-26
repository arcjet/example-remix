import arcjet, { shield } from "@arcjet/remix";

export default arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["fingerprint"],
  rules: [shield({ mode: "LIVE" })],
});
