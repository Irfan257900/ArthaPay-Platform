import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Collapse, Modal, Tooltip } from 'antd';
import AppAlert from '../../../core/shared/appAlert';
import { useNavigate, useParams } from 'react-router';
import { connect, useDispatch } from 'react-redux';
import { getSelectedAddress } from '../reducers/applyCardReducer';
import darknoData from '../../../assets/images/dark-no-data.svg';
import lightnoData from '../../../assets/images/light-no-data.svg';
import CustomButton from '../../../core/button/button';
import { fetchFaqs,getNewCardDetails } from '../httpServices';
import ActionController from '../../../core/onboarding/action.controller';
import ContentLoader from '../../../core/skeleton/common.page.loader/content.loader';
import { useTranslation } from 'react-i18next';
import kycRec from '../../../assets/images/kycRec.svg';
import AppCheckbox from '../../../core/shared/appCheckbox';
import defaultCardImg from '../../../assets/images/default-cards.png';
const CardDetails = (props) => {
  const { Panel } = Collapse;
  const [visible, setVisible] = useState(false);
  const [loader, setLoader] = useState(true)
  const [cardDetails, setCardDetails] = useState()
  const [error, setError] = useState(null)
  const [faqs, setFaqs] = useState([]);
  const navigate = useNavigate()
  const [platforms, setPlatforms] = useState();
  const dispatch = useDispatch();
  const { cardId } = useParams();
  const cardDivRef = useRef(null)
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (cardId) {
      newCardDetails()
    }
  }, [cardId])
  useEffect(() => {
    getFaqs()
  }, [])
  useEffect(() => {
    if (visible) setIsChecked(false);
  }, [visible]);
  const handleCancel =  useCallback((e) => {
    setVisible(false);
  },[visible]);
  const showModal = useCallback(() => {
    if (cardDetails?.note) {
      setVisible(true);
    } else {
      setVisible(false);
      dispatch(getSelectedAddress({ data: null }))
      cardDivRef.current?.scrollIntoView(0, 0);
      navigate(`steps`);
    }
  },[cardDetails,dispatch,cardDivRef])
  const setGetnewCardDetails = (response)=>{
    if (response) {
      setCardDetails(response);
      setPlatforms(response?.platForms?.split(','))
    } else {
      setError(response);
    }
    cardDivRef.current?.scrollIntoView(0, 0);
  }
  const newCardDetails = async () => {
    try {
      const urlParams = {id:cardId,customerId: props.userConfig?.id };
      await getNewCardDetails(setLoader,setGetnewCardDetails,setError,urlParams)
    } catch (error) {
      cardDivRef.current?.scrollIntoView(0, 0);
      setError(error.message);
      setLoader(false);
    }
  };

  const getFaqs = async () => {
    await fetchFaqs((response)=>setFaqs(response.faQs),setError)
  }

  const handleApplicationInfo =  useCallback(() => {
    setVisible(false)
    dispatch(getSelectedAddress({ data: null }))
    navigate(`steps`)
  },[dispatch])

  const renderTierFeatures = (features) => {
    if (!features) return null;

    return (
      <div className="flex flex-col gap-2 modal-para-fs" dangerouslySetInnerHTML={{ __html: features }} />
    );
  };
  const clearError = useCallback(() => {
    setError(null);
  },[])
 const handleCheckboxChange = useCallback((checked) => {
    setIsChecked(checked);
}, [])

  
const kycDetailsMap = {
  FullName: <div className='dark:text-subTextColor text-textWhite'><b>Full Name:</b> First Name, Middle Name, Last Name</div>,
  Basic: <div className='dark:text-subTextColor text-textWhite'><b>Basic:</b> Email, Phone Number, Phone Code, Country, DOB, City, Gender</div>,
  PP: <div className='dark:text-subTextColor text-textWhite'><b>PP:</b> Face Image, Document Type, Document Number</div>,
  PFC: <div className='dark:text-subTextColor text-textWhite'><b>PFC:</b> Face Image, Document Type, Document Number, Document Expiry Date, Front Document Image, Back Document Image, Mix Document Image</div>,
  PB: <div className='dark:text-subTextColor text-textWhite'><b>PB:</b> Biomatric Image, Document Number</div>,
  PPHS: <div className='dark:text-subTextColor text-textWhite'><b>PPHS:</b> Hand Holding Image, Signature Image, Face Image, Identity Card Image</div>,
  Address: <div className='dark:text-subTextColor text-textWhite'><b>Address:</b> Personal Address</div>,
};

const kycTooltipContent = (
  <div style={{ whiteSpace: 'pre-line' }}>
    {cardDetails?.kycRequirements
      ?.split(',')
      .map(item => item.trim())
      .map((key, index) => (
        <div key={index} style={{ marginBottom: '8px' }}>
          {kycDetailsMap[key]}
        </div>
      ))}
  </div>
);
  return (
    <>

      {error !== undefined && error !== null && (
        <div className="alert-flex withdraw-alert fiat-alert">
          <AppAlert
            type="error"
            description={error}
            showIcon className='px-0'
          />
          <span className="icon sm alert-close" onClick={clearError}></span>
        </div>
      )}
      {loader && <ContentLoader/>}
      {!loader && cardDetails &&
        <>
          <div ref={cardDivRef}></div>
            <div className='panel-card buy-card card-paddingrm'>
              <div className='card-paddingadd '>
                <div className="w-full lg:w-[465px] mx-auto md:p-4">
                  <div className="relative">
                    <img src={props?.selectedCard?.image || defaultCardImg} className='max-sm:h-[136px] md:h-[232px] w-full rounded-2xl object-cover'></img>
                    <div className=' absolute right-4 top-0'>
                      <p className={`px-3 py-0.5 rounded-b-2xl ${cardDetails?.type?.toLowerCase() === "physical" ? "bg-darkpurple" : "bg-purpleBlueGradiant"}  text-textWhite flex justify-center items-center text-xs`}><span>{cardDetails.type}</span></p>
                    </div>
                    <div className="mb-4 absolute top-0 left-0 h-full w-full p-4 flex flex-col justify-between">
                      <h4 className='detailcard-name'>{props?.selectedCard?.name}</h4>
                      <p className='md:text-mediumfont text-lg font-semibold text-textWhite m-0 inline-block'>XXXX XXXX XXXX XXXX</p>
                    <div className='flex justify-between items-center'>
                    <div>
                      <p className='text-textWhite md:text-base text-sm font-normal'>Card Currency</p>
                      <p className='md:text-md text-base text-textWhite font-semibold'>{props?.selectedCard?.cardCurrency || 'USD'}</p>
                    </div>
                    <div className='text-right'>
                    <p className='text-textWhite text-2xl font-semibold '> {props?.selectedCard?.assoc||'VISA'} </p>
                    </div>
                    </div>
                    </div>
                  </div>
                  {(cardDetails?.rules?.length !== 0 && cardDetails?.rules !== undefined) && <div className='mt-4'>
                    <span className="text-2xl font-semibold text-titleColor">
                    {t('cards.applyCards.Application_Rules')}
                    </span>
                    <div className="mt-1">
                      <ul>
                        {cardDetails?.rules?.map((item) => {
                          return <li className="dt-selectext" key={item?.rule}>
                            {item?.rule}
                          </li>
                        })}
                      </ul>
                    </div>
                  </div>}
                  {/* currenty hiding below section */}
                  {/* <div className='mt-4 border border-StrokeColor rounded-5 p-3.5 flex justify-between items-center'>
                    <div>
                    <div className=''>
                      <div className='flex items-center gap-2 mb-1.5'>
                      <h2 className="text-xl font-semibold text-paraColor mb-1.5">
                      {t('cards.applyCards.KYC_Requirements')}
                      </h2>
                      <Tooltip title={kycTooltipContent}>
                      <span className='icon bank-info'></span>
                      </Tooltip>
                      </div>
                      <p className='text-sm font-normal text-paraColor'>{cardDetails?.kycRequirements?.split(',').join(', ')}</p>
                    </div>
                    {cardDetails?.kycNote && <div className='info-card'>
                      <div className="summary-label">
                        KYC {t('cards.setPin.NOTE')}:
                      </div>
                      <p className='info-para mb-0'>
                        {cardDetails?.kycNote}
                      </p>
                    </div>}
                    </div>
                    <div>
                      <img src={kycRec} alt="" />
                    </div>
                  </div> */}
                      <div className="mt-4">
                        <span className="text-2xl font-semibold text-titleColor">
                        {t('cards.applyCards.Charges')}
                        </span>
                        <div className="pt-3">
                          {cardDetails?.info?.map((detail) => (
                            <div className="summary-list-item !px-0" key={detail?.title}>
                              <div className="summary-label">{detail.title}</div>
                              <div className="summary-text m-0 break-all">{detail.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                  {platforms && <div className="mt-4">
                    <span className="card-title card-head mb-8 inline-block">{t('cards.applyCards.Supported_Platforms')}</span>
                    <div className="support-platfrm">
                      {platforms.map((item) => (<div className="support-platform db-faitcard" key={item}>
                        <h5 className="support-title">{item}</h5>
                      </div>))}
                    </div>
                  </div>}
                  <div className="mt-4">
                    <Collapse
                      accordion
                      expandIconPosition={"right"}
                      className='faq-collapse'
                    >
                      <Panel
                        header={
                          <h4 className="text-lg font-semibold text-titleColor">
                            {t('cards.applyCards.FAQs')}
                          </h4>
                        }
                      >
                        <Collapse
                          accordion
                          expandIconPosition={"right"}
                        >
                          <>
                            {faqs?.map((item) => (<Panel
                              header={
                                <h4 className="!text-sm font-medium text-subTextColor">
                                  {item?.question}
                                </h4>
                              }
                              key={item?.recorder}
                            >
                              <p className='!text-xs font-normal text-paraColor px-4 pb-4'>
                                {item?.answer}
                              </p>
                            </Panel>))}
                          </>
                        </Collapse>
                      </Panel>
                    </Collapse>

                  </div>
                  <div className="mt-16 mb-8">
                    <ActionController
                        handlerType="button"
                        onAction={showModal}
                        redirectTo='/cards/apply'
                        actionFrom="Cards"
                        buttonType="primary"
                        buttonClass={'w-full'}
                      >
                       <span>{t('cards.applyCards.Apply_Now')}</span>
                      </ActionController>
                  </div>
                </div>
              </div>
            </div>
        </>}
        {!loader && !cardDetails &&
            <div className='nodata-content loader-position'>
              <div className='no-data'>
              <img src={darknoData} width={'100px'} alt="" className="dark:block hidden mx-auto"></img>
              <img src={lightnoData} width={'100px'} alt="" className="dark:hidden block mx-auto"></img>
                <p className="text-lightWhite text-sm font-medium mt-3">{t('cards.applyCards.No_Cards_Available_To_Apply')}</p>
              </div>
            </div>
          }

      {visible && <Modal
        centered
        className='custom-modal cust-popup terminate note-cust-modal'
        title={<h2 className="text-2xl text-titleColor font-semibold">{t('cards.applyCards.Terms_and_Conditions')}</h2>}
        visible={visible}
        onCancel={handleCancel}
        footer={false}
        closeIcon={<button onClick={handleCancel}><span className="icon lg close cursor-pointer" title="close"></span></button>}

      >
        {renderTierFeatures(cardDetails?.note)}
        <label className="flex items-center gap-2 mt-4 cards-custom-checkbox">
            <AppCheckbox
              checked={isChecked}
              onChange={handleCheckboxChange}
            className="cursor-pointer"
            />
            <span>{t('cards.applyCards.I_agree_to_the_terms_and_conditions')}</span>
          </label>
        <div className="w-fit ml-auto !mt-4">
          <CustomButton type='primary' block className="applynow-btn" onClick={handleApplicationInfo} loading={loader} disabled={!isChecked} >
            
            <span>{t('cards.applyCards.I_ve_Read')}</span>

          </CustomButton>
        </div>
      </Modal>}

    </>
  );

}
const connectStateToProps = ({ userConfig, applyCard }) => {
  return {
    userConfig: userConfig.details,
    selectedCard: applyCard?.selectedCard?.data,
  };
}
export default connect(connectStateToProps)(CardDetails);