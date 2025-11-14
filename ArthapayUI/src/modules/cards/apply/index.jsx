import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal,Row} from 'antd';
import Leftpanel from '../../../core/shared/leftpanel';
import { Outlet, useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { getSelectedCard } from '../reducers/applyCardReducer';
import PageHeader from '../../../core/shared/page.header';
import ContentLoader from '../../../core/skeleton/common.page.loader/content.loader';
import { useTranslation } from 'react-i18next';
import darknoData from '../../../assets/images/dark-no-data.svg';
import lightnoData from '../../../assets/images/light-no-data.svg';
import CardsKpis from '../overview';
import CardsScreenTabs from '../screenTabs';
import { setApplyCardKycInfo, setCurrentStep, setStepsError } from '../../../reducers/cards.reducer';

const ApplyCard = (props) => {
  const {cardId} = useParams()
  const [leftPanelSelectedData, setLeftPanelSelectedData] = useState({});
  const [loader, setLoader] = useState(true)
  const [isProcessEnable, setIsProcessEnable]=useState(false)
  const [selectedCurdId,setSelectedCurdId]=useState(cardId);
  const [isGridRefresh,setIsGridRefresh] = useState(false)
  const [isSuccessCreationCard,setIsSuccessCreationCard]=useState(false);
  const navigate=useNavigate()
  const dispatch=useDispatch()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const isRefreshLeftPanel = useSelector((storeInfo) => storeInfo?.withdrawFiat?.isRefreshLeftPanel);
  const currentStep = useSelector((state) => state.cardsStore.currentStep);
  const navigateToDashboard=()=>{
    navigate(`/cards`)
}
  const breadCrumbList = useMemo(() => {
    const defaultList = [
      { id: "1", title: `${t('cards.myCards.Cards')}` ,handleClick:()=>navigateToDashboard()},
      { id: "2", title: `${t('cards.applyCards.Apply_Cards')}` },
    ];  
    let list = [...defaultList];
    if(window.location.pathname.includes('apply') && !leftPanelSelectedData?.name){
     return list
    }
    else if (window.location.pathname.includes('apply') && leftPanelSelectedData?.name) {
      list = [
        ...list,
        { id: "3", title: leftPanelSelectedData?.name }
      ];
    }
    return list;
  }, [leftPanelSelectedData?.name,isProcessEnable,t ]);
  useEffect(()=>{
    if(!cardId && leftPanelSelectedData?.id && !isRefreshLeftPanel){
      navigate(`/cards/apply/${leftPanelSelectedData?.id}`)
    }
  },[cardId,leftPanelSelectedData?.id])
  useEffect(() => {
    if (isRefreshLeftPanel) {
      setIsGridRefresh(true)
    }
    dispatch(setApplyCardKycInfo(null));
  }, [isRefreshLeftPanel])
  const getLeftPanelLoader= useCallback((panelLoader)=>{
    setLoader(panelLoader);
  },[loader]);
  const getLeftPanelData = useCallback((leftpanneldata) => {
    setLeftPanelSelectedData(leftpanneldata);
    dispatch(getSelectedCard({data:leftpanneldata}))
    setSelectedCurdId(leftpanneldata?.id||leftpanneldata?.programId);
    navigate(`/cards/apply/${leftpanneldata?.id||leftpanneldata?.programId}`)
    setIsProcessEnable(false);
    setIsSuccessCreationCard(false);
    setIsModalOpen(false);
    dispatch(setApplyCardKycInfo(null));
    dispatch(setCurrentStep(0));
    dispatch(setStepsError(null));
  }, [navigate, dispatch])
const handleModalActions=useCallback(()=>{
  setIsModalOpen(!isModalOpen);
},[isModalOpen]);
  const goBackSteps = useCallback(() => {
    if (currentStep == 0) {
      navigate(`/cards/apply/${cardId || props.cardId}`);
      dispatch(setApplyCardKycInfo(null));
      dispatch(setStepsError(null));
    } else {
      dispatch(setStepsError(null));
      dispatch(setCurrentStep(currentStep - 1));
    }
  }, [navigate, dispatch, cardId, props.cardId, currentStep]);
  return (
    <>
       <PageHeader breadcrumbList={breadCrumbList} />
        <CardsKpis />

        <Row className="row-stretch">
        <div className="layout-bg left-panel pannel-bg left-items-stretch sm-none cards-container">
           <CardsScreenTabs screenName={'ApplyCards'}/>
          <Leftpanel isGridRefresh ={isGridRefresh} screenType={"AllCards"} getLeftPanelData={getLeftPanelData} getLeftPanelLoader={getLeftPanelLoader}
          curdId={selectedCurdId}  isSuccessCreationCard={isSuccessCreationCard} noDataText={t('cards.applyCards.No_Cards_Available_To_Apply')} activeTab={''} handleModalActions={handleModalActions}/>
        </div>
        <div className="layout-bg left-panel pannel-bg left-items-stretch md-none">
        <div className="buy-token md-none mt-0">
          <div className="buy-coinselect" onClick={ handleModalActions}>
            <span className="buy-from">{leftPanelSelectedData?.name || t('cards.myCards.Select_Card')}</span>
            <span className="icon sm down-angle" />
          </div>
        </div>
      </div>
         <div className="layout-bg right-panel withdraw-rightpanel min-h-[85vh]">
         {loader && <ContentLoader /> }
         {!loader && (leftPanelSelectedData?.id || leftPanelSelectedData?.programId || cardId) && <> 
         <div className='flex justify-between items-center border-b-2 border-cryptoline pb-2'>
           <div className="flex gap-2 items-center">
          {window.location.pathname.includes("steps") && (currentStep == 0 || currentStep == 1) && 
          <button class="icon lg btn-arrow-back cursor-pointer" onClick={goBackSteps}></button>}
           <span className="text-md text-titleColor font-semibold">{leftPanelSelectedData?.name}</span></div>
           <span className="text-xl text-subTextColor font-semibold">Apply Card</span>
         </div>
         <Outlet /> </>}
          {!loader && (!leftPanelSelectedData?.programId || !cardId) &&
            <div className='nodata-content loader-position'>
              <div className='no-data'>
                <img src={darknoData} width={'100px'} alt="" className="dark:block hidden mx-auto"></img>
                <img src={lightnoData} width={'100px'} alt="" className="dark:hidden block mx-auto"></img>
                <p className="text-lightWhite text-sm font-medium mt-3">{t('cards.applyCards.No_Cards_Available_To_Apply')}</p>
              </div>
            </div>
          }
        </div>
      </Row>
      <Modal
        className="custom-modal mobile-drop mobile-modal"
        onCancel={handleModalActions}
        closable={true}
        open={isModalOpen}
        footer={false}
      >
        <div className="custom-flex p-4 pb-0">
          <h1 className="text-md text-titleColor font-semibold">
          {t('cards.applyCards.Apply_Cards')}
          </h1>
          <span onClick={handleModalActions} className='icon lg close c-pointer'></span>
        </div>
        <div id="scrollableDiv" className='mobile-left-panel'>
          <div className="custom-flex p-4 pb-0"></div>
          <Leftpanel isGridRefresh = {isGridRefresh} screenType={"AllCards"} getLeftPanelData={getLeftPanelData} getLeftPanelLoader={getLeftPanelLoader}
          curdId={selectedCurdId}  isSuccessCreationCard={isSuccessCreationCard} noDataText={t('cards.applyCards.No_Cards_Available_To_Apply')} activeTab={''} handleModalActions={handleModalActions}/>
        </div>
      </Modal>
    </>
  );
}
export default ApplyCard;