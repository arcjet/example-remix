import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Arcjet Remix Example
          </h1>
        </header>
        <nav>
          <ul>
            <li>
              <Link to="/signup">Signup form protection</Link>
            </li>
            <li>
              <Link to="/bots">Bots protection</Link>
            </li>
            <li>
              <Link to="/sensitive-info">Sensitive info</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
