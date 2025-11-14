
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import AddressList from '../../../../core/shared/payees';
import AppAlert from '../../../../core/shared/appAlert';
import { saveFiatWithdrawl } from './httpServices';
import { setPayeeFiat, setWithdrawFiatSaveObj } from './withdrawFiatReducer';
const FiatPayees = () => {
    const payeeLu = [];
    const _witdrawDetails = useSelector((store) => store?.withdrawFiat?.withdrawObj);
    const withdrawSaveDetails = useSelector((store) => store?.withdrawFiat?.withdrawSaveObj);
    const userInfo = useSelector((storeInfo) => storeInfo?.userConfig?.details);
    const selectedCoin = useSelector((storeInfo) => storeInfo?.withdrawFiat?.selectedCoin);
    const [selectedPayee, setSelectedPayee] = useState(null);
    const [loader, setLoader] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const handleSelection = useCallback(
        (selectedPayee) => {
            setSelectedPayee(selectedPayee);
            dispatch(setPayeeFiat(selectedPayee));
        },
        [dispatch]
    );
    const handleBackArrow = useCallback(() => {
        navigate(`/wallets/crypto/${selectedCoin?.coin}/${params?.mrctid}/${params?.custid}/withdraw`);
    }, []);
    // const handleFormSubmission = useCallback(async () => {
    //     setLoader(true);
    //     try {
    //         let saveObj = {
    //             payeeId: selectedPayee?.id,
    //             fiatWalletId: selectedCoin?.id,
    //             amount: _witdrawDetails?.amount,
    //         };
    //         dispatch(setWithdrawFiatSaveObj(saveObj));
    //         let response = await saveFiatWithdrawl(saveObj);
    //         if (response?.respone) {
    //             dispatch(setWithdrawFiatSaveObj(response?.respone));
    //             navigate(`/wallets/fiat/withdraw/${selectedCoin?.code}/${selectedCoin?.id}/summary`);
    //         } else if (response?.error) {
    //             setErrorMsg(response?.error);
    //         }
    //     } catch (error) {
    //         setErrorMsg(error.message || error);
    //     } finally {
    //         setLoader(false);
    //     }
    // }, [dispatch, navigate, selectedPayee, userInfo, selectedCoin, _witdrawDetails]);

    const closeErrorMessage = useCallback(() => {
        setErrorMsg(null)
    }, [])
    return (
        <>
            {errorMsg !== undefined && errorMsg !== null && (
                <div className="alert-flex withdraw-alert fiat-alert">
                    <AppAlert
                        type="error"
                        description={errorMsg}
                        showIcon
                    />
                    <span className="icon sm alert-close" onClick={closeErrorMessage}></span>
                </div>
            )}
            <AddressList
                coinSearch={true}
                coinsRefresh={false}
                addressList={payeeLu}
                reDirectToSumrry={handleSelection}
                coinForDropDowns={selectedCoin?.code}
                screenType={"fiat"}
                reDirectToTransferAmount={handleBackArrow}
                withdrawObj={_witdrawDetails}
                network={_witdrawDetails?.networkName}
                selectedPayeeId={withdrawSaveDetails?.addressBookId}
                // handleFormSubmission={handleFormSubmission}
                loading={loader}
                selectedPayee={selectedPayee}
                feature=''
            />
        </>
    )
}
export default FiatPayees