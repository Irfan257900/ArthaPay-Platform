import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import FiatRightboxLoader from "../../../../core/skeleton/vaults.fiatRight.loader";
import AppAlert from "../../../../core/shared/appAlert";
import AppEmpty from "../../../../core/shared/appEmpty";
import { getFiatCurrencyDetails } from "../../httpServices";
import CommonDrawer from "../../../../core/shared/drawer";
import BankDetails from "./banks.view";
import ExchangeDetails from "./wallets.view";


function PayinFiatDetails({ isModalOpen, onCancel, selectedPayinFiat }) {
    const { vaultName } = useParams();
    const [details, setDetails] = useState([]);
    const [bankDetails, setBankDetails] = useState([]);
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState(null);

    const getDetails = useCallback(async () => {
        await getFiatCurrencyDetails(setDetails, setBankDetails, setLoader, setError, vaultName, selectedPayinFiat)
    }, [vaultName, selectedPayinFiat]);

    useEffect(() => {
        if (vaultName && vaultName !== 'undefined' && vaultName !== 'null' && selectedPayinFiat) {
            getDetails();
        }
    }, [vaultName, selectedPayinFiat, getDetails]);



    const closeError = useCallback(() => setError(""), []);

    return (
        <CommonDrawer
            isOpen={isModalOpen}
            title={<h1 className="text-2xl text-titleColor font-semibold">Details</h1>}
            onClose={onCancel}
            maskClosable={false}
            className="add-merchant invoice-modal status-modal"
        >
            {error && (
                <div className="px-4">
                    <div className="alert-flex withdraw-alert fiat-alert">
                        <AppAlert
                            type="error"
                            description={error}
                            onClose={closeError}
                            showIcon
                        />
                        <button
                            className="icon sm alert-close"
                            onClick={() => setError(null)}
                            aria-label="Close alert"
                            type="button"
                        >
                        </button>
                    </div>
                </div>
            )}
            {loader && <FiatRightboxLoader />}
            {!loader && selectedPayinFiat?.type?.toLowerCase() === 'wallets' && details?.length > 0 && (
                <ExchangeDetails details={details} />
            )}
            {!loader && selectedPayinFiat?.type?.toLowerCase() === 'banks' && bankDetails?.bankList?.length > 0 && (
                <BankDetails bankList={bankDetails?.bankList} selectedPayinFiat={selectedPayinFiat} />
            )}
            {(!loader && details?.length <= 0 && (!bankDetails?.bankList || bankDetails?.bankList.length === 0)) && <AppEmpty />}
        </CommonDrawer>
    );
}

export default PayinFiatDetails;