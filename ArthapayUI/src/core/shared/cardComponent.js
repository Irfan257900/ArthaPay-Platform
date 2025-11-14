import React from 'react';
import { Link, useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import visaImage from '../../../src/assets/images/Visa-card.svg';
import { badgeColor, badgeStyle } from '../../modules/cards/service';
const CardComponent = ({ cardData }) => {
  const navigate = useNavigate();
  return (
    <div className='mb-4'>
      <Link to={`/cards/mycards/My%20Cards/${cardData.id}`} >
        <div className='relative'>
          {!cardData.logo&&<button className='p-2 bg-transparent border-none cursor-pointer' onClick={() => navigate(`/cards/mycards/${cardData.id}/${cardData?.status}`)}>Navigate to My Cards</button>}      {cardData.logo&&<img src={cardData.logo} alt="Card Logo" className='h-[200px] lg:h-[36vh] object-cover rounded-5 w-full'>
          </img>}          
          <div className='absolute top-0 left-0 h-full w-full p-4 flex flex-col justify-between'>
            <div className='flex items-center justify-between'>
            <h3 className='md:text-mediumfont text-lg font-semibold mb-0 text-textWhite'>{cardData.cardName}</h3> 
            <div className='flex items-center gap-1'>
            <p className={`card-state-default`} style={{ backgroundColor: badgeStyle[cardData?.status?.toLowerCase()] || "#037A00", color: badgeColor[cardData?.status?.toLowerCase()] || "#ffff" }}>{cardData?.status ==='Approved'?'Active':cardData?.status}</p>
            <span className={`icon ${cardData?.status ==="Approved" ? "isapproved-icon " : " ispending-icon"}`}></span>   
            </div>
            </div>
            <div>
           <div className='flex justify-between items-center'>
           <div>
          <p className='text-3xl font-semibold text-textWhite m-0 inline-block cardnumber-wordspace'><span className='md:text-mediumfont text-lg font-semibold text-textWhite m-0 inline-block'> {`${cardData?.number?.substr(0, 4)||"XXXX"}${" "}XXXX${" "}XXXX${" "}${cardData?.number?.substr(-4)||"XXXX"}`}</span></p>
          
            </div>            
           </div>
              </div>  

              <div>
            <p className='md:text-mediumfont text-lg font-semibold text-textWhite m-0 capitalize mb-3'>{cardData?.customerName}</p>
           <div className='flex justify-between items-end'>
           <div>            
            <p className='text-xs font-normal mb-0 text-textWhite'>Current balance</p> 
            <p className='md:text-md text-base font-semibold mb-0 text-textWhite'>{cardData?.amount } {cardData?.currency}</p>     
            </div>
            <p className='md:text-md text-base font-semibold m-0 text-textWhite'>**/**</p> 
            <p className='md:text-md text-2xl font-semibold mb-0 text-textWhite'>***</p> 
            <div>
              <img src={visaImage} alt=" " className='w-16' />
            </div>
           </div>
              </div>      
          </div>                   
      </div>
      </Link>
    </div>
  );
};
CardComponent.propTypes = {
  cardData: PropTypes.shape({
    id: PropTypes.string,
    status: PropTypes.string,
    logo: PropTypes.string,
    cardName: PropTypes.string,
    number: PropTypes.string,
    customerName: PropTypes.string,
    amount: PropTypes.number,
    currency: PropTypes.string,
    paidAmount: PropTypes.number,
    paidCurrency: PropTypes.string,
  }),};
export default CardComponent;
