import {verify} from 'bitcoinjs-message';
const verifyBtcSign = (message, signature, address) => {
    const verified = verify(message, address, signature,null,true);
    return verified || false
};
export default verifyBtcSign