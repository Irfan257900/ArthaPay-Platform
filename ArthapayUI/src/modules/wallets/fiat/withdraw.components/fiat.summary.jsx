import React, { useState, useEffect, useCallback } from "react";
import { Form } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router";
import { WarningOutlined } from "@ant-design/icons";
import AppNumber from "../../../../core/shared/appNumber.js";
import Verifications from "../../../../core/verification.component/verifications.js";
import CustomButton from "../../../../core/button/button.jsx";
import AppAlert from "../../../../core/shared/appAlert.js";
import { setPayeeFiat, setRefreshLeftPanel, setWithdrawFiatSaveObj, setWithdrawObject } from "./withdrawFiatReducer.js";
import { getFiatSummarySave } from "./api.js";
import { deriveErrorMessage } from "../../../../core/shared/deriveErrorMessage.js";
import { saveFiatWithdrawl } from "./httpServices.jsx";
import ActionWidgetLoader from "../../../../core/skeleton/actionWidgets.loader.jsx";
import NumericText from "../../../../core/shared/numericText.jsx";
const icon = <WarningOutlined />;
const WithdrawFiatSummary = () => {
    const [error, setErrorMsg] = useState(null)
    const [loader, setLoader] = useState(false);
    const [email, setEmail] = useState({ showRuleMsg: '', errorMsg: '', btnName: 'get_otp', requestType: 'Send', code: '', verified: false, btnLoader: false });
    const [phone, setPhone] = useState({ showRuleMsg: '', errorMsg: '', btnName: 'get_otp', requestType: 'Send', verified: false, btnLoader: false });
    const [buttonFlag, setButtonFlag] = useState(true);
    const useOtpRef = React.useRef(null);
    const phoneSeconds = 120
    const emailSeconds = 120
    const withdrawDetails = useSelector((store) => store?.withdrawFiat?.withdrawSaveObj);
    const selectedCoin = useSelector((storeInfo) => storeInfo?.withdrawFiat?.selectedCoin);
    const payeeInfo = useSelector((storeInfo) => storeInfo?.withdrawFiat?.selectedPayee);
    const _witdrawDetails = useSelector((store) => store?.withdrawFiat?.withdrawObj);
    const trackAuditLogData = useSelector(
        (store) => store.userConfig.trackAuditLogData
    );

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [refreshTimer, setRefreshTimer] = useState(0);
    const [refreshLoader, setRefreshLoader] = useState(false);
    const truncateDecimals = (value, decimalPlaces) => {
        if (value === null || value === undefined) return 0;
        const num = Number(value);
        if (isNaN(num)) return 0;
        const factor = Math?.pow(10, decimalPlaces);
        return Math.floor(num * factor) / factor;
    };
    useEffect(() => {
        if (phoneSeconds === 0 && phone.btnName === 'code_Sent') {
            setPhone({ ...phone, btnName: 'resendotp', code: '' });
        }
        else if (emailSeconds === 0 && email.btnName === 'code_Sent') {
            setEmail({ ...email, btnName: 'resendotp', code: '' });
        }
    }, [phoneSeconds, emailSeconds]);//eslint-disable-line react-hooks/exhaustive-deps
    const changesVerification = useCallback((obj) => {
        const allVerified = Object.keys(obj.verifyData)
            .filter((key) => obj.verifyData[key] === true)
            .every((key) => obj[key] === obj.verifyData[key]);
        setButtonFlag(!allVerified);
    }, [])
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
    const handleFormSubmission = useCallback(async () => {
        setErrorMsg(null);
        setLoader(true);
        try {
            let saveObj = Object.assign({});
            saveObj.amount = _witdrawDetails?.amount;
            saveObj.payeeId = payeeInfo?.id;
            saveObj.fiatWalletId = selectedCoin?.id;
            saveObj.metadata = trackAuditLogData ? JSON.stringify(trackAuditLogData) : null
            let response = await getFiatSummarySave(saveObj);
            if (response) {
                setErrorMsg(null);
                dispatch(setWithdrawObject(null));
                dispatch(setPayeeFiat(null));
                navigate(`/wallets/fiat/withdraw/${selectedCoin?.code}/${selectedCoin?.id}/success`);
                dispatch(setRefreshLeftPanel(true));
            } else {
                setErrorMsg(deriveErrorMessage(response));
                useOtpRef.current.scrollIntoView(0, 0);
            }
        } catch (error) {
            setErrorMsg(error?.message || 'An error occurred');
            useOtpRef.current.scrollIntoView(0, 0);
        } finally {
            setLoader(false);
        }
    }, []);
    const closeErrorMsg = useCallback(() => {
        setErrorMsg(null)
    })
    const handleRefresh = useCallback(async () => {
        try {
            setRefreshLoader(true);
            let savedObj = {
                "payeeId": withdrawDetails?.payeeId,
                "fiatWalletId": withdrawDetails?.fiatWalletId,
                "amount": withdrawDetails?.amount
            }
            let response = await saveFiatWithdrawl(savedObj);
            if (response?.respone) {
                dispatch(setWithdrawFiatSaveObj(response?.respone));
            }
            else if (response?.error) {
                setErrorMsg(response?.error);
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setRefreshLoader(false);
        }
    }, [withdrawDetails, dispatch, saveFiatWithdrawl]);
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
                                        afterClose={closeErrorMsg}
                                        closable={true}
                                        icon={icon}
                                        showIcon
                                    />
                                </div>
                            )}
                            <div className="summary-panel">
                                <div className="text-left">
                                    <h2 className="text-2xl font-semibold text-titleColor mb-4 !text-center ">Summary</h2>
                                </div>
                                <div className="wd-inblock">
                                    <div className="summary-list" >
                                        <h2 className="text-xl font-semibold text-titleColor mb-2 capitalize">Transfer Details</h2>
                                        <div className="summary-list-item">
                                            <div className=" summary-label">Withdrawal Amount</div>
                                            <div className="summary-text">
                                                {/* <AppNumber
                                                defaultValue={withdrawDetails?.amount || 0}
                                                thousandSeparator={true} decimalScale={2} /> {selectedCoin?.currency} */}
                                                <NumericText
                                                    value={`${withdrawDetails?.amount || 0}s`}
                                                    decimalScale={2}
                                                    thousandSeparator
                                                    className="block"
                                                    displayType="text"
                                                    suffixText={`${selectedCoin?.currency || ''}`}
                                                />

                                            </div>
                                        </div>
                                        <div className="summary-list-item">
                                            <div className=" summary-label">Effective Fee</div>
                                            <div className="summary-text">
                                                {/* <AppNumber
                                                    defaultValue={withdrawDetails?.effectiveFee || 0}
                                                    thousandSeparator={true} decimalScale={2} /> {selectedCoin?.currency} */}
                                                <NumericText
                                                    value={`${truncateDecimals(withdrawDetails?.effectiveFee, 2) || 0}`}
                                                    decimalScale={2}
                                                    thousandSeparator
                                                    className="block"
                                                    displayType="text"
                                                    suffixText={`${selectedCoin?.currency || ''}`}
                                                />
                                            </div>
                                        </div>
                                        <div className="summary-list-item">
                                            <div className=" summary-label">Receive Amount</div>
                                            <div className="summary-text">
                                                {/* <AppNumber
                                                    defaultValue={withdrawDetails?.receiveAmount}
                                                    thousandSeparator={true} decimalScale={2} /> {selectedCoin?.currency} */}
                                                <NumericText
                                                    value={`${withdrawDetails?.receiveAmount || 0}`}
                                                    decimalScale={2}
                                                    thousandSeparator
                                                    className="block"
                                                    displayType="text"
                                                    suffixText={`${selectedCoin?.currency || ''}`}
                                                />
                                            </div>
                                        </div>
                                        <h2 className="text-xl font-semibold text-titleColor my-2 capitalize">Recipient Details</h2>
                                        <div className="summary-list-item">
                                            <div className=" summary-label">Holder Name</div>
                                            <div className="summary-text">
                                                {withdrawDetails?.holderName || "--"}
                                            </div>
                                        </div>
                                        <div className="summary-list-item">
                                            <div className=" summary-label">Favorite Name</div>
                                            <div className="summary-text">
                                                {withdrawDetails?.whitelistName || "--"}
                                            </div>
                                        </div>
                                        <div className="summary-list-item">
                                            <div className=" summary-label">Beneficiary Name</div>
                                            <div className="summary-text">
                                                {withdrawDetails?.beneficiaryName || "--"}
                                            </div>
                                        </div>
                                        <div className="summary-list-item">
                                            <div className=" summary-label">IBAN/Account Number</div>
                                            <div className="summary-text">
                                                {withdrawDetails?.accountNumber || "--"}
                                            </div>
                                        </div>
                                         <div className="summary-list-item">
                                            <div className=" summary-label">Bank Name</div>
                                            <div className="summary-text">
                                                {withdrawDetails?.bankName || "--"}
                                            </div>
                                        </div>
                                        {/* <div className="summary-list-item">
                                            <div className=" summary-label">Bank Code</div>
                                            <div className="summary-text">
                                                {withdrawDetails?.bankCode || "--"}
                                            </div>
                                        </div>
                                         <div className="summary-list-item">
                                            <div className=" summary-label">Branch Code</div>
                                            <div className="summary-text">
                                                {withdrawDetails?.branchCode || "--"}
                                            </div>
                                        </div> */}
            
                                        <div className="summary-list-item">
                                            <div className=" summary-label">Payment Type</div>
                                            <div className="summary-text">
                                                {withdrawDetails?.paymentType || "--"}
                                            </div>
                                        </div>
                                    </div></div>
                                <div className="mt-12 custom-varification">
                                    <Verifications onchangeData={changesVerification} />
                                </div>
                                <div className="mt-9">
                                    {/* {withdrawDetails?.timer > 0 &&
                                        <CustomButton type="primary" onClick={handleRefresh} className="w-full mb-4" disabled={refreshTimer > 0}>
                                            {refreshTimer > 0 ? `Refresh (${formatTimer(refreshTimer)})` : "Refresh"}
                                        </CustomButton>} */}
                                    <CustomButton type='primary' onClick={handleFormSubmission} className={"w-full"} loading={loader} disabled={buttonFlag} >
                                        Confirm
                                    </CustomButton>
                                </div>
                            </div></div>
                    </Form>
                </div>
            }
        </>)
}
export default WithdrawFiatSummary
