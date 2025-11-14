import React, { useCallback, useEffect, useState } from 'react';
import { Steps } from 'antd';
import { useNavigate } from 'react-router';
import { getCardStatus } from '../httpServices';
import CustomButton from '../../../core/button/button';
import successImg from '../../../assets/images/gifSuccess.gif';
import ContentLoader from '../../../core/skeleton/common.page.loader/content.loader';
import { useTranslation } from 'react-i18next';
import { setRefreshLeftPanel } from '../../wallets/fiat/withdraw.components/withdrawFiatReducer';
import { useDispatch, useSelector } from 'react-redux';

const StepThree = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cardStatusData, setCardStatusData] = useState([]);
  const [loader, setLoader] = useState(false);
  const { t } = useTranslation();
  const {data} = useSelector((storeInfo) => storeInfo?.applyCard?.selectedCard);
  useEffect(() => {
    cardStatus();
  }, [props?.cardId])
  useEffect(() => {
    dispatch(setRefreshLeftPanel(true));
  }, [])

  const cardStatus = async () => {
    props?.isError(null);
    try {
      const urlParams = { cardId: props?.cardId };
      await getCardStatus(setLoader, (response) => setCardStatusData(response), props?.isError, urlParams);
    } catch (error) {
      props?.isError(error);
      setLoader(false);
    }
  }
  const handleNavigate = useCallback(() => {
    props.onSuccess ? props.onSuccess?.() : navigate(`/cards/mycards`);
  }, []);

  return (
    <>
      {loader && <ContentLoader />}
      {!loader &&
        <div className="lg:px-2 py-0 md:px-6 sm:px-2 text-secondaryColor mt-6">
          <div className="border border-StrokeColor rounded-5 h-full">
            <div className='basicinfo-form rounded-5'>
              <div className='text-center relative'>
                <div className='bg-SuccessBg bg-no-repeat bg-cover h-[262px]'>
                  <div className=" h-[262px]">
                    <div className="w-[260px] mx-auto relative">
                      <img
                        src={successImg}
                        className="mx-auto absolute  h-24 w-24 left-20 top-[149px] "
                        alt=""
                      />
                    </div>
                  </div>
                </div>
                <h2 className='text-2xl font-semibold text-titleColor text-center'>{t('cards.myCards.Card')} <br />{data?.name || data?.cardName || t('cards.applyCards.Has_Been_Applied_Successfully')} </h2>
                <div className='mt-9 w-full md:w-[465px] mx-auto'>
                  <Steps className=" " >
                    {cardStatusData?.map((item) => (
                      <Steps.Step
                        key={item?.action}
                        title={item?.action}
                        status='finish'
                        className="finalstep-icons"
                      />
                    ))}
                  </Steps>
                </div>
                <div className='text-center mb-9 mt-5'>
                  <CustomButton type="primary" onClick={handleNavigate} className={'w-2/5'}>
                    Ok
                  </CustomButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </>
  );
};

export default StepThree;
