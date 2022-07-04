import "../styles/globals.css";
import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";
import React, { useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { UserContextProvider } from "../context/user-context";
import { AppContextProvider } from "../context/global.context";

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Hydrate state={pageProps.dehydratedState}>
        <AppContextProvider>
          {/* <SocketProvider id={id}> */}
          <UserContextProvider>
            <Component {...pageProps} />
          </UserContextProvider>
          {/* </SocketProvider> */}
        </AppContextProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}
export default MyApp;
