import {Trx} from 'tronweb';
const verifyTrxSign = async (message, signature, address) => {   
    const recoveredAddress = Trx.verifyMessageV2(message, signature);
    return (recoveredAddress?.toLowerCase() === address?.toLowerCase())
};

export default verifyTrxSign;