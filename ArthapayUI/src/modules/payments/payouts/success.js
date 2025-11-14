
import successImg from '../../../assets/images/gifSuccess.gif';
import CustomButton from '../../../core/button/button';
import { useDispatch, useSelector } from "react-redux";
import { clearFormData, fetchKpisData, setCryptoDetailsRefresh, setFiatIsRefresh } from '../reducers/payout.reducer'
import { useCallback } from 'react';
import { fetchVaults } from './payout.accordion.reducer';
import { useParams } from 'react-router';
import NumericText from '../../../core/shared/numericText';
import AppDefaults from '../../../utils/app.config';
const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED;

const Success = () => {
    const dispatch = useDispatch();
    const { currencyType } = useParams();
    const payoutSummary = useSelector((store) => store.payoutReducer);
    const getScreenName = () => (currencyType === "fiat" ? "payoutfiat" : "payoutcrypto");
    const navigateToPayouts = useCallback(() => {
        dispatch(clearFormData());
        dispatch(setFiatIsRefresh(true));
        dispatch(setCryptoDetailsRefresh(true));
        dispatch(fetchKpisData({ showLoading: false }));
        dispatch(fetchVaults({ screenName: getScreenName() }));
    }, [])
    return (
        <div className="panel-card buy-card rounded-5 bg-rightincard border border-rightincardBr !pt-0">
            <div className=''>
                <div className='text-center relative'>
                    <div className='bg-SuccessBg bg-no-repeat bg-cover'>
                        <div className=' mx-auto relative'>
                            <img src={successImg} className='mx-auto  h-28 w-28' alt="" />
                        </div>
                    </div>
                    <p className="text-md  font-semibold text-subTextColor text-center">Your payout transaction for <NumericText value={payoutSummary?.requestedAmount} decimalScale={currencyType !== 'fiat' ? AppDefaults?.cryptoDecimals :  AppDefaults?.fiatDecimals} thousandSeparator={true} fixedDecimals={true}  isdecimalsmall={Smalldecimals === "true" ? true : false}/> {`${payoutSummary?.currency}`} <br />
                        has been submitted successfully </p>
                    <div className='md:max-w-[400px] mx-auto mt-5 p-2 md:p-0'>
                        <CustomButton type='primary' className={'w-full'} onClick={navigateToPayouts}>Ok</CustomButton>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Success;
