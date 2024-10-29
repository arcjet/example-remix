"use client";

import { Link, NavLink } from "@remix-run/react";
import { Icons } from "~/components/icons";
import { ThemeToggle } from "~/components/theme-toggle";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import styles from "./SiteHeader.module.scss";

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  key: string;
}

const navItems = [
  { title: "Signup form protection", href: "/signup" },
  { title: "Bot protection", href: "/bots" },
  { title: "Rate limiting", href: "/rate-limit" },
  { title: "Attack protection", href: "/attack" },
  { title: "Sensitive info", href: "/sensitive-info" },
];

export function SiteHeader() {
  return (
    <header
      className={styles.SiteHeader + " sticky top-0 z-40 w-full bg-background"}
    >
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link to="/" className={styles.Logo}>
          <img
            className={styles.Image + " dark"}
            src="/static/brand/LogoLockupExploreDark+Title.svg"
            alt="Arcjet Example app"
            height={30}
            width={310}
          />
          <img
            className={styles.Image + " light"}
            src="/static/brand/LogoLockupExploreLight+Title.svg"
            alt="Arcjet Example app"
            height={30}
            width={310}
          />
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {navItems.length ? (
            <nav className="mt-[5px] flex gap-5">
              {navItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "text-md flex items-center px-1 font-bold",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )
                  }
                >
                  {item.title}
                </NavLink>
              ))}
            </nav>
          ) : null}

          <nav className="mt-[5px] flex items-center space-x-1">
            <Link
              to="https://github.com/arcjet/example-remix"
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                  }),
                  "w-9 px-0",
                )}
              >
                <Icons.gitHub className="size-4" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
