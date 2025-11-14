import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { getFiatCurrencyDetails } from "../../httpServices";
import CopyComponent from "../../../../core/shared/copyComponent";
import FiatRightboxLoader from "../../../../core/skeleton/vaults.fiatRight.loader";
import AppAlert from "../../../../core/shared/appAlert";
import AppEmpty from "../../../../core/shared/appEmpty";
import { decryptAES } from "../../../../core/shared/encrypt.decrypt";
import { useSelector } from "react-redux";

function FiatDetails() {
    const { currency } = useParams();
    const [details, setDetails] = useState([]);
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState(null);
    const isRefreshLeftPanel = useSelector(
        (storeInfo) => storeInfo?.withdrawFiat?.isRefreshLeftPanel
    );
    useEffect(() => {
        if (currency && currency !== 'undefined' && currency !== 'null') {
            getDetails();
        }
    }, [currency]);
    useEffect(()=>{
        if(isRefreshLeftPanel){
            getDetails();
        }
    },[isRefreshLeftPanel]);

    const getDetails = useCallback(async () => {
        await getFiatCurrencyDetails(setDetails, setLoader, setError, currency)
    }, [currency]);
    const closeError = useCallback(() => {
        setError("")
    }, []);
    return (
        <>
            {error && (<div className="px-4">
                <div className="alert-flex withdraw-alert fiat-alert">
                    <AppAlert
                        type="error"
                        description={error}
                        onClose={closeError}
                        showIcon
                    />
                    <span className="icon sm alert-close" onClick={() => setError(null)}></span>
                </div>
            </div>

            )}


            {loader && <FiatRightboxLoader />}
            {(!loader && details?.length > 0) && <div>
                <div className="mt-5 p-4 bg-bgblack border border-dashed border-StrokeColor rounded-5 md:w-96 mx-auto w-full mb-7">

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-0.5">
                            <h2 className="lg:text-sm md:text-sm xl:text-lg 2xl:text-lg font-semibold text-subTextColor">Customer ID</h2>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <h2 className="lg:text-sm md:text-sm xl:text-lg 2xl:text-lg font-semibold text-subTextColor">{' '}<CopyComponent text={decryptAES(details[0]?.reference)} shouldTruncate={false} textClass="lg:text-sm md:text-sm xl:text-lg 2xl:text-lg font-semibold text-subTextColor mr-1" /></h2>
                        </div>
                    </div>
                </div>

                {details?.map((item) => (
                    <div className="  mb-6" key={item?.id}>
                        <div className="mt-5 bg-menuhover border border-StrokeColor dark:border-Borderbr p-3 rounded-5">
                            <h2 className="text-xl font-semibold text-titleColor mb-2 capitalize ">{item?.name}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="">
                                    <p className="text-labelGrey text-sm font-normal">Beneficiary Name</p>
                                    <p className="text-subTextColor text-sm font-semibold">{item?.beneficiaryName}</p>
                                </div>
                                <div className="">
                                    <p className="text-labelGrey text-sm font-normal">Bank Account Number / IBAN</p>
                                    <p className="text-subTextColor text-sm font-semibold"><CopyComponent text={decryptAES(item?.accountOrIbanNumber)} shouldTruncate={false} textClass="mr-1 text-subTextColor text-sm font-semibold" /></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                <div>
                                    <h2 className="text-lg font-semibold text-titleColor mb-2 capitalize">For domestic wires</h2>
                                    <div className="">
                                        <p className="text-labelGrey text-sm font-normal">Routing Number</p>
                                        <p className="text-subTextColor text-sm font-semibold">{item?.routingNumber ? <CopyComponent text={item?.routingNumber} shouldTruncate={false} textClass="mr-1 text-subTextColor text-sm font-semibold" /> : '--'}</p>
                                    </div>
                                    {/* <div className="mt-2">
                                        <p className="text-labelGrey text-sm font-normal">Reference No</p>
                                        <p className="text-subTextColor text-sm font-semibold"><CopyComponent text={decryptAES(item?.reference)} shouldTruncate={false} /></p>
                                    </div> */}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-titleColor mb-2 capitalize">For international wires</h2>
                                    <div className="grid md:grid-cols-1 gap-4">
                                        <div className="">
                                            <p className="text-labelGrey text-sm font-normal">Swift/BIC Code</p>
                                            <p className="text-subTextColor text-sm font-semibold"><CopyComponent text={item?.swiftOrBicCode} shouldTruncate={false} textClass="mr-1 text-subTextColor text-sm font-semibold" /></p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="">
                                        <p className="text-labelGrey text-sm font-normal">Bank Address</p>
                                        <p className="text-subTextColor text-sm font-semibold">{item?.address}</p>
                                    </div>
                                </div>
                                     {/* <div>
                                    <div className="">
                                        <p className="text-labelGrey text-sm font-normal">Postal Code</p>
                                        <p className="text-subTextColor text-sm font-semibold">{item?.postalCode}</p>
                                    </div>
                                    
                                </div> */}
                                <div>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
                <div className="mt-6">
                    <p className="text-paraColor text-sm font-normal">Please choose the currency you would like deposit in, and bank account details for the currency chosen will be
                        display. The next step is for you to wire your funds to the bank details provided and remember to include the
                        reference number.</p>
                </div>
                <div className="mt-4 mb-6">
                    <h2 className="text-2xl font-semibold text-titleColor mb-1">Important :</h2>
                    <p className="text-paraColor text-sm font-normal">
                         Please include your <b>Customer ID </b>that identifies your deposit, and make sure to include this ID in<b> the transaction description or purpose</b> when submitting the wire transfer.
                    </p>
                </div>
            </div>}
            {(details?.length <= 0 && !loader) && <AppEmpty />}
        </>
    );
}

export default FiatDetails