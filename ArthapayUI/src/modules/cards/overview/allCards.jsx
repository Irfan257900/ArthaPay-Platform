import React from 'react'
import PropTypes from 'prop-types';
import darknoData from '../../../assets/images/dark-no-data.svg';
import lightnoData from '../../../assets/images/light-no-data.svg';
import { AssignedCardsTextStatus, statusDot } from '../../../utils/statusColors';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Divider } from 'antd';
import { useTranslation } from 'react-i18next';
const AllCards = ({assignCardDetails}) => {
  const { t } = useTranslation();
  return (
    <div className="h-[267px] overflow-auto">
      <InfiniteScroll
        dataLength={assignCardDetails?.length > 0}

        endMessage={<Divider plain>
          <div className="buy-selectgroup">
            {assignCardDetails?.length !== 0 && <span>{t('cards.myCards.Yay_You_have_seen_it_all')}</span>}
          </div></Divider>}
        scrollableTarget="table-scroll"
      >
        {assignCardDetails?.length > 0 && assignCardDetails.map((card) => (
          <div key={card.id} >
            <div className='flex gap-8'>
              <div className='flex gap-3.5'>
                <div className='relative'>
                  <img
                  src={card.logo}
                  alt={'logo'}
                  className='h-[90px] w-[180px] object-cover rounded-md'
                  />
                  <div className=' absolute top-0 p-2 w-full'>
                    <p className='text-subTextColor text-xs font-medium mb-0.5'>{card.cardName}</p>
                    <p class="text-xs font-medium text-textWhite">**** **** **** ****</p>
                    <div class="flex justify-between items-center mt-4">
                      <div>
                      <p class="text-[8px] font-normal mb-0 text-textWhite">cvv</p>
                      <p class="text-[8px] font-normal mb-0 text-textWhite">***</p>
                      </div>
                      <div>
                        <p class="text-[8px] font-medium mb-0 text-textWhite">Valid upto</p>
                        <p class="text-[8px] font-medium mb-0 text-textWhite">**/**</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='md:space-y-1'>
                  <p className='text-subTextColor text-base font-semibold'>
                    {card.cardName}
                  </p>
                  <div className='flex items-center gap-3'>
                    <p className='text-paraColor text-xs font-normal whitespace-nowrap'>
                      {card.number ? `${card.number?.substr(0, 4)} XXXX XXXX ${card?.number?.substr(-4)}`:'XXXX XXXX XXXX XXXX'}
                    </p>
                    <div className='flex items-center gap-0.5'>
                      <span className={`w-2 h-2 ${statusDot[card.status.toLowerCase()]} rounded-full inline-block m-0`}></span>
                      <span className={AssignedCardsTextStatus[card.status.toLowerCase()]}>
                        {card.status == "Approved" ? "Active" : card.status}
                      </span>
                    </div>
                  </div>
                  <p className='text-sm font-semibold text-subTextColor'>
                    {card.assignedTo}{' '}
                    <span>({card.type})</span>
                  </p>
                  <p className='text-xl font-semibold text-subTextColor'>
                    {card.amount} {card.currency}
                  </p>
                </div>
              </div>
              <div></div>
            </div>
          </div>
        )) || <div className='nodata-content'>
            <div className='no-data'>
              <img src={darknoData} width={'100px'} alt="" className="dark:block hidden"></img>
              <img src={lightnoData} width={'100px'} alt="" className="dark:hidden block"></img>
              <p className="text-lightWhite text-sm font-medium mt-3">No Data</p>
            </div>
          </div>}
      </InfiniteScroll>

    </div>
  );
};

AllCards.propTypes = {
  userConfig: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  assignCardDetails: PropTypes.arrayOf(
    PropTypes.shape({
      number: PropTypes.string,
      cardName: PropTypes.string,
      status: PropTypes.string,
      cardHolderName: PropTypes.string,
      cardType: PropTypes.string,
      currency: PropTypes.string,
    })
  ),
};

export default AllCards;
