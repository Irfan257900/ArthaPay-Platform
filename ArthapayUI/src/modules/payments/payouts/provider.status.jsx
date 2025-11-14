import grediantBlue from "../../../assets/images/grediantbluebg.svg";
import grediantYellow from "../../../assets/images/grediantyellowbg.svg";
import creatAccount from "../../../assets/images/creat-account.svg";
const ProviderStatus = () => {
    return (
        <div className='px-3.5 py-10 border border-StrokeColor mt-4'>
            <div className='flex justify-center items-center'>
                <div className='text-center'>
                    <div className='relative'>
                        <div className='absolute top-[-50px] left-[24px]'><img src={grediantBlue} alt="" /></div>
                        <div className='absolute bottom-[-44px] right-[30px]'><img src={grediantYellow} alt="" /></div>
                        <div className='w-[142px] h-[142px] !bg-BlackBg mx-auto'><img src={creatAccount} alt="" className='mx-auto' /></div>
                    </div>
                    <div className='mt-4'>
                        <h4 className='text-subTextColor text-3xl font-semibold'>Pending</h4>
                        <p className='text-base text-paraColor font-semibold'>
                            Your account is currently pending approval from the provider.
                            <br /> We will notify you once your account is approved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProviderStatus;