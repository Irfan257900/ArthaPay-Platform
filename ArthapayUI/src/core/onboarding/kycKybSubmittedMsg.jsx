import success from '../../assets/images/success.svg';
export const KycSubmitted = ({ accountType }) => {
    const kycorkyb = accountType === 'Business' ? 'KYB' : 'KYC';
    return (
        <div className="flex justify-center">
            <div className="py-6 w-full max-w-[700px] text-center">
                <div className="flex justify-center mb-6">
                    <img src={success} alt="KYC Submitted" className="w-20 h-20" />
                </div>
                <h2 className="text-2xl font-semibold text-subTextColor text-center mb-3">
                    {`Your ${kycorkyb} details are submitted successfully!`}
                </h2>
                <p className="text-base font-medium text-subTextColor text-center">
                    {`Your ${kycorkyb} details have been submitted successfully and are currently under review.`}
                </p>
                <p className='text-base font-medium text-subTextColor text-center mb-4'>
                     Once your information is verified and approved, we will notify you.
                </p>
                <p className="text-base font-medium text-subTextColor text-center mb-8">
                    You can continue by refreshing the page or logging in again. <br/> Thank you for your patience.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                    <button
                        onClick={() => window.location.reload()}
                        className="active bg-primaryColor text-lightDark px-6 py-2.5 text-sm rounded-md font-medium shadow transition"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        </div>
    );
};