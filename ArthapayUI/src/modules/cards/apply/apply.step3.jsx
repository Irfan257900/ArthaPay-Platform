import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import successImg from '../../../assets/images/gifSuccess.gif';
import CustomButton from '../../../core/button/button';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setRefreshLeftPanel } from '../../wallets/fiat/withdraw.components/withdrawFiatReducer';

const StepThree = (props) => {
  const navigate = useNavigate()
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {data} = useSelector((storeInfo) => storeInfo?.applyCard?.selectedCard);
  const handleNavigate = useCallback(()=>{
    props.onSuccess ? props.onSuccess?.() : navigate(`/cards/mycards`);
  },[]);
  useEffect(()=>{
    dispatch(setRefreshLeftPanel(true));
  },[])
  return (
      <div className="text-secondaryColor mt-6">
        <div className="border border-StrokeColor rounded-5 h-full">
          <div className='basicinfo-form rounded-5'>
            <div className='text-center relative'>
              <div className='bg-SuccessBg bg-no-repeat bg-cover h-[200px]'>
                <div className='w-[260px] mx-auto relative'>
                  <img src={successImg} className='mx-auto absolute h-24 w-24 top-14 right-[88px]' alt="" />
                </div>
              </div>
              <h2 className='text-2xl font-semibold text-titleColor text-center'>{data?.name || data?.cardName || t('cards.myCards.Card')} <br/> {t('cards.applyCards.Has_Been_Applied_Successfully')} </h2>
              <div className='text-center mb-9 mt-5 md:w-64 mx-auto'>
                 <div className="secondary-outline !px-4 !items-center cursor-pointer" onClick={handleNavigate }><span className="icon lg btn-arrow-back cursor-pointer !mr-2"></span><span className="text-lg font-medium">Back to MyCards</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default StepThree;
