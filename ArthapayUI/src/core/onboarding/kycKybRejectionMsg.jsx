import { useSelector } from "react-redux";
import closeImage from "../../assets/images/rejected.svg";
const KycKybRejectionMsg = ({ accountType, supportEmail, handleReKycKyb }) => {
    const kycorkyb = accountType === 'Business' ? 'KYB' : 'KYC';
    const userProfile = useSelector((store) => store.userConfig.details || {});
    return (
        <div className="flex justify-center">
            <div className="py-6 w-full max-w-[700px] text-center">
                <div className="flex justify-center mb-6">
                    <img src={closeImage} alt="KYC Rejected" className="w-20 h-20" />
                </div>
                <h2 className="text-2xl font-semibold text-subTextColor text-center mb-3">
                    {`${kycorkyb} Verification Rejected`}
                </h2>
                <p className="text-base font-medium text-subTextColor text-center">
                    {userProfile?.kycRemarks && <p className="text-lg  text-subTextColor text-center mb-4"><span className="text-textLightRed font-semibold text-lg">Reason</span> : {userProfile?.kycRemarks}</p>}
                </p>
                <p className="text-base font-medium text-subTextColor text-center">
                    {`We regret to inform you that your ${kycorkyb} details have been reviewed and rejected.`}
                </p>
                <p className='text-base font-medium text-subTextColor text-center mb-4'>
                    Unfortunately, your account will not be verified.
                </p>
                <p className="text-base font-medium text-subTextColor text-center mb-8">
                    For further assistance, please contact our support team at <a
                        className="text-primaryColor hover:text-primaryColor"
                        href={`mailto:${supportEmail}`}
                    >
                        {supportEmail}
                    </a>.
                    Thank you for your understanding.
                </p>
                {!userProfile?.reKYC && <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                    <button
                        onClick={() => window.location.reload()}
                        className="active bg-primaryColor text-lightDark px-6 py-2.5 text-sm rounded-md font-medium shadow transition"
                    >
                        Refresh Page
                    </button>
                </div>}
                {userProfile?.kycStatus?.toLowerCase() === 'rejected' && userProfile?.reKYC?.toLowerCase() == "reapply" && <div className="flex justify-center">
                    <button
                        onClick={handleReKycKyb}
                        className="active bg-primaryColor text-lightDark px-6 py-2.5 text-sm rounded-md font-medium shadow transition"
                    >
                        Resubmit {kycorkyb}
                    </button>
                </div>}
            </div>
        </div>
    );
};

export default KycKybRejectionMsg;
