import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import walletconnect from '../images/wallet-connect-white.svg';
import { useAppKit, useAppKitState } from '@reown/appkit/react'
import { ethers } from "ethers";

const Sign = ({
  btnClassName = "buttonsClass",
  onSuccess,
  onError,
  setSigningThrough,
  message,
  setError,
  imageClass='',
  formData
}) => {
  const { open } = useAppKit();
  const { address, isConnected, connector } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { open: isOpen } = useAppKitState();
  const { disconnect } = useDisconnect();

async function verifyEvmSignature(messageToSign, signedMessage, expectedAddress) {
  try {
    const recoveredAddress = ethers.verifyMessage(messageToSign, signedMessage);

    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (err) {
    return false;
  }
}

  const getSign = async () => {
    setError("");
    try {
      if (!isConnected) {
        open({ view: "Connect" });
        return;
      }
      setSigningThrough("walletConnect");
      const sign = await signMessageAsync({
        account: address,
        message: `${message}`,
      });

      const isValid = await verifyEvmSignature(message, sign, formData?.walletaddress);

      if (!isValid) {
        throw new Error("Signature verification failed: wrong wallet signed");
      }

      onSuccess?.({ address: address, sign });
    } catch (error) {
      disconnect({ connector });
      onError?.(error?.message || "An unknown signing error occurred.") 
    }
  };
  return (
    <button className={btnClassName} onClick={() => getSign()}>
      {isOpen ? "Connecting..." :  <img className={imageClass} src={walletconnect} alt={"Wallet Connect"} />}
    </button>
  );
};

export default Sign;