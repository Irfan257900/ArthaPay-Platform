import React from 'react';
import 'core-js/actual';
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import ledger from '../images/ledger-white.svg';
const EthPromise = import('@ledgerhq/hw-app-eth');
const BtcPromise = import('@ledgerhq/hw-app-btc');
const TrxPromise = import('@ledgerhq/hw-app-trx');
const errorMapping = (error, helpers) => {
    if (error.includes('0x5515')) {
        return 'Please unlock your device and try again!'
    }
    if (error.includes('0x6d02')) {
        return `Please open the ${helpers.appName || 'Ethereum'} app in your Ledger and try again!`
    }
    if (error.includes('0x5501') || error.includes('0x6985')) {
        return `User rejected the request!`
    }
    if (error.includes('0x6e00') || error.includes('CLA_NOT_SUPPORTED') || error.includes('INS_NOT_SUPPORTED') || error.includes('0x6d00')) {
        return `Please close any other apps on your Ledger device!`
    }
    if (error.includes('Failed to execute \'requestDevice\' on \'USB\'')) {
        return `Access denied to use Ledger device!`
    }
    return error
}
const toHexString = (bytes) => {
    return Array.from(bytes)
        .map(byte => byte?.toString(16).padStart(2, '0'))
        .join('');
};
const appMapping = {
    'eth': {
        name: 'Ethereum',
        signMessage: 'signPersonalMessage',
        getAccount: 'getAddress',
        accountPaths: { default: "44'/60'/0'/0/0", hexadecimal: "44'/60'/0'/0/0" },
        addressField: 'address',
        import: EthPromise,
        handleSignature: (signature) => {
            return "0x" + signature.r + signature.s + signature.v.toString(16).padStart(2, '0');
        },
        handleMessage:(message,encoder)=>{
            const messageUint8Array = encoder.encode(message);
            return toHexString(messageUint8Array);
        }
    },
    'btc': {
        name: 'Bitcoin',
        signMessage: 'signMessage',
        getAccount: 'getWalletPublicKey',
        accountPaths: {
            default: "m/84'/0'/0'/0/0",
            p2pkh: "m/44'/0'/0'/0/0",  // Legacy (P2PKH) path
            p2sh: "m/49'/0'/0'/0/0",   // Pay-to-Script-Hash (P2SH) path
            bech32: "m/84'/0'/0'/0/0", // Native SegWit (Bech32) path
            bech32m: "m/86'/0'/0'/0/0" // Taproot (Bech32m) path
        },
        formats:{
            p2pkh:'legacy',
            default:'bech32'
        },
        addressField: 'bitcoinAddress',
        import: BtcPromise,
        handleSignature: (signature,) => {
            const v = signature['v'] + 27 + 4;
            return Buffer.from(v.toString(16) + signature['r'] + signature['s'], 'hex').toString('base64');
        },
        handleMessage:(message,encoder)=>{
            const messageUint8Array = encoder.encode(message);
            return toHexString(messageUint8Array);
        }
    },
    'trx': {
        name: 'Tron',
        signMessage: 'signPersonalMessage',
        getAccount: 'getAddress',
        accountPaths: {
            default: "m/44'/195'/0'/0/0",
            base58: "m/44'/195'/0'/0/0", // Base58 (starts with 'T')
            hex: "m/44'/195'/0'/0/0"     // Hexadecimal (starts with '41')
        },
        addressField: 'address',
        import: TrxPromise,
        handleSignature: (signature) => {
            return signature
        },
        handleMessage:(message,encoder)=>{
            const messageUint8Array = encoder.encode(message);
            return toHexString(messageUint8Array);
        }
    }
}
const getTransportApp = async (app, transport) => {
    const { import: importApp } = app ? appMapping[app] : {};
    if (importApp) {
        const AppModule = await importApp;
        switch (app) {
            case 'eth': return new AppModule.default(transport);
            case 'btc': return new AppModule.default({ transport });
            case 'trx': return new AppModule.default(transport);
            default: return;
        }
    }
}

const Ledger = ({ asset, addressFormat, btnClassName = 'buttonsClass', onSuccess, onError, message, setSigningThrough, setError }) => {
    const getSign = async () => {
        setError('')
        setSigningThrough('ledger')
        try {
            if (!appMapping[asset]) {
                onError('Unsupported Asset!');
                return;
            }
            const transport = await TransportWebUSB.create();
            const tranportApp = await getTransportApp(asset, transport);
            const { getAccount, signMessage, accountPaths, addressField, handleSignature,handleMessage } = appMapping[asset]
            const encoder = new TextEncoder();
            const messageToBeSigned=handleMessage(message,encoder)
            const path = accountPaths[addressFormat] || accountPaths['default']
            const params = [path, messageToBeSigned]
            const signature = await tranportApp[signMessage](...params);
            const signedHash = handleSignature(signature)
            const response = asset !== 'btc' ? await tranportApp[getAccount](path) : await tranportApp[getAccount](path, { format: appMapping['btc']['formats'][addressFormat] || addressFormat });
            onSuccess?.({ address: response[addressField], sign: signedHash })
            if (transport) {
                await transport.close()
            }
        } catch (error) {
            const err = errorMapping(error.message || JSON.stringify(error), { appName: appMapping[asset].name });
            onError?.(err?.toString())
        }
    }
    return (
        <button className={btnClassName} onClick={() => getSign()}><img src={ledger} alt='Ledger' className='' /></button>
    )
}

export default Ledger