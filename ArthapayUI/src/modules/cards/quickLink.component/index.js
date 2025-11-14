
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Modal, Row } from 'antd';
import Leftpanel from '../../../core/shared/leftpanel';
import AppAlert from '../../../core/shared/appAlert';
import { connect, useDispatch, useSelector } from 'react-redux';
import QuickLinkSteps from '../quickLink.component/processsteps';
import { useNavigate } from 'react-router';
import PageHeader from '../../../core/shared/page.header';
import ContentLoader from '../../../core/skeleton/common.page.loader/content.loader';
import { getSelectedCard } from '../reducers/applyCardReducer';
import CardsKpis from '../overview';
import CardsScreenTabs from '../screenTabs';
import AppEmpty from '../../../core/shared/appEmpty';
import Bind from './bind';
import { useTranslation } from 'react-i18next';

const QuickLink = (props) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [leftPanelSelectedData, setLeftPanelSelectedData] = useState(null);
  const [loader, setLoader] = useState(true)
  const [error, setError] = useState(null)
  const [isProcessEnable, setIsProcessEnable] = useState(false)
  const [selectedCurdId, setSelectedCurdId] = useState(props.match?.params?.cardId);
  const [isSuccessCreationCard, setIsSuccessCreationCard] = useState(false);
  const [isBack, setIsBack] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCardName, setSelectedCardName] = useState("");
  const [isGridRefresh,setIsGridRefresh] = useState(false);
  const isRefreshLeftPanel = useSelector((storeInfo) => storeInfo?.withdrawFiat?.isRefreshLeftPanel);
  const {t}=useTranslation()

  useEffect(() => {
    if (leftPanelSelectedData?.cardState !== "Approved" && leftPanelSelectedData?.cardState !== "Submitted") {
      setIsProcessEnable(true);
    }
  }, [leftPanelSelectedData])
  useEffect(() => {
    if (isRefreshLeftPanel) {
      setIsGridRefresh(true)
    }
  }, [isRefreshLeftPanel])
  const navigateToDashboard = () => {
    navigate(`/cards`)
  }
  const breadCrumbList = useMemo(() => {
    const defaultList = [
      { id: "1", title: `${t('cards.myCards.Cards')}`, handleClick: () => navigateToDashboard() },
      { id: "2", title: `${t('cards.bindCard.Bind_Card')}` },
    ];
    let list = [...defaultList];
    if (window.location.pathname.includes('bindcard') && !leftPanelSelectedData?.cardName) {
      return list
    }
    else if (window.location.pathname.includes('bindcard') && leftPanelSelectedData?.cardName) {
      list = [
        ...list,
        { id: "3", title: leftPanelSelectedData?.cardName }
      ];
    }
    return list;
  }, [leftPanelSelectedData?.cardName, isProcessEnable, t]);

 
  const getLeftPanelLoader = useCallback((panelLoader) => {
    setLoader(panelLoader);
    isError(null);
  }, []);
  const isError = useCallback((response) => {
    if(response){
      setError(response);
      window.scrollTo(0, 0);
    }else{
      setError(null);
    }
  }, []);
  const getLeftPanelData = useCallback((leftpanneldata) => {
    setLeftPanelSelectedData(leftpanneldata);
    setSelectedCurdId(leftpanneldata?.id);
    dispatch(getSelectedCard({ data: leftpanneldata }))
    setSelectedCardName(leftpanneldata?.cardName)
    setIsProcessEnable(false);
    isError(null)
    setIsSuccessCreationCard(false);
  }, []);

  const iSCreationCard = useCallback(() => {
    setIsSuccessCreationCard(true)
  }, []);
  const backtoScreen = useCallback(() => {
    setIsProcessEnable(false);
    setIsBack(true)
  }, []);
  const handleModalActions = useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);
  
 
  
  const clearErrorMsg = useCallback(() => {
    setError(null)
  }, [])

  return (<>
    <PageHeader breadcrumbList={breadCrumbList} />
    <CardsKpis />
    <Row className="row-stretch">
      <div className="layout-bg left-panel pannel-bg left-items-stretch sm-none">
        <CardsScreenTabs screenName={'MyCards'}/>
        <Leftpanel isGridRefresh ={isGridRefresh}  screenType={"QuickLinks"} getLeftPanelData={getLeftPanelData} getLeftPanelLoader={getLeftPanelLoader}
          curdId={selectedCurdId} isSuccessCreationCard={isSuccessCreationCard} isBack={isBack} noDataText={t('cards.myCards.No_Cards_Available')} activeTab={''} handleModalActions={handleModalActions}/>
      </div>
      <div className="layout-bg left-panel pannel-bg left-items-stretch md-none">
        <div className="buy-token md-none mt-0">
          <div className="buy-coinselect" onClick={handleModalActions}>
            <span className="buy-from">{leftPanelSelectedData?.cardName || t('cards.myCards.Select_Card')}</span>
            <span className="icon sm down-angle" />
          </div>
        </div>
      </div>
      <div className="layout-bg right-panel withdraw-rightpanel min-h-[85vh]">
      <div className='flex justify-between items-center border-b-2 border-cryptoline pb-2'>
          <h2 className="text-md text-titleColor font-semibold">{t('cards.bindCard.title')}</h2>
           <span className="text-xl text-subTextColor font-semibold">Bind Cards</span>
         </div>
        {error !== undefined && error !== null && (
          <div className="alert-flex withdraw-alert fiat-alert">
            <AppAlert
              type="error"
              description={error}
              onClose={clearErrorMsg}
              showIcon
            />
            <span className="icon sm alert-close" onClick={clearErrorMsg}></span>
          </div>
        )}
        {loader && <ContentLoader />}
        {!loader && leftPanelSelectedData && <>
          {isProcessEnable && <QuickLinkSteps cardId={leftPanelSelectedData?.id} isError={isError} iSCreationCard={iSCreationCard} backtoScreen={backtoScreen} selectedCardData={leftPanelSelectedData} />}
          {!isProcessEnable && <Bind setIsProcessEnable={setIsProcessEnable} selectedCard={leftPanelSelectedData} selectedCardId={selectedCurdId} selectedCardName={selectedCardName} error={error} setError={isError}/>}
        </>}
        {!leftPanelSelectedData && !loader && <div className='nodata-content loader-position'>
         <AppEmpty/>
        </div>}
      </div>
    </Row>
    <Modal
      className="custom-modal mobile-drop mobile-modal"
      onCancel={handleModalActions}
      closable={true}
      visible={isModalOpen}
      footer={false}
    >
      <div className="custom-flex p-4 pb-0">
        <h1 level={5} className="text-2xl text-titleColor font-semibold">
          {t('cards.bindCard.Bind_Card')}
        </h1>
        <span onClick={handleModalActions} className='icon lg close c-pointer'></span>
      </div>
      <div id="scrollableDiv" className='mobile-left-panel'>
        <div className="custom-flex p-4 pb-0"></div>
        <Leftpanel isGridRefresh = {isGridRefresh} screenType={"QuickLinks"} getLeftPanelData={getLeftPanelData} getLeftPanelLoader={getLeftPanelLoader}
          curdId={selectedCurdId} isSuccessCreationCard={isSuccessCreationCard} isBack={isBack} noDataText={`${t('cards.myCards.No_Cards_Available')}`} handleModalActions={handleModalActions}/>
      </div>
    </Modal>
    
  </>)
}
const connectStateToProps = ({ userConfig }) => {
  return { user: userConfig.details };
};
export default connect(connectStateToProps)(QuickLink)