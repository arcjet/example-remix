import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { authenticator } from "~/services/auth.server";

export async function loader() {
  return redirect("/login");
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticator.logout(request, { redirectTo: "/rate-limit" });
}

export default function Logout() {
  return (
    <Form action="/logout" method="post">
      <Button variant={"outline"}>Sign out</Button>
    </Form>
  );
}
