import React from "react";
import { WagmiProvider } from "wagmi";
import { wagmiAdapter } from "./config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const Wagmi = ({children}) => {
  const queryClient = new QueryClient();
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Wagmi;
