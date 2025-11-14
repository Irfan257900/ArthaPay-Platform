import React, { useState, useCallback } from "react";
import { Typography, Button, Form, Input, } from "antd";
import { connect, useSelector } from 'react-redux';
import { getAuthenticator, } from "../../verification.component/http.services";
import CustomButton from "../../button/button";
import { useTranslation } from "react-i18next";
const PhoneVerifications = (props) => {
    const useOtpRef = React.useRef(null);
    const { Text } = Typography;
    const [btnDisable, setBtnDisable] = useState(true)
    const [authenticator, setAuthenticator] = useState({ showRuleMsg: '', errorMsg: '', btnName: 'verifyOtpBtn', verified: false, btnLoader: false });
    const [verifyData, setVerifyData] = useState({});
    const { t } = useTranslation();
    const { sk } = useSelector((store) => store.userConfig);
    const updateverifyObj = useCallback((val, name) => {
         if (name === 'isAuthenticatorVerification') {
            setVerifyData(prevVerifyData => ({
                ...prevVerifyData,
                isTwoFactorEnabled: val
            }));
        }
    },[verifyData])
    const continueFactorDrawerHandler= useCallback(()=>{
        props?.handleGoogleAuthenticator();
    },[props])

    
    const verifyAuthenticatorOTP = useCallback(async () => {
        if (!authenticator.code) {
            return setAuthenticator({ ...authenticator, errorMsg: 'Please Enter Authenticator Code', verified: false, btnLoader: false });
        }
        if (authenticator.code && authenticator.code?.toString()?.length === 6) {
            setAuthenticator({ ...authenticator, errorMsg: '', verified: false, btnLoader: true });
            let response = await getAuthenticator(authenticator.code, sk);
            if (response?.data) {
                setAuthenticator({ ...authenticator, errorMsg: '', verified: true, btnName: 'verified', btnLoader: false, showRuleMsg: '' });
                updateverifyObj(true, 'isAuthenticatorVerification')
                setBtnDisable(false);
            }
            else if (response?.data === null || response !== null) {
                setAuthenticator({ ...authenticator, errorMsg: 'Invalid Authenticator Verification Code', verified: false, btnLoader: false });
            }
        }
        else {
            setAuthenticator({ ...authenticator, errorMsg: 'Invalid Authenticator Verification Code', verified: false, btnLoader: false });
        }
    }, [authenticator]);
    const handleAuthenticatorinputChange = useCallback((e) => {
        if (e.target.value) {
            setAuthenticator({ ...authenticator, code: e.target.value ,errorMsg:''})

        } else {
            setAuthenticator({ ...authenticator, code: '' })
        }
    }, [authenticator]);

    const authenticator_btnList = {

        verified: (

            <Button
                type="text"
                disabled={true} className="w-full bg-textGreen h-h42 rounded-r-5 rounded-l-none"
            ><h4 className=" text-sm font-medium text-textWhite "> {t('vault.vaultscrypto.verified')}</h4>
                <span className="icon md success-arrow " />
            </Button>

        ),
        verifyOtpBtn: (

            <Button

                type="text"
                onClick={verifyAuthenticatorOTP} className="mx-auto"
                loading={authenticator.btnLoader}
            ><h4 className={` text-sm font-medium text-primaryColor `} >{t('vault.vaultscrypto.clickheretoverify')}</h4></Button>
        ),
    };


    return (
        <div className="mt-4">
            {" "}
            <div ref={useOtpRef}></div>
            <Form.Item
                name="emailCode" colon={false}
                label={t('vault.vaultscrypto.authenticatorCode')}
                className="basicinfo-form panel-form-items-bg relative mb-2"
                extra={
                    <div className="relative  flex">
                        <Text className="text-sm text-labelGrey">
                            {authenticator.showRuleMsg}
                        </Text>
                        <Text
                            className="text-sm !text-textLightRed"
                            style={{ float: "left" }}>
                            {authenticator.errorMsg}
                        </Text>
                    </div>
                }
                rules={[{ required: true, message: '' }]}
            >
                <div className="basicinfo-form panel-form-items-bg relative">
                    <Input
                        type="text"
                        className="w-full bg-inputBg border border-inputDarkBorder text-lightWhite p-2 rounded outline-0 disabled:!bg-inputDisabled disabled:cursor-not-allowed disabled:!text-lightWhite disabled:hover:!bg-inputDisabled"
                        placeholder={t('vault.vaultscrypto.entercode')}
                        maxLength={6}
                        disabled={authenticator.btnName === 'get_otp' || authenticator.btnName === 'verified'}
                        onChange={handleAuthenticatorinputChange}
                    />

                   <div className="bg-advcard text-subTextColor rounded-r-5 absolute bottom-[1px] right-[1px] h-[50px] flex items-center lg:!w-[244px] w-[134px] text-center justify-center z-[9999]">
                        {authenticator_btnList[authenticator.btnName]}
                    </div>
                </div>
            </Form.Item>
            <Form.Item>
                <div className="text-right mt-9">
                <CustomButton className={"md:ml-3.5"} onClick={props?.onClose}>
                       Cancel
                    </CustomButton>
                    <CustomButton key="back" htmlType="submit" type="primary" className={"md:ml-3.5"} loading={""} disabled={btnDisable} onClick={continueFactorDrawerHandler}>
                        Continue
                    </CustomButton>
                </div>
            </Form.Item>
        </div>
    );
};
const connectStateToProps = ({ userConfig }) => {
    return {
        userConfig: userConfig.details,
    };
};
const connectDispatchToProps = dispatch => {
    return {
        dispatch
    }
}
export default connect(connectStateToProps, connectDispatchToProps)(PhoneVerifications)

