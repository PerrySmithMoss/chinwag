import "../styles/globals.css";
import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";
import React, { useState } from "react";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { UserContextProvider } from "../context/user-context";
import { AppContextProvider } from "../context/global.context";

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <AppContextProvider>
          <UserContextProvider>
            <Component {...pageProps} />
          </UserContextProvider>
        </AppContextProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
export default MyApp;
