import TrezorConnect from '@trezor/connect-web';
let isInitialized = false;
const setupTrezorConnect = () => {
    if (isInitialized) return;
    try {
        TrezorConnect.init({
            manifest: {
                email: window.runtimeConfig.VITE_TREZOR_EMAIL,
                appUrl: window.runtimeConfig.VITE_APP_URL
            }
        });
    } catch (error) {
        console.log(error)
    }
    isInitialized = true;
    TrezorConnect.on('connected', () => {
        console.log('Trezor device connected');
    });

    TrezorConnect.on('disconnected', () => {
        console.log('Trezor device disconnected');
    });
};

export default setupTrezorConnect;
