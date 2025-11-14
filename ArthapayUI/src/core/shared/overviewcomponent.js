import React, { useCallback } from 'react';
import { Carousel, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import cardlogo from '../../assets/images/yb.svg';
import credit from '../../assets/images/credit-card.svg'

const OverViewComponent = ({ showAllCards }) => {

  const overviewRef = React.useRef(null);

  const responsiveSettings = [
    {
      breakpoint: 576,
      settings: {
        slidesToShow: 1,
      },
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 1400,
      settings: {
        slidesToShow: 3,
      },
    },
  ];


  const handlePrev = useCallback(() => {
    overviewRef.current.prev();
  }, [overviewRef]);


  const handleNext = useCallback(() => {
    overviewRef.current.next();
  }, [overviewRef]);

  return (<>

    <Button
      type="primary"
      shape="circle"
      icon={<LeftOutlined />}
      style={{ position: 'absolute', top: '50%', left: '5px', transform: 'translateY(-50%)' }}
      onClick={handlePrev}
    />
    <Carousel ref={overviewRef} dots={false} slidesToShow={3} responsive={responsiveSettings}>
      <div className='carosal-card card-bg'>
        <div>
          <img src={cardlogo} className='card-logo'></img>
        </div>
        <div>
          <img src={credit}></img>
          <p className='card-number mb-0'>**** **** ****  {showAllCards.cardNumber?.substr(showAllCards.cardNumber.length - 4)}</p>
        </div>
      </div>

      <div className='carosal-card second-card'>
        <div className='d-flex justify-content mb-45'>
          <div className='d-flex'>
            <div className='bal-section'>
              <p className='card-bal'>{showAllCards.cardBalance} {showAllCards.baseCurrency}</p>
              <p className='card-label'>Avilable</p>
            </div>
            <div>
              <p className='card-bal'>{showAllCards.spent} {showAllCards.baseCurrency}</p>
              <p className='card-label'>Spent</p>
            </div></div>
          <div> <img src={cardlogo}></img></div>
        </div>
        <div>
          <p className='mb-0 card-name'>{showAllCards.cardType}</p>
          <p className='card-number'>**** **** ****  {showAllCards.cardNumber?.substr(showAllCards.cardNumber.length - 4)}</p>
          <p className='valid-text'>Valid Upto {showAllCards.expiry}</p>
        </div>
      </div>

      <div className='carosal-card second-card third-card'>
        <div className='d-flex justify-content mb-45'>
          <div className='d-flex'>
            <div className='bal-section'>
              <p className='card-bal'>{showAllCards.cardBalance} USD</p>
              <p className='card-label'>Avilable</p>
            </div>
            <div>
              <p className='card-bal'>{showAllCards.spent} {showAllCards.baseCurrency}</p>
              <p className='card-label'>Spent</p>
            </div></div>
          <div> <img src={cardlogo}></img></div>
        </div>
        <div>
          <p className='mb-0 card-name'>{showAllCards.cardType}</p>
          <p className='card-number'>**** **** ****  {showAllCards.cardNumber?.substr(showAllCards.cardNumber.length - 4)}</p>
          <p className='valid-text'>Valid Upto {showAllCards.expiry}</p>
        </div>
      </div>

      <div className='carosal-card card-bg'>
        <div>
          <img src={cardlogo} className='card-logo'></img>
        </div>
        <div>
          <img src={credit}></img>
          <p className='card-number mb-0'>**** **** ****{showAllCards.cardNumber?.substr(showAllCards.cardNumber.length - 4)}</p>
        </div>
      </div>
      <div className='carosal-card second-card'>
        <div className='d-flex justify-content mb-45'>
          <div className='d-flex'>
            <div className='bal-section'>
              <p className='card-bal'>{showAllCards.cardBalance} {showAllCards.baseCurrency}</p>
              <p className='card-label'>Avilable</p>
            </div>
            <div>
              <p className='card-bal'>{showAllCards.spent} {showAllCards.baseCurrency}</p>
              <p className='card-label'>Spent</p>
            </div></div>
          <div> <img src={cardlogo}></img></div>
        </div>
        <div>
          <p className='mb-0 card-name'>{showAllCards.cardType}</p>
          <p className='card-number'>**** **** ****  {showAllCards.cardNumber?.substr(showAllCards.cardNumber.length - 4)}</p>
          <p className='valid-text'>Valid Upto {showAllCards.expiry}</p>
        </div>
      </div>
      <div className='carosal-card second-card third-card'>
        <div className='d-flex justify-content mb-45'>
          <div className='d-flex'>
            <div className='bal-section'>
              <p className='card-bal'>{showAllCards.cardBalance} {showAllCards.baseCurrency}</p>
              <p className='card-label'>Avilable</p>
            </div>
            <div>
              <p className='card-bal'>{showAllCards.spent} {showAllCards.baseCurrency}</p>
              <p className='card-label'>Spent</p>
            </div></div>
          <div> <img src={cardlogo}></img></div>
        </div>
        <div>
          <p className='mb-0 card-name'>{showAllCards.cardType}</p>
          <p className='card-number'>**** **** ****  {showAllCards.cardNumber?.substr(showAllCards.cardNumber.length - 4)}</p>
          <p className='valid-text'>Valid Upto {showAllCards.expiry}</p>
        </div>
      </div>

    </Carousel>
    <Button
      type="primary"
      shape="circle"
      icon={<RightOutlined />}
      style={{ position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)' }}
      onClick={handleNext}
    />

  </>)
}

export default OverViewComponent;