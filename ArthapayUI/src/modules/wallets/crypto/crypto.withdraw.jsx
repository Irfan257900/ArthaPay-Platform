import React, { useCallback, useEffect, useState } from 'react'
import { Typography } from 'antd'
import { useDispatch, useSelector } from 'react-redux';
import { setWithdrawObj, setPayee, setWithdrawSaveObj, setSelectedNetWork, setIsSelectionFromRightPanel } from '../../../reducers/vaults.reducer';
import { useNavigate, useParams } from 'react-router';
import AppAlert from '../../../core/shared/appAlert';
import { getVerificationFields } from '../../../core/verification.component/http.services'
import { setSelectedCoin } from '../vaultAccordianReducer';
import WithdrawWidget from '../../../core/shared/withdraw.widget';
import ActionWidgetLoader from '../../../core/skeleton/actionWidgets.loader';
import { saveWithdrawl } from '../httpServices';
import VerificationsHandler from '../../../core/verifications.handler';
import CriptoFiatLoader from '../../../core/skeleton/cripto.fiat.loader';
function CryptoWithdraw() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const { Text } = Typography;
    const [loading, setLoading] = useState(null);
    const [networkLu, setNetworkLu] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [verificationLoader, setVerificationLoader] = useState(true);
    const [isVerification, setIsVerification] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const userInfo = useSelector((storeInfo) => storeInfo?.userConfig?.details);
    const merchantsDetails = useSelector((storeInfo) => storeInfo?.vaultsAccordion?.selectedVault?.assets);
    const selectedNetworks = useSelector((storeInfo) => storeInfo?.withdrawReducer?.networks);
    const selectedCoin = useSelector((storeInfo) => storeInfo?.vaultsAccordion?.selectedCoin);
    const payeeInfo = useSelector((storeInfo) => storeInfo?.withdrawReducer?.selectedPayee);
    const selectedNetworkCoin = useSelector((storeInfo) => storeInfo?.withdrawReducer?.selectedNetwork);
    const _witdrawDetails = useSelector((store) => store?.withdrawReducer?.withdrawObj);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (selectedCoin && !_witdrawDetails && selectedNetworks?.length > 0) {
            setNetworkLu(selectedNetworks);
            setSelectedNetwork(selectedNetworks?.[0]);
            dispatch(setSelectedNetWork(selectedNetworks?.[0]));
            dispatch(setWithdrawObj(null));
            dispatch(setPayee(null));
            dispatch(setWithdrawSaveObj(null));
        }
        setLoading(false);
    }, [userInfo?.id, selectedNetworks, _witdrawDetails]);
    useEffect(() => {
        if (_witdrawDetails) {
            setNetworkLu(selectedNetworks);
            setSelectedNetwork(selectedNetworks?.[0]);
            dispatch(setSelectedNetWork(selectedNetworks?.[0]));
        }
    }, [selectedNetworks, _witdrawDetails, dispatch, selectedNetworks])
    useEffect(() => {
        getVerification();
    }, [])
    const getVerification = async () => {
        try {
            setVerificationLoader(true);
            let response = await getVerificationFields();
            if (response?.data) {
                const allFalseOrNull = Object.entries(response?.data).every(([, value]) => value === false || value === null);
                setIsVerification(!allFalseOrNull);
            } else {
                setErrorMsg("Without Verifications you can't withdraw.Please select withdraw verifications from security section");
            }
        } catch (error) {
            setErrorMsg(error?.errorMsg);
        } finally {
            setVerificationLoader(false);
        }
    };
    const handleFormSubmission = useCallback(async (values) => {
        try {
            setSaving(true);
            let saveObj = { ...values };
            dispatch(setWithdrawObj(saveObj));
            let savedObj = {
                "payeeId": payeeInfo?.id,
                "cryptorWalletId": selectedNetworkCoin?.id,
                "amount": values?.amount
            }
            dispatch(setWithdrawSaveObj(savedObj));
            let response = await saveWithdrawl(savedObj);
            if (response?.respone) {
                dispatch(setWithdrawSaveObj(response?.respone));
                navigate(`/wallets/crypto/withdraw/${selectedCoin?.code}/${params?.mrctid}/${params?.custid}/summary`);
            }
            else if (response?.error) {
                setErrorMsg(response?.error);
            }
        } catch (error) {
            setErrorMsg(error.message);
        }
        finally {
            setSaving(false);
        }
    }, [selectedCoin?.code, params, selectedNetwork?.name, payeeInfo, selectedNetworkCoin, saveWithdrawl]);

    const handleCurrency = useCallback((selectedCoin) => {
        setNetworkLu(null)
        setSelectedNetwork(null)
        setLoading(true)
        dispatch(setSelectedCoin(selectedCoin));
        dispatch(setIsSelectionFromRightPanel(true));
    }, []);
    const handleNetwork = useCallback((selectedNetWork) => {
        setSelectedNetwork(selectedNetWork)
        dispatch(setSelectedNetWork(selectedNetWork));
        dispatch(setPayee(null));
    }, []);

    const closeErrorHandler = useCallback(() => {
        setErrorMsg(null)
    }, [])

    return (
        <div className=''>
            {errorMsg !== undefined && errorMsg !== null && (
                <div className="alert-flex withdraw-alert fiat-alert">
                    <AppAlert
                        type="error"
                        description={errorMsg}
                        showIcon
                    />
                    <button className="icon sm alert-close" onClick={() => setErrorMsg(null)}></button>
                </div>
            )}
            {/* {verificationLoader && <ActionWidgetLoader />} */}
            {/* {!isVerification && !verificationLoader &&
                <div className='px-3'>
                    <div className="alert-flex withdraw-alert fiat-alert">
                        <AppAlert
                            type="error"
                            description={
                                <Text className="ant-alert-description">
                                    Without verifications, you can't proceed. Please complete the
                                    required verifications in the{" "}
                                    <a onClick={() => { navigate(`/profile/security`) }}> security section.</a>
                                </Text>
                            }
                            onClose={closeErrorHandler}
                            showIcon
                        />
                    </div>
                </div>
            } */}
            <VerificationsHandler loader={<CriptoFiatLoader />}>
                <WithdrawWidget
                    coins={merchantsDetails}
                    networks={networkLu}
                    loadingNetworks={loading}
                    onCurrencyChange={handleCurrency}
                    onNetworkChange={handleNetwork}
                    onSubmit={handleFormSubmission}
                    defaultCoin={selectedCoin?.code}
                    selectedCoin={selectedCoin?.code}
                    selectedNetwork={selectedNetwork}
                    defaultFormValues={_witdrawDetails}
                    defaultNetwork={selectedNetwork?.code}
                    shouldDisplayPayees={true}
                    saving={saving}
                    

                />
            </VerificationsHandler>
        </div>
    )
}

export default CryptoWithdraw