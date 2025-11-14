import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import successImg from '../../../../assets/images/gifSuccess.gif';
import CustomButton from '../../../../core/button/button';
import { useTranslation } from "react-i18next";
import { setRefreshLeftPanel, setRefreshTransactionGrid, setWithdrawFiatSaveObj } from "./withdrawFiatReducer";
import { useCallback, useEffect } from "react";
import AppDefaults from "../../../../utils/app.config";
import NumericText from "../../../../core/shared/numericText";
const FiatSuccess = () => {
    const navigate = useNavigate();
    const withdrawDetails = useSelector((store) => store?.withdrawFiat?.withdrawSaveObj);
    const selectedCoin = useSelector((storeInfo) => storeInfo?.withdrawFiat?.selectedCoin);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    useEffect(() => {
        dispatch(setRefreshLeftPanel(false));
        dispatch(setRefreshTransactionGrid(true));
    }, [])
    const gotoWithDraw = useCallback(() => {
        dispatch(setWithdrawFiatSaveObj(null));
        navigate(`/wallets/fiat/withdraw/${selectedCoin?.code}`);
    }, []);
    return (
        <div className="panel-card buy-card rounded-5 bg-rightincard border border-rightincardBr !pt-0">
            <div className=''>
                <div className='text-center relative'>
                    <div className='bg-SuccessBg bg-no-repeat bg-cover h-[200px]'>
                        <div className='w-[260px] mx-auto relative'>
                            <img src={successImg} className='mx-auto absolute w-24 h-24 top-14 right-[88px]' alt="" />
                        </div>
                    </div>
                    {/* <p className="text-xl  font-medium  text-subTextColor text-center px-4">{t('vault.vaultscrypto.Successdescription')} {withdrawDetails?.amount?.toLocaleString(undefined, { maximumFractionDigits: 8 })}  {t('vault.vaultscrypto.is')}</p> */}
                    <p className="text-xl  font-medium  text-subTextColor text-center px-4"> Your withdrawal request for <span><NumericText value={withdrawDetails?.amount} type="text" thousandSeparator={true} decimalScale={AppDefaults.fiatDecimals} fixedDecimalScale={AppDefaults.fiatDecimals}/> {selectedCoin?.code} </span> has been submitted and is now being processed.
                         You will receive a final confirmation once the transaction is complete.
                    </p>
                
                    <div className='flex items-center justify-center mb-9 mt-5 gap-2'>
                        <div className="secondary-outline !px-4 !items-center cursor-pointer" onClick={gotoWithDraw}><span className="icon lg btn-arrow-back cursor-pointer !mr-2"></span><span className="text-base font-medium">Back to Wallets</span></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default FiatSuccess;
