
import React, { useCallback, useEffect, useState } from 'react';
import AddressList from '../../../core/shared/payees';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { saveWithdrawl } from '../httpServices';
import { setWithdrawSaveObj, setPayee } from '../../../reducers/vaults.reducer';
import AppAlert from '../../../core/shared/appAlert';
const Payees = () => {
    const payeeLu = [];
    const _witdrawDetails = useSelector((store) => store?.withdrawReducer?.withdrawObj);
    const withdrawSaveDetails = useSelector((store) => store?.withdrawReducer?.withdrawSaveObj);
    const payeeInfo = useSelector((storeInfo) => storeInfo?.withdrawReducer?.selectedPayee);
    const userInfo = useSelector((storeInfo) => storeInfo?.userConfig?.details);
    const selectedCoin = useSelector((storeInfo) => storeInfo?.vaultsAccordion?.selectedCoin);
    const selectedNetwork = useSelector((storeInfo) => storeInfo?.withdrawReducer?.selectedNetwork);
    const [selectedPayee, setSelectedPayee] = useState(null);
    const [loader, setLoader] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    useEffect(() => {
        if (payeeInfo) {
            setSelectedPayee(payeeInfo);
        }
    }, [])
    const handleSelection = useCallback((selectedPayee) => {
        setSelectedPayee(selectedPayee);
        dispatch(setPayee(selectedPayee));
    }, [])


    const handleBackArrow = useCallback(() => {
        navigate(`/wallets/crypto/withdraw/${selectedCoin?.code}/${params?.mrctid}/${params?.custid}`);
    }, [params, selectedCoin])

    return (
        <>
            {errorMsg !== undefined && errorMsg !== null && (
                <div className="alert-flex withdraw-alert fiat-alert">
                    <AppAlert
                        type="error"
                        description={errorMsg}
                        showIcon
                    />
                    <span className="icon sm alert-close" onClick={() => setErrorMsg(null)} ></span>

                </div>
            )}
            <AddressList
                coinSearch={true}
                coinsRefresh={false}
                addressList={payeeLu}
                reDirectToSumrry={handleSelection}
                coinForDropDowns={selectedNetwork?.coinCode}
                screenType={"crypto"}
                reDirectToTransferAmount={handleBackArrow}
                withdrawObj={_witdrawDetails}
                network={selectedNetwork?.code}
                selectedPayeeId={withdrawSaveDetails?.addressBookId}
                // handleFormSubmission={handleFormSubmission}
                 shouldDisplayPayees={true}
                loading={loader}
                selectedPayee={selectedPayee}
                feature={"Vault"}
                action={"withdraw crypto"}
            />
        </>
    )
}
export default Payees