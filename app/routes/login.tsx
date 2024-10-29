import { Form, useNavigation } from "@remix-run/react";

export default function Login() {
  const navigation = useNavigation();
  return (
    <Form action="/auth/github" method="post">
      <button>
        {navigation.state === "submitting"
          ? "Logging in with GitHub..."
          : "Log in with GitHub"}
      </button>
    </Form>
  );
}
