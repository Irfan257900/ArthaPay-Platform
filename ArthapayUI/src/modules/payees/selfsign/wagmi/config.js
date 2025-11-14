import { createAppKit } from '@reown/appkit/react'
import { mainnet, polygon } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import walletConnectIcon from '../images/wallet-connect-white.svg';
const projectId = window.runtimeConfig.VITE_WEB3_WALLET_ID
const metadata = {
  name: 'Artha pay',
  description: 'Artha pay self signature service',
  url: window.runtimeConfig.VITE_APP_URL,
  icons: [walletConnectIcon]
}

export const wagmiNetworks = [mainnet, polygon]
export const wagmiAdapter = new WagmiAdapter({
  networks: wagmiNetworks,
  projectId,
  ssr:false
})


createAppKit({
  adapters: [wagmiAdapter],
  networks: wagmiNetworks,
  projectId,
  metadata,
  features: {
    analytics: false,
    socials: [],
    email: false
  },
  themeMode: 'dark',
  themeVariables: {
    "--w3m-z-index": 1999,
  }
})
