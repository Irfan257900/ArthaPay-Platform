import React, { useEffect, useState } from "react";
import { LoadingOutlined } from '@ant-design/icons';
import tronIcon from "../images/tron.svg";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { useWalletModal } from "@tronweb3/tronwallet-adapter-react-ui";
import { Spin } from "antd";
import { TronWeb } from "tronweb";
// Map network to correct fullHost
function getFullHost(network) {
  switch (network.toLowerCase()) {
    case "mainnet":
      return "https://api.trongrid.io";
    case "shasta":
      return "https://api.shasta.trongrid.io";
    case "nile":
      return "https://nile.trongrid.io";
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}
async function verifySignature(messageToSign, signedMessage, expectedAddress, network) {
  try {
    const fullHost = getFullHost(network);
    const tronWeb = new TronWeb({ fullHost });
    // recover address from signature
    const recoveredAddress = await tronWeb.trx.verifyMessageV2(messageToSign, signedMessage);
    // ✅ compare recovered with expected address
    return recoveredAddress === expectedAddress;
  } catch (err) {
    console.error("Signature verification failed:", err);
    return false;
  }
}
function Sign({
  btnClassName = "buttonsClass",
  onError,
  setError,
  onSuccess,
  setSigningThrough,
  message,
  formData
}) {
  const {
    disconnect,
    select,
    wallet,
    connect,
    connecting,
    signMessage,
    address,
  } = useWallet();
  const { setVisible } = useWalletModal();
  const disconnectWallet = async () => {
    localStorage.removeItem("tronAdapterName");
    select(null);
    await disconnect();
  };
  const [network, setNetwork] = useState("mainnet"); // default
  useEffect(() => {
    if (wallet?.state === "Loading" && !wallet.adapter.connected) {
      // force reset selection if it’s stuck
      select(null);
    }
  }, []);
  useEffect(() => {
    async function detectNetwork() {
      try {
        if (window.tronWeb && window.tronWeb.ready) {
          const nodeHost = window.tronWeb.fullNode.host;
          if (nodeHost.includes("shasta")) {
            setNetwork("shasta");
          } else if (nodeHost.includes("nile")) {
            setNetwork("nile");
          } else {
            setNetwork("mainnet");
          }
        }
      } catch (e) {
        console.warn("Could not detect network, fallback mainnet:", e);
        setNetwork("mainnet");
      }
    }

    if (wallet?.adapter?.connected) {
      detectNetwork();
    }
  }, [wallet]);


  const connectAndSign = async () => {
    setError("");
    try {
      setSigningThrough && setSigningThrough('walletConnect');
      if (!wallet) {
        setVisible(true);
        return;
      }
      //  Check if TronLink is available
      if (wallet.adapter.readyState !== "Found") {
        throw new Error("TronLink extension not found. Please install TronLink.");
      }
      if (wallet.state === 'NotFound') {
        throw new Error("Wallet not found");
      }
      if (!wallet.adapter.connected || wallet.adapter.state === "Disconnected") {
        select(wallet.adapter.name);
        await connect();
        if (!wallet.adapter.connected) {
          throw new Error("Wallet not connected");
        }
      }
      // build message that user signs
      const messageToSign = `I am proving ownership of wallet: ${formData?.walletaddress}`;
      const signedMessage = await signMessage(messageToSign);
      const isValid = await verifySignature(messageToSign, signedMessage, formData?.walletaddress, network);
      if (!isValid) {
        throw new Error("Signature verification failed: wrong wallet signed");
      }
      // success
      onSuccess && onSuccess({ address, sign: signedMessage });
      await disconnectWallet();
    } catch (error) {
      onError && onError(error?.message || error?.toString());
      await disconnectWallet();
    }
  };

  const handleModal = (action) => {
    setVisible(action);
  };

  return (
    <>
      {!wallet && (
        <button className={btnClassName} onClick={() => handleModal(true)}>
          <div className='flex items-center gap-2'>
            <img src={tronIcon} alt={'Tron'} className='w-9' />
            <span>Tron Wallets</span>
          </div>
          {connecting && <span><Spin indicator={<LoadingOutlined spin />} size="small" /></span>}
        </button>
      )}
      {wallet && (
        <button
          type="plain"
          className={btnClassName}
          onClick={connectAndSign}
          disabled={connecting || wallet?.state === 'Loading'}
        >
          <div className='flex items-center gap-2'>
            <img
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              width={50}
              height={50}
            />
            <span>{wallet.adapter.name}</span>
            {(connecting || wallet?.state === 'Loading') && <span><Spin indicator={<LoadingOutlined spin />} size="small" /></span>}
          </div>
        </button>
      )}
    </>
  );
}

export default React.memo(Sign);