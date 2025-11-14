import React, { useMemo } from "react";
import { WalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks";
import {
  TronLinkAdapter,
  TokenPocketAdapter,
  BitKeepAdapter,
  OkxWalletAdapter,
  GateWalletAdapter,
  BybitWalletAdapter,
  WalletConnectAdapter,
} from "@tronweb3/tronwallet-adapters";
import "@tronweb3/tronwallet-adapter-react-ui/style.css";
import { WalletModalProvider } from "@tronweb3/tronwallet-adapter-react-ui";

function TronWallets({children}) {
  const adapters = useMemo(function () {
    const tronLink1 = new TronLinkAdapter();
    const walletConnect1 = new WalletConnectAdapter({
      network: "Nile",
      options: {
        relayUrl: "wss://relay.walletconnect.com",
        projectId: window.runtimeConfig.VITE_WEB3_WALLET_ID,
        metadata: {
          name: "Test DApp",
          description: "JustLend WalletConnect",
          url: "https://your-dapp-url.org/",
          icons: ["https://your-dapp-url.org/mainLogo.svg"],
        },
      },
      web3ModalConfig: {
        themeMode: "dark",
        themeVariables: {
          "--wcm-z-index": "9999",
        },
        enableExplorer: true,
        explorerRecommendedWalletIds: [
          "225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f",
          "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369",
          "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
        ],
      },
    });
    const tokenPocket = new TokenPocketAdapter();
    const bitKeep = new BitKeepAdapter();
    const okxWalletAdapter = new OkxWalletAdapter();
    const gateAdapter = new GateWalletAdapter();
    const bybitAdapter = new BybitWalletAdapter();
    return [
      tronLink1,
      walletConnect1,
      tokenPocket,
      bitKeep,
      okxWalletAdapter,
      gateAdapter,
      bybitAdapter,
    ];
  }, []);
  return (
    <WalletProvider
      adapters={adapters}
      autoConnect={false}
      disableAutoConnectOnLoad={true}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
}

export default React.memo(TronWallets);
