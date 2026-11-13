import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Login } from "../Icons/Login";

interface AuthLayoutProps {
  children: ReactNode;
  accountPrompt: string;
  accountLink: string;
  accountLinkText: string;
}

export function AuthLayout({
  children,
  accountPrompt,
  accountLink,
  accountLinkText,
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-dvh flex-col antialiased lg:grid lg:grid-cols-2">
      <aside className="flex shrink-0 flex-col bg-tan-background px-6 py-5 sm:px-10 lg:min-h-dvh lg:p-10">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/images/logo.png"
            height={50}
            width={50}
            alt=""
            priority
          />
          <span className="text-2xl font-bold text-brand-green">Chinwag</span>
        </div>
        <div className="hidden flex-1 flex-col items-center justify-center gap-8 py-12 lg:flex">
          <div className="w-full max-w-lg" aria-hidden="true">
            <Login width="100%" />
          </div>
          <p className="max-w-md text-center text-3xl font-bold text-white">
            Chat with anyone, anywhere.
          </p>
        </div>
      </aside>
      <section
        aria-labelledby="auth-heading"
        className="flex min-w-0 flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-12"
      >
        <div className="w-full max-w-md">
          <h1 id="auth-heading" className="text-3xl font-bold">
            Chat Now.
          </h1>
          <p className="mt-2 flex flex-wrap gap-x-1 text-sm text-gray-500">
            <span>{accountPrompt}</span>
            <Link
              href={accountLink}
              className="font-bold text-tan-background-accent hover:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {accountLinkText}
            </Link>
          </p>
          {children}
        </div>
      </section>
    </main>
  );
}
