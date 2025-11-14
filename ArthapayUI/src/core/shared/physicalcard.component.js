import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import ActionController from '../onboarding/action.controller';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
const PhysicalCardComponent = ({ cardData}) => {
  const { t } = useTranslation(); 
  const navigate = useNavigate()
  const handleApplyNow = (cardId) => {
    navigate(`/cards/apply/${cardId}`)
    window.scroll(0, 0);
  };

  const handleCardApply = useCallback(()=>{
    handleApplyNow(cardData?.id)
  },[cardData])
  return (
    <div className='rounded-sm border border-StrokeColor bg-transparentBlackBg p-2 lg:p-3 mb-[10px] flex items-center gap-2'>

      <div className='relative'>
      <img src={cardData?.logo || 'https://devtstarthaone.blob.core.windows.net/arthaimages/defult-image.svg'} alt="Card Logo" className={`h-[80px] w-[146px] rounded-5 ${cardData?.logo && "bg-primaryColor"}`}/>

        <div className='absolute top-0 left-0 h-full w-full p-1 flex flex-col justify-between'>
          <h3 className='text-xs font-medium mb-0 text-textWhite'>{cardData?.cardName}</h3>
          <div>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-xs font-medium text-textWhite m-0'>**** **** **** ****</p>
                <p className='text-[8px] font-medium text-textWhite m-0'>{cardData?.customerName || '--'}</p>
              </div>
            </div>
          </div>
          <div>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-[8px] font-normal mb-0 text-textWhite'>cvv</p>
                <p className='text-[8px] font-normal mb-0 text-textWhite'>***</p>
              </div>
              <div>
                <p className='text-[8px] font-medium mb-0 text-textWhite'>Valid upto</p>
                <p className='text-[8px] font-medium mb-0 text-textWhite'>**/**</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-wrap xl:flex-nowrap justify-between h-full flex-1'>

        <div className=''>
          <p className='text-xs font-medium mb-0 text-subTextColor'>{cardData.cardName}</p>
          {cardData?.supportedPlatforms && <p className='text-xs text-paraColor font-semibold'>
            {cardData?.supportedPlatforms}
          </p>}
        </div>
        <div className=''>
          <ActionController
            handlerType="button"
            onAction={handleCardApply}
            actionFrom="Cards"
            buttonType="primary"
            redirectTo={(`/cards/apply/${cardData?.id}`)}
            buttonClass={""}
          >{t('cards.Apply Now')}</ActionController>
        </div>
      </div>
    </div>
  );
};
PhysicalCardComponent.propTypes = {
  cardData: PropTypes.shape({
    logo: PropTypes.string,
    cardName: PropTypes.string,
    customerName: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    supportedPlatforms: PropTypes.string, 
  }),
};

export default PhysicalCardComponent;