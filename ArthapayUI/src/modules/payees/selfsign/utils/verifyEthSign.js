import { verifyMessage } from "ethers";

const verifyEthSign = (message, sign, signerAddress) => {
    const recoveredAddress = verifyMessage(message, sign);
    return (recoveredAddress.toLowerCase() === signerAddress.toLowerCase())
};

export default verifyEthSign