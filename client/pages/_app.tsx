import "../styles/globals.css";
import type { AppProps } from "next/app";
import React, { useState } from "react";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { UserContextProvider } from "../context/user-context";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <UserContextProvider>
          <Component {...pageProps} />
        </UserContextProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
