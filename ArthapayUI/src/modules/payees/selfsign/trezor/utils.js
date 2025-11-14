import TrezorConnect from "@trezor/connect-web";
export const checkDeviceConnection = async () => {
    try {
      const response = await TrezorConnect.getDeviceState();
      if (response.success) {
        console.log('Device is connected and initialized:');
        return response.payload;
      } else {
        console.log('No Trezor device connected.');
        return null;
      }
    } catch (error) {
      console.error('Error checking device connection:', error);
      return null;
    }
  };


export const checkDeviceInitialization = async () => {
    try {
      const response = await TrezorConnect.getFeatures();
      if (response.success) {
        console.log('Device is initialized and features retrieved:', response.payload);
        return response.payload;
      } else {
        console.log('Device is not initialized or not ready.');
        return null;
      }
    } catch (error) {
      console.error('Error checking device initialization:', error);
      return null;
    }
  };
  