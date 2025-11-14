import React, { useState, useEffect } from "react";
import { Modal, Input } from "antd";
import PaymentsKycDetails from "./kyckybrequirements/index";
import CustomButton from "../../../core/button/button";
import CryptoAddForm from "./cryptoAddForm";
import { useDispatch, useSelector } from "react-redux";
import CriptoFiatLoader from "../../../core/skeleton/cripto.fiat.loader";
import kycIdentity from "../../../assets/images/kyc identity.png"
import successImg from "../../../assets/images/gifSuccess.gif"; // Assuming this path is correct
import { fetchVaults, setIsSenderApproved } from "./payout.accordion.reducer";
import { useOutletContext } from "react-router";

// --- Success Components ---
const SuccessMessage = () => {
    return (
        <div className="flex flex-col gap-2">
            <span>Payment Initiation Request submitted successfully.</span>
            <span className="text-[14px] text-summaryLabelGrey">
                <span className="text-500">Note:&nbsp;</span> You will be notified once
                your request is processed. This may take few minutes.
            </span>
        </div>
    );
};
// Modified to accept handleOk as a prop
const SuccessComponent = ({ handleOk }) => {
    return (
        <div className="lg:px-2 py-0 md:px-6 sm:px-2 text-secondaryColor border-0 success-drawer">
            <div className=" ">
                <div className="basicinfo-form rounded-5 pb-9">
                    <div className="text-center relative">
                        <div className=" h-[262px]">
                            <div className="w-[260px] mx-auto relative">
                                <img
                                    src={successImg}
                                    className="mx-auto absolute  h-24 w-24 left-20 top-[149px] "
                                    alt=""
                                />
                            </div>
                        </div>
                        <h2 className="text-base font-semibold text-titleColor text-center md:w-64 w-full mx-auto">
                            <SuccessMessage />
                        </h2>
                        <div className="text-center mb-9 mt-5">
                            <div className='flex items-center justify-center mb-9 mt-5 gap-2'>
                                <CustomButton type='primary' className={''} onClick={handleOk}>Ok</CustomButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- Main Component ---
const KycKybPayments = () => {
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [showPaymentsKyc, setShowPaymentsKyc] = useState(false);
    const [showCryptoForm, setShowCryptoForm] = useState(false);
    const dispatch = useDispatch();
      const { setNetworkLu } = useOutletContext();
    // New state to manage the success screen visibility
    const [showSuccessComponent, setShowSuccessComponent] = useState(false);

    const vaults = useSelector((state) => state.payoutAccordianReducer.vaults);

    const selectedCoin = useSelector(
        (storeInfo) => storeInfo?.payoutAccordianReducer?.selectedCryptoCoin
    );

    const isSenderStatus = useSelector(
        (storeInfo) => storeInfo?.payoutAccordianReducer?.isSenderApproved
    );
    useEffect(() => {
        if (isSenderStatus === null) {
            setShowTermsModal(false);
            setIsChecked(false);
            setShowPaymentsKyc(false);
            setShowCryptoForm(false);
            setShowSuccessComponent(false); // Reset new state on status change
        }
    }, [selectedCoin, isSenderStatus]);

    useEffect(()=>{
        if(!showCryptoForm){
            setNetworkLu(selectedCoin?.networks?.[0])
        }
    },[showCryptoForm,selectedCoin])

    const handleEnableClick = () => {
        setShowTermsModal(true)
        setIsChecked(false);
    };

    const handleTermsRead = () => {
        setShowTermsModal(false);
        setShowPaymentsKyc(true);
    };

    const handleSaveKyc = () => {
        setShowPaymentsKyc(false);
        // Show success component after saving KYC
        setShowSuccessComponent(true);
    };

    // New handler for the "Ok" button in the SuccessComponent
    const handleOk = () => {
        setShowSuccessComponent(false); // Hide success component
        setShowCryptoForm(true);       // Show CryptoAddForm
        dispatch(fetchVaults({ screenName: 'payoutcrypto' }));
    };

    return (
        <>
            {vaults?.loader && <CriptoFiatLoader />}
            {!vaults?.loader && <div className="flex flex-col justify-center min-h-[50vh]">

                {/* Initial State */}
                {!showPaymentsKyc && !showCryptoForm && !showSuccessComponent && (
                    <div className="flex flex-col items-center">
                        <div className="mb-4">
                            <svg className="w-20 text-paraColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 761" fill="none">
                                <path d="M768.349 421.108C775.558 411.839 779.059 399.892 775.867 387.706L681.222 28.9685C675.729 8.23342 654.41 -4.19265 633.71 1.29946L28.9387 160.757C8.30713 166.215 -4.15395 187.603 1.26972 208.303L95.9151 567.006C101.339 587.706 122.76 600.133 143.461 594.71L357.159 538.342V658.459C357.159 725.64 468.487 760.794 578.546 760.794C688.536 760.794 800.001 725.64 800.001 658.46V476.309C800 454.44 788.019 436.04 768.349 421.108ZM699.862 297.455L709.748 334.805L589.528 366.559L579.711 329.141L699.862 297.455ZM630.106 61.1349L648.883 132.265L461.069 181.836L442.292 110.706L630.106 61.1349ZM545.829 338.065L555.441 374.591C510.985 376.582 467.731 384.34 432.99 397.591L425.644 369.853L545.829 338.065ZM127.291 488.426L117.473 451.145L237.658 419.355L247.544 456.842L127.291 488.426ZM271.542 410.465L391.658 378.711L400.755 412.937C397.836 414.723 395.091 416.575 392.412 418.464L281.359 447.78L271.542 410.465ZM759.905 655.505C759.905 694.674 678.752 726.395 578.546 726.395C478.443 726.395 397.22 694.64 397.22 655.505V611.393C397.22 609.916 398.078 608.578 398.318 607.171C404.051 644.315 482.115 673.768 578.546 673.768C675.01 673.768 753.108 644.314 758.807 607.171C759.047 608.578 759.905 609.918 759.905 611.393V655.505ZM759.905 568.721C759.905 607.857 678.752 639.576 578.546 639.576C478.443 639.576 397.22 607.857 397.22 568.721V524.609C397.22 523.167 398.078 521.794 398.318 520.387C404.051 557.497 482.115 587.02 578.546 587.02C675.01 587.02 753.108 557.497 758.807 520.387C759.047 521.794 759.905 523.167 759.905 524.609V568.721ZM578.544 547.128C478.442 547.128 397.219 515.409 397.219 476.307C397.219 437.207 478.440 405.487 578.544 405.487C678.750 405.487 759.903 437.207 759.903 476.307C759.905 515.409 678.750 547.128 578.544 547.128Z" fill="#94A3BB" />
                            </svg>
                            {/* <img src={kycIdentity} alt="" className="w-32" /> */}
                        </div>
                        {/* <h1 className="text-subTextColor font-semibold text-3xl mb-4">Title</h1> */}
                        <p className="text-paraColor max-w-2xl text-center mb-8 font-normal">
                            Please click the button below to enable payments and proceed with your application. You must complete all the KYC or KYB requirements to continue. After reading and accepting the Terms and Conditions, you can upload your details and finalize the registration process.
                        </p>
                        <CustomButton
                            type="primary"
                            size="large"
                            onClick={handleEnableClick}
                        >
                            Click here to enable
                        </CustomButton>
                    </div>
                )}

                {/* Terms Modal */}
                <Modal
                    title={
                        <span className="text-subTextColor text-xl font-semibold">
                            Terms And Conditions
                        </span>
                    }
                    open={showTermsModal}
                    closeIcon={
                        <button>
                            <span className="icon lg close cursor-pointer" title="close"></span>
                        </button>
                    }
                    footer={[
                        <CustomButton
                            key="submit"
                            type="primary"
                            disabled={!isChecked}
                            onClick={handleTermsRead}
                        >
                            I've Read
                        </CustomButton>,
                    ]}
                    onCancel={() => setShowTermsModal(false)}
                    centered
                >
                    <div>
                        <div className="mb-4 mt-4">
                            <div className="text-paraColor font-normal custom-modal-text ">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: selectedCoin?.note
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <label className="flex items-start gap-2 custom-checkbox c-pointer cust-check-outline">
                                <input
                                    id="accept_terms"
                                    name="isAccepted"
                                    type="checkbox"
                                    className="c-pointer"
                                    checked={isChecked}
                                    onChange={(e) => setIsChecked(e.target.checked)}
                                />
                                <span></span>
                                <span
                                    className="text-sm font-normal text-descriptionGreyTwo !mb-0 cursor-pointer"
                                >
                                    I Agree To The Terms And Conditions
                                </span>
                            </label>
                        </div>
                    </div>
                </Modal>

                {/* Payments KYC/KYB Details */}
                {showPaymentsKyc && <PaymentsKycDetails handleSaveKyc={handleSaveKyc} />}

                {/* Success Component */}
                {/* Render SuccessComponent when showSuccessComponent is true */}
                {showSuccessComponent && <SuccessComponent handleOk={handleOk} />}

                {/* Crypto Add Form */}
                {showCryptoForm && <CryptoAddForm />}
            </div>}
        </>
    );
};

export default KycKybPayments;