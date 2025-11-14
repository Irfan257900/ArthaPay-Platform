import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setPayee, setWithdrawObj, setWithdrawSaveObj } from "../../../reducers/vaults.reducer";
import successImg from '../../../assets/images/gifSuccess.gif';
import CustomButton from '../../../core/button/button';
import { useTranslation } from "react-i18next";
import { useCallback, useEffect } from "react";
import NumericText from "../../../core/shared/numericText";
import AppDefaults from "../../../utils/app.config";

const Success = () => {
    const navigate = useNavigate();
    const withdrawDetails = useSelector((store) => store?.withdrawReducer?.withdrawSaveObj);
    const selectedCoin = useSelector((storeInfo) => storeInfo?.vaultsAccordion?.selectedCoin);
    const params = useParams();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const gotoWithDraw = useCallback(() => {
        dispatch(setWithdrawSaveObj(null));
        navigate(`/wallets/crypto/withdraw/${selectedCoin?.code}/${params?.mrctid}/${params?.custid}`);
    }, [selectedCoin, params])
    return (
        <div className="panel-card buy-card rounded-5 bg-rightincard !pt-0">
            <div className=''>
                <div className='text-center relative'>
                    <div className=' bg-no-repeat bg-cover h-[200px]'>
                        <div className='w-[260px] mx-auto relative'>
                            <img src={successImg} className='mx-auto absolute w-24 h-24 top-14 right-[88px]' alt="" />
                        </div>
                    </div>
                       <p className="text-xl  font-medium  text-subTextColor text-center px-4"> Your withdrawal request for <span>{ <NumericText value={withdrawDetails?.amount} thousandSeparator={true} fixedDecimalScale={AppDefaults.cryptoDecimals}/>} {withdrawDetails?.walletCode} </span> has been submitted and is now being processed.
                         You will receive a final confirmation once the transaction is complete.
                    </p>
                    <p className="text-xl  font-medium text-subTextColor text-center px-4"></p>
                    <div className='flex items-center justify-center mb-9 mt-5 gap-2'>
                        <div className="secondary-outline !px-4 !items-center cursor-pointer" onClick={gotoWithDraw}><span className="icon lg btn-arrow-back cursor-pointer !mr-2"></span><span className="text-base font-medium">Back to Wallets</span></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Success;
