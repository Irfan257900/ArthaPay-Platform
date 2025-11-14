import React, { useState, useEffect, useCallback } from "react";
import { Form } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import { WarningOutlined } from "@ant-design/icons";
import { saveCryptoWithdraw, saveWithdrawl } from "../httpServices.js";
import AppText from "../../../core/shared/appText.js";
import CopyToClipboard from "react-copy-to-clipboard";
import Verifications from "../../../core/verification.component/verifications.js";
import CustomButton from "../../../core/button/button.jsx";
import { useNavigate, useParams } from "react-router";
import { setIsNextStep, setLeftPanelRefresh, setPayee, setTransactionGridRefresh, setWithdrawObj, setWithdrawSaveObj } from "../../../reducers/vaults.reducer.js";
import AppAlert from "../../../core/shared/appAlert.js";
import FeeBreakdown from "../../../core/shared/feeBreakdown.js";
import { useTranslation } from "react-i18next";
import ActionWidgetLoader from "../../../core/skeleton/actionWidgets.loader.jsx";
import { deriveErrorMessage } from "../../../core/shared/deriveErrorMessage.js";
import NumericText from "../../../core/shared/numericText.jsx";
const icon = <WarningOutlined />;
const WithdrawCryptoSummary = (props) => {
    const [error, setErrorMsg] = useState(null)
    const [loader, setLoader] = useState(false);
    const [email, setEmail] = useState({ showRuleMsg: '', errorMsg: '', btnName: 'get_otp', requestType: 'Send', code: '', verified: false, btnLoader: false });
    const [phone, setPhone] = useState({ showRuleMsg: '', errorMsg: '', btnName: 'get_otp', requestType: 'Send', verified: false, btnLoader: false });
    const [buttonFlag, setButtonFlag] = useState(true);
    const showMore = (false);
    const useOtpRef = React.useRef(null);
    const phoneSeconds = 120
    const emailSeconds = 120
    const withdrawDetails = useSelector((store) => store?.withdrawReducer?.withdrawSaveObj);
    const userInfo = useSelector((storeInfo) => storeInfo?.userConfig?.details);
    const selectedCoin = useSelector((storeInfo) => storeInfo?.vaultsAccordion?.selectedCoin);
    const selectedNetwork = useSelector((storeInfo) => storeInfo?.withdrawReducer?.selectedNetwork);
    const trackAuditLogData = useSelector(
        (store) => store.userConfig.trackAuditLogData
    );

    const { t } = useTranslation();
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const [refreshTimer, setRefreshTimer] = useState(0);
    const [refreshLoader, setRefreshLoader] = useState(false);
    useEffect(() => {
        if (phoneSeconds === 0 && phone.btnName === 'code_Sent') {
            setPhone({ ...phone, btnName: 'resendotp', code: '' });
        }
        else if (emailSeconds === 0 && email.btnName === 'code_Sent') {
            setEmail({ ...email, btnName: 'resendotp', code: '' });
        }
    }, [phoneSeconds, emailSeconds]);//eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        let timerValue = withdrawDetails?.timer;
        if (!timerValue) return;
        setRefreshTimer(timerValue);
    }, [withdrawDetails]);
    useEffect(() => {
        if (refreshTimer > 0) {
            const interval = setInterval(() => {
                setRefreshTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [refreshTimer]);


    const changesVerification = useCallback((obj) => {
        setErrorMsg(null)
        if (
            Object.keys(obj.verifyData)
                .filter((key) => obj.verifyData[key] === true)
                .every((key) => obj[key] === obj.verifyData[key])
        ) {
            setButtonFlag(false);
        } else {
            setButtonFlag(true);
        }
    }, [])

    const handleFormSubmission = useCallback(async () => {
        setErrorMsg(null)
        setLoader(true)
        try {
            let saveObj = Object.assign({})
            saveObj.payeeId = withdrawDetails?.payeeId
            saveObj.cryptorWalletId =  withdrawDetails?.cryptorWalletId,
            saveObj.amount = withdrawDetails?.amount
            saveObj.metadata = trackAuditLogData ? JSON.stringify(trackAuditLogData) : null
            let response = await saveCryptoWithdraw(saveObj)
            if (response?.respone) {
                setErrorMsg(null)
                dispatch(setWithdrawObj(null));
                dispatch(setPayee(null));
                navigate(`/wallets/crypto/withdraw/${selectedCoin?.code}/${params?.mrctid}/${params?.custid}/success`);
                dispatch(setTransactionGridRefresh(true));
                dispatch(setLeftPanelRefresh(true));
                dispatch(setIsNextStep(true));
            } else if (response?.error) {
                setErrorMsg(response?.error)
                useOtpRef.current.scrollIntoView(0, 0);
            }
        }
        catch (error) {
            setErrorMsg(deriveErrorMessage(error))
            useOtpRef.current.scrollIntoView(0, 0);
        }
        finally {
            setLoader(false)
        }
    }, [selectedCoin, params, selectedNetwork, userInfo, withdrawDetails, props?.trackauditlogs, setErrorMsg, setLoader, saveCryptoWithdraw])
    const closeErrorHandler = useCallback(() => {
        setErrorMsg(null)
    }, [])
    const handleRefresh = useCallback(async () => {
        try {
            setRefreshLoader(true);
            let savedObj = {
                "payeeId": withdrawDetails?.payeeId,
                "cryptorWalletId": withdrawDetails?.cryptorWalletId,
                "amount": withdrawDetails?.amount
            }
            let response = await saveWithdrawl(savedObj);
            if (response?.respone) {
                dispatch(setWithdrawSaveObj(response?.respone));
            }
            else if (response?.error) {
                setErrorMsg(response?.error);
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setRefreshLoader(false);
        }
    }, [withdrawDetails, dispatch, saveWithdrawl]);
    const formatTimer = useCallback((sec) => {
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}s`;
    }, []);
    return (
        <>
            <div ref={useOtpRef}></div>
            {refreshLoader && <ActionWidgetLoader />}
            {!refreshLoader &&
                <div className="panel-card buy-card card-paddingrm">
                    <Form
                        name="advanced_search"
                        autoComplete="off">
                        <div className="summary rightpanel-card-bg mobile-padding summery-panelcard ">
                            {error !== null && (
                                <div className="alert-flex">
                                    <AppAlert
                                        type="error"
                                        description={error}
                                        afterClose={closeErrorHandler}
                                        closable={true}
                                        icon={icon}
                                        showIcon
                                    />
                                </div>
                            )}
                            <div className="summary-panel">
                                <div >
                                    <h2 className="text-xl font-semibold text-titleColor mb-2.5 text-center mb-8">{t('vault.vaultscrypto.summary')}</h2>
                                </div>
                                <div className="wd-inblock">
                                    <div className="summary-list" >
                                        <h2 className="text-xl font-semibold text-titleColor mb-2 capitalize">Transfer Details</h2>
                                        <div className="summary-list-item">
                                            <div className="summary-label">{t('vault.vaultscrypto.exchangerate')}</div>
                                            <div className="summary-text">1 {withdrawDetails?.walletCode} = <NumericText
                                                value={withdrawDetails?.exchangeRate || 0}
                                                suffixText="USD"
                                                decimalScale={4}
                                                thousandSeparator
                                                /></div>
                                        </div>
                                        <div className="summary-list-item">
                                            <div className="summary-label">{t('vault.vaultscrypto.amount')}</div>
                                            <div className="summary-text"><NumericText
                                                value={withdrawDetails?.amount || 0}
                                                suffixText={withdrawDetails?.walletCode || ""}
                                                decimalScale={4}
                                                thousandSeparator
                                                /></div>
                                        </div>
                                        <div className="summary-list-item show-more-feilds">
                                            <div className=" summary-label"><span>{t('vault.vaultscrypto.fee')}</span>
                                            </div>
                                            <div className=" summary-text">  <NumericText
                                                value={withdrawDetails?.fee || 0}
                                                suffixText={withdrawDetails?.walletCode || ""}
                                                decimalScale={4}
                                                thousandSeparator
                                                /> </div></div>
                                        {showMore && <FeeBreakdown feeInfo={withdrawDetails?.feeInfo} />}
                                        {withdrawDetails?.receivedAmount && <div className="summary-list-item">
                                            <div className=" summary-label">{t('vault.vaultscrypto.receiveAmount')}</div>
                                            <div className=" summary-text"><NumericText
                                                value={withdrawDetails?.receivedAmount || 0}
                                                suffixText={withdrawDetails?.walletCode || ""}
                                                decimalScale={4}
                                                thousandSeparator
                                                /></div>
                                        </div>}
                                       <h2 className="text-xl font-semibold text-titleColor my-2 capitalize mt-6">Recipient Details</h2>
                                        {withdrawDetails?.walletAddress && <div className="summary-list-item">
                                            <div className=" summary-label"> {t('vault.vaultscrypto.address')}</div>
                                            <div className=" summary-text !text-right ml-1">
                                                   <AppText
                                                        copyable={{
                                                            text: withdrawDetails?.walletAddress || "", 
                                                            tooltips: ["Copy", "Copied"],
                                                        }}
                                                        className="summary-text m-0"
                                                    >
                                                        <span style={{ marginRight: "8px" }}>
                                                            {withdrawDetails?.walletAddress?.length > 0
                                                                ? withdrawDetails?.walletAddress
                                                                : ""}
                                                        </span>
                                                    </AppText>

                                            </div>
                                        </div>}
                                        {withdrawDetails?.network && <div className="summary-list-item">
                                            <div className=" summary-label">{t('vault.vaultscrypto.network')}</div>
                                            <div className=" summary-text">{withdrawDetails?.network}</div>
                                        </div>}
                                    </div></div>
                                <div className="mt-12">
                                    <Verifications onchangeData={changesVerification} />
                                </div>
                                <div className="mt-9">
                                    {/* {withdrawDetails?.timer > 0 &&
                                    <CustomButton type="primary" onClick={handleRefresh} className="w-full mb-4" disabled={refreshTimer > 0}>
                                        {refreshTimer > 0 ? `Refresh (${formatTimer(refreshTimer)})` : "Refresh"}
                                    </CustomButton>} */}
                                    <CustomButton type='primary' onClick={handleFormSubmission} className={"w-full"} loading={loader} disabled={buttonFlag 
                                        || (withdrawDetails?.timer > 0 && !refreshTimer)
                                        } >
                                        {t('vault.vaultscrypto.withdraw')}
                                    </CustomButton>
                                </div>
                            </div></div>
                    </Form>
                </div>
            }
        </>)
}

export default WithdrawCryptoSummary
