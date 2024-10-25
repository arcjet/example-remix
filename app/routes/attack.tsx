import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  return { url };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const url = data.url;

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Arcjet bot protection example!
          </h1>
        </header>
        <div>
          <p>Make a request using curl</p>
          <code>
            curl -v -H &quote;x-arcjet-suspicious: true&quote; {url.href}/test
          </code>
        </div>
      </div>
    </div>
  );
}
