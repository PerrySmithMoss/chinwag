import "../styles/globals.css";
import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";
import React, { useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { UserContextProvider } from "../contexts/user-context";
import { AppContextProvider } from "../contexts/global.context";

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Hydrate state={pageProps.dehydratedState}>
        <AppContextProvider>
          <UserContextProvider>
            <Component {...pageProps} />
          </UserContextProvider>
        </AppContextProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}
export default MyApp;
