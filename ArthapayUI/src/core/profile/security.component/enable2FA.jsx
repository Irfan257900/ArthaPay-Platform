import { Alert, Typography } from "antd";
import { QRCodeSVG } from "qrcode.react";
import CopyToClipboard from "react-copy-to-clipboard";
import { getTwoFactor } from "../http.services";
import { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import CustomButton from "../../button/button";
import SecurityCode from "../../skeleton/securityCode";
const { Text } = Typography;
const Enable2FA = ({ userConfig, isCloseDrawer }) => {
    const [secretKey, setSecretKey] = useState(null)
    const [otpAuthUrl, setOtpAuthUrl] = useState('');
    const [errorMsg, setErrorMsg] = useState(null)
    const [loader, setLoader] = useState(false)
    useEffect(() => {
        if(userConfig?.id){
            fetchSecret()
        }
    }, [])
    const setTwoFactor = (response) => {
        setOtpAuthUrl(response);
        const queryParams = new URLSearchParams(response?.split('?')[1]);
        setSecretKey(queryParams.get('secret'));
    }
    const fetchSecret = async () => {
        await getTwoFactor(setTwoFactor, setErrorMsg, setLoader)
    };

    const closeErrorHandler = useCallback(() => {
        setErrorMsg(null)
    }, [])
    const closeDrawerHandler = useCallback(() => {
        isCloseDrawer(false, true)
    }, [])
    return (
        <>
            {loader && <SecurityCode />}
            {!loader && <div>
                {errorMsg !== null && (<div className="alert-flex !w-auto mb-24 !mx-3">
                    <Alert
                        className="mb-3 security-error"
                        closable
                        type="error"
                        description={errorMsg}
                        onClose={closeErrorHandler}
                        showIcon
                    />
                </div>)}
                {(secretKey) &&
                    <div className="cust-qr text-center mt-4" >
                        <QRCodeSVG value={otpAuthUrl} className="qr-image m-auto" />
                        {secretKey && <div><CopyToClipboard text={secretKey} value={secretKey} options={{ format: 'text/plain' }} className="bg-menuhover text-lightWhite rounded-5 px-3 py-2 border border-StrokeColor flex gap-3 items-center border-dashed mb-4 mt-3 w-[220px] mx-auto justify-center"><Text copyable={{ tooltips: ['Copy', 'Copied'] }} className="copy-text m-0">{secretKey || '--'}</Text></CopyToClipboard></div>}
                        <div className="mt-4 px-4 text-left text-sm text-neutral-600">
                            <p>
                                To enable Two-Factor Authentication (2FA), please follow the steps below:
                            </p>
                            <ol className="list-decimal list-inside mt-2 space-y-1 !text-paraColor">
                                <li className="!text-paraColor">Open your preferred authenticator app (Google Authenticator, Authy, etc.).</li>
                                <li className="!text-paraColor">Tap on the "+" icon or "Add Account".</li>
                                <li className="!text-paraColor">Scan the QR code shown above with your app.</li>
                                <li className="!text-paraColor">Once scanned, a 6-digit code will be generated in your app.</li>
                                <li className="!text-paraColor">Make sure to save this account in your app securely.</li>
                                <li className="!text-paraColor">If you click the save button without scanning or saving the QR code, you won't be able to access it again.</li>
                            </ol>

                            <p className="mt-2">
                                Alternatively, you can manually enter the secret key shown above in your authenticator app.
                            </p>
                        </div>
                    </div>
                }
                <div className='text-right mt-9 mobile-btns-clum'>
                    <CustomButton key="back" type="primary" className="md:ml-3.5 max-sm:w-full" onClick={closeDrawerHandler}>
                        OK
                    </CustomButton>
                </div>
            </div>}
        </>
    )
}
const connectStateToProps = ({ userConfig, userProfile }) => {
    return { userConfig: userConfig.details, userProfile };
};
export default connect(connectStateToProps)(Enable2FA);