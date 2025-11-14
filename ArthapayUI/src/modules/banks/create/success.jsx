;
import CustomButton from "../../../core/button/button";
import successImg from "../../../assets/images/gifSuccess.gif";
import { getAccounts } from "../../../reducers/accounts.reducer";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { setAdditionalInfo, setAddressInformation, setDirectorBenficiaries, setKycDocInfo, setSelector, setType, setUboBenficiaries } from "../../../reducers/banks.reducer";
const SuccessMessage = () => {
    return (
        <div className="flex flex-col gap-2">
            <span>Account Creation request submitted successfully</span>
            <span className="text-[14px] text-summaryLabelGrey">
                <span className="text-500">Note:&nbsp;</span> You will be notified once
                your request is processed. This may take few minutes.
            </span>
        </div>
    );
};
const SuccessComponent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(setKycDocInfo([]))
        dispatch(setAdditionalInfo(null))
        dispatch(setUboBenficiaries([]))
        dispatch(setDirectorBenficiaries([]))
        dispatch(setSelector(null))
        dispatch(setType(null))
        dispatch(setAddressInformation([]))
    }, [dispatch]);
    const handleOk = useCallback(() => {
        dispatch(getAccounts())
        navigate('/banks/deposit')
    }, [])
    return (
        <div className="lg:px-2 py-0 md:px-6 sm:px-2 text-secondaryColor mt-6 border-0 success-drawer">
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

export default SuccessComponent;
