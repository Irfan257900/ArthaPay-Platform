import React, { useEffect } from 'react';
import TrezorConnect from '@trezor/connect-web';
import setupTrezorConnect from './config';
import trezor from '../images/trezor-white.svg';
const appConfig = {
    'eth': {
        signMessage: TrezorConnect.ethereumSignMessage,
        getAddress: TrezorConnect.ethereumGetAddress,
        paths:{default:"m/44'/60'/0'/0/0",hexadecimal:"m/44'/60'/0'/0/0"} ,
        coinName: ''
    },
    'btc': {
        signMessage: TrezorConnect.signMessage,
        getAddress: TrezorConnect.getAddress,
        paths: {
            default:"m/84'/0'/0'/0/0",
            p2pkh: "m/44'/0'/0'/0/0",  // Legacy (P2PKH) path
            p2sh: "m/49'/0'/0'/0/0",   // Pay-to-Script-Hash (P2SH) path
            bech32: "m/84'/0'/0'/0/0", // Native SegWit (Bech32) path
            bech32m: "m/86'/0'/0'/0/0" // Taproot (Bech32m) path
        },
        coinName: 'Bitcoin'
    }
}
const Trezor = ({ asset,addressFormat, message, btnClassName = 'buttonsClass', onSuccess, onError, setSigningThrough, setError }) => {
    useEffect(() => {
        setupTrezorConnect()
    }, []);
    const handleSignMessage = async () => {
        setError('')
        setSigningThrough('trezor');
        try {
            if (!appConfig[asset]) {
                onError('Unsupported Asset!');
                return;
            }
            const { signMessage, paths } = appConfig[asset]
            const response = await signMessage?.({
                path: paths[addressFormat] || paths['default'],
                message
            });

            if (response.success) {
                onSuccess?.({
                    address: response.payload.address,
                    sign: response.payload.signature
                })
                TrezorConnect.dispose();
            } else {
                onError?.(`${response.payload.error}`)
            }
        } catch (error) {
            onError?.(error.message || error)
        }
    };
    return (
        <button className={btnClassName || ''} onClick={handleSignMessage}> <img src={trezor} alt='Trezor' /> </button>
    );
}

export default Trezor
