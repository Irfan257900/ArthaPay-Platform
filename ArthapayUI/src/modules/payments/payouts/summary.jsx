import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { WarningOutlined } from '@ant-design/icons';
import Verifications from '../../../core/verification.component/verifications.js';
import CustomButton from "../../../core/button/button"
import { getPayoutSummary, processPayout } from '../httpServices';
import AppAlert from '../../../core/shared/appAlert';
import { setFormData, setIsNextStep, setLeftPanelRefresh } from '../reducers/payout.reducer';
import KycDocument from '../../../core/shared/document.preview';
import PreviewModal from '../../../core/shared/preview.model';
import AppParagraph from '../../../core/shared/appParagraph';
import AppTitle from '../../../core/shared/appTitle';
import NumericText from '../../../core/shared/numericText';
import CriptoFiatLoader from '../../../core/skeleton/cripto.fiat.loader';
import { deriveErrorMessage } from '../../../core/shared/deriveErrorMessage';
import AppDefaults from '../../../utils/app.config';
import { Form } from 'antd';
const icon = <WarningOutlined />;

const note =
    "The output is an estimate and may vary due to market fluctuations and other factors.";

const FaitSummary = () => {
    const { currencyType } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const payoutSummary = useSelector((store) => store.payoutReducer);
    const userProfile = useSelector((storeInfo) => storeInfo?.userConfig?.details);
    const purposeCode = useSelector((store) => store?.payoutReducer?.selectedPurpose);
    const sourceCode = useSelector((store) => store?.payoutReducer?.selectedSource);
    const [errors, setErrors] = useState(null)
    const [loader, setLoader] = useState(false);
    const [email, setEmail] = useState({ showRuleMsg: '', errorMsg: '', btnName: 'get_otp', requestType: 'Send', code: '', verified: false, btnLoader: false });
    const [phone, setPhone] = useState({ showRuleMsg: '', errorMsg: '', btnName: 'get_otp', requestType: 'Send', verified: false, btnLoader: false });
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [previewFile, setPreviewFile] = useState("");
    const useOtpRef = React.useRef(null);
    const [buttonFlag, setButtonFlag] = useState(true);
    const phoneSeconds = 120
    const emailSeconds = 120
    const [refreshTimer, setRefreshTimer] = useState(0);
    const [refreshLoader, setRefreshLoader] = useState(false);

    useEffect(() => {
        if (phoneSeconds === 0 && phone.btnName === 'code_Sent') {
            setPhone({ ...phone, btnName: 'resendotp', code: '' });
        }
        else if (emailSeconds === 0 && email.btnName === 'code_Sent') {
            setEmail({ ...email, btnName: 'resendotp', code: '' });
        }
    }, [phoneSeconds, emailSeconds]);
    useEffect(() => {
        let timerValue = payoutSummary?.summary?.timer;
        if (!timerValue) return;
        setRefreshTimer(timerValue);
    }, [payoutSummary?.summary]);
    useEffect(() => {
        if (refreshTimer > 0) {
            const interval = setInterval(() => {
                setRefreshTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [refreshTimer]);
    const changesVerification = useCallback((obj) => {
        setErrors(null)
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
        setErrors(null)
        setLoader(true)
        try {
            let response = await processPayout(payoutSummary, userProfile, currencyType, setLoader, setErrors, purposeCode, sourceCode)
            if (response) {
                navigate(`/payments/payouts/payout/${payoutSummary?.merchantId}/${payoutSummary?.merchantName}/success/${currencyType}`);
                dispatch(setLeftPanelRefresh(true));
                dispatch(setIsNextStep(true));
            } else if (response?.error) {
                setErrors(response?.error.message)
                useOtpRef.current.scrollIntoView(0, 0);
            }
        }
        catch (error) {
            setErrors(deriveErrorMessage(error))
            useOtpRef.current.scrollIntoView(0, 0);
        }
        finally {
            setLoader(false)
        }
    }, [payoutSummary, userProfile, currencyType, purposeCode, sourceCode])
    const onSummaryError = (errorMessage) => {
        setErrors(errorMessage.message || errorMessage)
        setRefreshLoader(false);
    }

    const onSummary = (response) => {
        const values = {
            ...payoutSummary,
            summary: {
                ...payoutSummary?.summary,
                ...response
            }
        };
        dispatch(setFormData(values));
        setRefreshLoader(false);
    }
    const handleClosePreview = useCallback(() => {
        setIsPreviewVisible(false);
        setPreviewFile("");
    }, []);
    const handleQuoteExpiration = useCallback(() => {
        setRefreshLoader(true);
        const values = {
            ...payoutSummary,
            summary: {
                ...payoutSummary?.summary,
                expiresIn: ''
            }
        };
        dispatch(setFormData(values));
        getPayoutSummary({ userProfile, currencyType, value: payoutSummary?.requestedAmount, customerWalletId: payoutSummary?.customerWalletId, selectedType: currencyType, fiatCurrency: payoutSummary?.fiatCurrency, payee: payoutSummary?.selectedPayee, onSummary, onError: onSummaryError })
    }, [payoutSummary, currencyType])
    const handlePreview = useCallback((file) => {
        const fileUrl = file.url || file.thumbUrl || file.response?.url;
        if (fileUrl) {
            setPreviewFile(fileUrl);
            setIsPreviewVisible(true);
        } else {
            console.error("Preview URL is not available.");
        }
    }, []);
    const onDownload = useCallback((file) => {
        const fileUrl = file.url || file.response?.url;
        if (fileUrl) {
            window.open(fileUrl, "_blank");
        } else {
            console.error("Download URL is not available.");
        }
    }, []);

    const onErrorMessage = useCallback(() => {
        setErrors(null)
    }, []);
    const formatTimer = useCallback((sec) => {
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}s`;
    }, []);
    return (
        <div className='pt-5 p-5 mt-7'>
            {refreshLoader && <CriptoFiatLoader />}
            {!refreshLoader && <>
                {errors !== null && (
                    <div className="alert-flex">
                        <AppAlert
                            type="error"
                            description={errors}
                            afterClose={onErrorMessage}
                            closable={true}
                            icon={icon}
                            showIcon
                        />
                    </div>
                )}
                <Form
                    name="advanced_search"
                    autoComplete="off"
                >
                    <div className='w-full md:w-[465px] mx-auto'>
                        <h1 className="text-2xl font-semibold text-titleColor mb-5 text-center">Summary</h1>
                        <div className="mb-7">
                            <h1 className="text-xl font-semibold text-titleColor mb-5 mt-2">Transfer Details</h1>
                            <div className="flex justify-between items-center border-b border-StrokeColor pb-4">
                                <h5 className="text-sm font-normal text-lightWhite">Currency</h5>
                                <p className="text-sm font-medium text-lightWhite">{payoutSummary?.currency}</p>
                            </div>
                            {currencyType !== 'fiat' && <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                                <h5 className="text-sm font-normal text-lightWhite">Network</h5>
                                <p className="text-sm font-medium text-lightWhite">{payoutSummary?.network}</p>
                            </div>}
                            {/* <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                        <h5 className="text-sm font-normal text-lightWhite">Payee</h5>
                        <div className="text-right">
                            <p className="text-sm font-medium text-lightWhite">{payoutSummary?.selectedPayee?.favoriteName}</p>
                            <p className="text-sm text-labelGrey font-normal">({payoutSummary?.network})</p>
                        </div>

                    </div> */}
                            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                                <h5 className="text-sm font-normal text-lightWhite">Total Amount</h5>
                                <p className="text-sm font-medium text-lightWhite"><NumericText value={payoutSummary?.requestedAmount} thousandSeparator={true} decimalScale={currencyType !== 'fiat' ? AppDefaults?.cryptoDecimals : AppDefaults?.fiatDecimals} suffixText={" " + payoutSummary?.currency} /></p>
                            </div>
                            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                                <h5 className="text-sm font-normal text-lightWhite">Fee</h5>
                                <p className="text-sm font-medium text-lightWhite">
                                    <NumericText value={payoutSummary?.summary?.fee} decimalScale={currencyType === 'fiat' ? AppDefaults?.fiatDecimals : AppDefaults?.cryptoDecimals} fixedDecimals={currencyType === 'fiat' ? AppDefaults?.fiatDecimals : AppDefaults?.cryptoDecimals} suffixText={" " + payoutSummary?.currency} thousandSeparator={true} />
                                </p>
                            </div>
                            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                                <h5 className="text-sm font-normal text-lightWhite">Receive Amount</h5>
                                <p className="text-sm font-medium text-lightWhite"><NumericText value={currencyType === 'fiat' ? payoutSummary?.summary?.finalAmount : payoutSummary?.summary?.finalAmount} suffixText={payoutSummary?.fiatCurrency} thousandSeparator={true} decimalScale={AppDefaults?.fiatDecimals} fixedDecimals={true} /></p>
                            </div>
                            {(currencyType === 'fiat' && payoutSummary?.uploaddocuments) && <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                                <h5 className="text-sm font-normal text-lightWhite">Document</h5>
                                <p className="relative">
                                </p>
                            </div>}
                            {payoutSummary?.uploaddocuments && <KycDocument
                                imageUrl={payoutSummary?.uploaddocuments}
                                onPreview={handlePreview}
                                onDownload={onDownload}
                            />}
                            <h1 className="text-xl font-semibold text-titleColor mb-5 mt-2">Recipient Details</h1>
                            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                                <h5 className="text-sm font-normal text-lightWhite">Holder Name</h5>
                                <p className="text-sm font-medium text-lightWhite">{payoutSummary?.summary?.holderName || '--'}</p>
                            </div>
                            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                                <h5 className="text-sm font-normal text-lightWhite">Favorite Name</h5>
                                <p className="text-sm font-medium text-lightWhite">{payoutSummary?.summary?.favouriteName || '--'}</p>
                            </div>
                            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                                <h5 className="text-sm font-normal text-lightWhite">Beneficiary Name</h5>
                                <p className="text-sm font-medium text-lightWhite">{payoutSummary?.summary?.beneficiaryName || '--'}</p>
                            </div>
                            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                                <h5 className="text-sm font-normal text-lightWhite">IBAN/Account Number</h5>
                                <p className="text-sm font-medium text-lightWhite">{payoutSummary?.summary?.accNoorWalletAddress || '--'}</p>
                            </div>
                            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                                <h5 className="text-sm font-normal text-lightWhite">Bank Name</h5>
                                <p className="text-sm font-medium text-lightWhite">{payoutSummary?.summary?.bankName || '--'}</p>
                            </div>
                            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                                <h5 className="text-sm font-normal text-lightWhite">Payment Type</h5>
                                <p className="text-sm font-medium text-lightWhite">{payoutSummary?.summary?.paymentType || '--'}</p>
                            </div>
                        </div>
                        <PreviewModal
                            isVisible={isPreviewVisible}
                            fileUrl={previewFile}
                            onClose={handleClosePreview}
                        />
                        <div className="">
                            <Verifications loading={setLoader} onchangeData={changesVerification} />
                        </div>
                        {note && (
                            <AppParagraph className="note-text">
                                <AppTitle
                                    level={5}
                                    className="note-heading !text-lightWhite font-medium mt-4"
                                >
                                    Note :&nbsp;
                                    <span className="text-labelGrey text-sm font-normal">
                                        {note}
                                    </span>
                                </AppTitle>
                            </AppParagraph>
                        )}
                        <div className='mt-7 text-end'>
                            {payoutSummary?.summary?.timer > 0 &&
                                <CustomButton type="primary" onClick={handleQuoteExpiration} className="w-full mb-4" disabled={refreshTimer > 0}>
                                    {refreshTimer > 0 ? `Refresh (${formatTimer(refreshTimer)})` : "Refresh"}
                                </CustomButton>
                            }
                            <CustomButton type='primary' onClick={handleFormSubmission} className={"w-full"} loading={loader} disabled={buttonFlag
                                || (payoutSummary?.summary?.timer > 0 && !refreshTimer)
                            }>
                                <span>
                                    Confirm
                                </span>
                            </CustomButton>
                        </div>
                    </div>
                </Form>
            </>}
        </div>
    )
}

export default FaitSummary;