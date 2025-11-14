import { useCallback, useEffect, useState } from "react";
import { Spin } from 'antd';
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { WarningOutlined } from "@ant-design/icons";
import { executeWithdraw, setErrorMessages, setTriggerFlag } from "../../../reducers/banks.widthdraw.reducer";
import Verifications from "../../../core/verification.component/verifications";
import FeeBreakdown from "../../../core/shared/feeBreakdown";
import CustomButton from "../../../core/button/button";
import AppAlert from "../../../core/shared/appAlert";
import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader";
import numberFormatter from "../../../utils/numberFormatter";
import NumericText from "../../../core/shared/numericText";
const icon = <WarningOutlined />;
const showMore = false
const SummaryDetails = () => {
    const [reviewDetailsLoading, setReviewDetailsLoading] = useState(false);
    const [buttonFlag, setButtonFlag] = useState(true)
    const selectedCurrency = useSelector(state => state.transferReducer.selectedCurrency)
    const { data: summary, loading: fetchingSummary, error: fetchError } = useSelector(state => state.transferReducer.summary)
    const { loading: saving, error: saveError } = useSelector(state => state.transferReducer.save)
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const [refreshTimer, setRefreshTimer] = useState(0);

    useEffect(() => {
        let timerValue = summary?.timer;
        if (!timerValue) return;
        setRefreshTimer(timerValue);
    }, [summary]);
    useEffect(() => {
        if (refreshTimer > 0) {
            const interval = setInterval(() => {
                setRefreshTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [refreshTimer]);
    const changesVerification = useCallback((obj) => {
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


    const onReviewDetailsLoading = useCallback((val) => {
        setReviewDetailsLoading(val);
    }, [])

    const handleWithdraw = useCallback(async () => {
        try {
            await dispatch(executeWithdraw({
                onSuccess: () => {
                    navigate(`/banks/withdraw/${selectedCurrency?.currency}/success`);
                    dispatch(setTriggerFlag(true));
                },
                onError: (error) => {
                    console.error("Withdraw failed:", error);
                }
            })).unwrap();
        } catch (error) {
            console.error("Withdraw error:", error);
        }
    }, [selectedCurrency, navigate, dispatch])
    const closeErrorHandler = useCallback(() => {
        dispatch(setErrorMessages([{ key: 'save', message: '' }, { key: 'summary', message: '' }]));
    }, [])
    const getBalanceText = (amount, isSuffix, isOnlyAmount) => {
        const numAmount = parseFloat(amount) || 0;
        if (isNaN(numAmount)) return '0.00';

        const { number, suffix } = numberFormatter(numAmount) || {};
        const formattedNumber = (number ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        if (isSuffix) {
            return suffix || "";
        }
        if (isOnlyAmount) {
            return formattedNumber;
        }
        return `$ ${formattedNumber}`;
    };
    return (

        <Spin spinning={reviewDetailsLoading}>
            {fetchingSummary && <ContentLoader />}
            {!fetchingSummary &&
                <div className="panel-card buy-card card-paddingrm !mt-6">
                    {(saveError || fetchError) && (
                        <div className="alert-flex" style={{ width: "100%", marginTop: "5%" }}>
                            <AppAlert
                                type="error"
                                description={saveError || fetchError}
                                afterClose={closeErrorHandler}
                                closable={true}
                                icon={icon}
                                showIcon
                            />
                        </div>
                    )}
                    <div className="summary-panel">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-titleColor mb-2.5 text-center">Summary</h2>
                        </div>
                        <div className="wd-inblock">
                              <h2 className="text-xl font-semibold text-titleColor mb-2 capitalize">Transfer Details</h2>
                            <div className="summary-list-item">
                                <div className="summary-label">Transfer Amount</div>
                                <div className="summary-text"><NumericText
                                    value={getBalanceText(summary?.requestedAmount, false, true) || 0}
                                    thousandSeparator={true} displayType="text" decimalScale={2}
                                    suffixText={summary?.walletCode}
                                /> </div>
                            </div>
                            <div className="summary-list-item show-more-feilds">
                                <div className="summary-label"><span>Fee</span></div>
                                <div className="summary-text">

                                    <NumericText
                                        value={getBalanceText(summary?.commission, false, true) || 0}
                                        thousandSeparator={true} displayType="text" decimalScale={2}
                                        suffixText={summary?.walletCode}
                                    />


                                </div>
                            </div>
                            {showMore && <FeeBreakdown feeInfo={summary?.feeInfo} />}
                            <div className="summary-list-item">
                                <div className="summary-label">Receive Amount</div>
                                <div className="summary-text">

                                    <NumericText
                                        value={getBalanceText(summary?.withdrawAmount, false, true) || 0}
                                        thousandSeparator={true} displayType="text" decimalScale={2}
                                        suffixText={summary?.walletCode}
                                    />

                                </div>
                            </div>
                        </div>
                        {(!summary?.recipientName && !summary?.name && (!summary?.routingNumber || !summary?.swiftRouteBICNumber) && (!summary?.iban || !summary?.accountNumber) && !summary?.bankName) && (
                            <div className="text-left mt-5">
                                <h2 className="text-xl font-semibold text-titleColor mb-2.5 text-left">Recipient Details</h2>
                            </div>
                        )}
                          <h2 className="text-xl font-semibold text-titleColor my-2 !mt-6 capitalize ">Recipient Details</h2>
                        <div className="summary-card">
                            <div className="summary-list-item"> <div className="summary-label">Holder Name</div><div className="summary-text">{summary?.holderName || "--"}</div> </div>
                            {summary?.recipientName && <div className="summary-list-item"> <div className="summary-label">Favorite Name</div><div className="summary-text">{summary?.recipientName || "--"}</div> </div>}
                            {summary?.beneficiaryAccountName && <div className="summary-list-item"> <div className="summary-label">Beneficiary Name</div><div className="summary-text">{summary?.beneficiaryAccountName || "--"}</div> </div>}
                            {(summary?.routingNumber || summary?.swiftRouteBICNumber) && <div className="summary-list-item"> <div className="summary-label">Swift/BIC/UK Sort Code</div><div className="summary-text">{summary?.routingNumber || summary?.swiftRouteBICNumber || "--"}</div> </div>}
                            {(summary?.iban || summary?.accountNumber) && <div className="summary-list-item"> <div className="summary-label">IBAN/Account Number</div><div className="summary-text">{summary?.iban || summary?.accountNumber || "--"}</div> </div>}
                            {summary?.bankName && <div className="summary-list-item"> <div className="summary-label">Bank Name</div><div className="summary-text">{summary?.bankName || "--"}</div> </div>}
                        </div>
                        <div className="summary-list-item">
                            <div className=" summary-label">Payment Type</div>
                            <div className="summary-text">
                                {summary?.paymentType || "--"}
                            </div>
                        </div>
                        <div className="mt-12">
                            <Verifications onchangeData={changesVerification} onReviewDetailsLoading={onReviewDetailsLoading} />
                        </div>
                        <div className="mt-9">
                            <CustomButton block className="" type="primary" onClick={handleWithdraw} loading={saving}
                                disabled={buttonFlag || saving
                                    || (summary?.timer > 0 && !refreshTimer)
                                }>Confirm</CustomButton>
                        </div>
                        <div className="mt-2"><p className="text-sm font-normal text-descriptionGreyTwo mb-0">Please ensure that the above details are accurate and correct as the transaction is Irreversible</p></div>
                    </div>
                </div>}
        </Spin>

    )
}

export default (SummaryDetails);