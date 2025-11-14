import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import React, { useCallback, useEffect } from 'react';
import CustomButton from '../../../core/button/button';
import successImg from '../../../assets/images/gifSuccess.gif';
import { resetState, setTriggerFlag ,getAccounts} from "../../../reducers/banks.widthdraw.reducer";
import numberFormatter from "../../../utils/numberFormatter";
import NumericText from "../../../core/shared/numericText";
import AppDefaults from "../../../utils/app.config";

const SuccessTransfer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currency } = useParams();
    const summary = useSelector((state) => state.transferReducer.summary?.data);

    const redirectHandler = useCallback(() => {
        navigate(`/banks/withdraw/${currency}`);
        dispatch(getAccounts({ step: 'init' }));
        dispatch(setTriggerFlag(false));
    }, [currency, navigate, dispatch]);

    useEffect(() => {
        dispatch(resetState(['selectedPayee']));
    }, [dispatch]);
const getBalanceText = (amount, isSuffix, isOnlyAmount) => {
      const numAmount = parseFloat(amount) || 0;
      if (isNaN(numAmount)) return '0.00';
  
      const { number, suffix } = numberFormatter(numAmount) || {};
      const formattedNumber = (number ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      
      if (isSuffix) {
        return suffix || "";
      }
      if (isOnlyAmount) {
        return formattedNumber;
      }
      return `$ ${formattedNumber}`;
    };
    return (
        <div className="panel-card buy-card card-paddingrm">
            <div className="text-center relative">
                <div className='bg-SuccessBg bg-no-repeat bg-cover h-[200px]'>
                    <div className='w-[260px] mx-auto relative'>
                        <img src={successImg} className='mx-auto absolute h-24 w-24 top-14 right-[88px]' alt="Success" />
                    </div>
                </div>
                <h4 className="text-md font-semibold text-subTextColor text-center">Thank You</h4>
                    <p className="text-xl  font-medium  text-subTextColor text-center px-4"> Your withdrawal request for <span> 
                             <NumericText
                value={getBalanceText (summary?.requestedAmount, false, true) || 0}
                decimalScale={AppDefaults.fiatDecimals}
                thousandSeparator
                className="block"
                displayType="text"
                suffixText={summary?.walletCode}
              />        
                        </span> has been submitted and is now being processed.
                         You will receive a final confirmation once the transaction is complete.
                    </p>
            </div>
            <div className='flex items-center justify-center mb-9 mt-5 gap-2'>
                <p className='text-primary text-sm font-medium'>
                    <div className="secondary-outline !px-4 !items-center cursor-pointer" onClick={redirectHandler}><span className="icon lg btn-arrow-back cursor-pointer !mr-2"></span><span className="text-lg font-medium">Back to Banks</span></div>
                </p>
            </div>
        </div>
    );
};

export default SuccessTransfer;
