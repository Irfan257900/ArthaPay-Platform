import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import CardComponent from '../../../core/shared/cardComponent';
import PhysicalCardComponent from '../../../core/shared/physicalcard.component';
import { useNavigate } from 'react-router';
import Transactions from '../mycards/card.transactions';
import darknoData from '../../../assets/images/dark-no-data.svg';
import lightnoData from '../../../assets/images/light-no-data.svg';
import { getAdvertisementDetails, getAllMyCardDetails, getAssignCardsData, getDashboardAllCardDetails } from '../httpServices';
import AllCards from './allCards';
import SummaryGraph from './summaryGraph';
import AppTabs from '../../../core/shared/tabs';
import PageHeader from '../../../core/shared/page.header';
import RecentActivityBoxLoader from '../../../core/skeleton/recent.activity.loader/recent.activityBox.loader';
import ActionController from '../../../core/onboarding/action.controller';
import CardsDashboardLoader from '../../../core/skeleton/cards.loaders/cards.dashboard.loader';
import { initialState, reducer } from './reducer';
import DashBoardAppKpis from '../../../core/shared/dashboardKpis';
import { getCardsKpis } from '../../../core/dashboard/http.services';
import FeatureCard from '../../../core/shared/FeatureCards';
import { useTranslation } from 'react-i18next';

const currentPage = 1;
const Overview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const cardDivRef = React.useRef(null);
  const [localState, localDispatch] = useReducer(reducer, initialState);
  const [cards, setCards] = useState([])
  const [assignCardDetails, setAssignCardDetails] = useState([])
  const userConfig = useSelector((state) => state.userConfig?.details);
  const tabsData = [
    { id: 'myCards', name:<span className='text-sm font-medium text-inactiveTabColor mb-0 ml-1.5'> {t('cards.My Cards')}</span>, icon: <span className='icon team-cards'></span> },
    { id: 'allCards', name:<span className='text-sm font-medium text-inactiveTabColor mb-0 ml-1.5'>{t('cards.Assign Cards')}</span>,icon: <span className='icon assign-cards'></span> },
  ];
  useEffect(() => {
    getAllMycards(currentPage);
  }, [localState.activeTab === 'myCards']);

  useEffect(() => { fetchData() }, []);
  const setGetCardDetails = (response) => {
    if (response) {
      const uniqueCardIds = new Set(localState?.newCardsData?.map((card) => card.id));
      const filteredNewCards = response.filter((card) => !uniqueCardIds.has(card.id));
      localDispatch({ type: 'setNewCardsData', payload: [...localState?.newCardsData, ...filteredNewCards] });
    }
  }
  const setGetCardsData = (response) => {
    if (response) {
      localDispatch({ type: 'setCardsData', payload: response });
    }
  }
  const getAllMycards = async (page) => {
    const urlParams = { id: userConfig?.id, pageSize: 4, pageNo: page }
    await getAllMyCardDetails(localDispatch, setGetCardsData, urlParams);
  }
  const urlParams1 = { pageSize: 5, pageNo: 1 }
  const urlParams2 = { screenName: 'cards' }
  const fetchData = async () => {
    localDispatch({ type: 'setNewCardsDataLodaer', payload: true });
    try {
      await Promise.all([
        getCardsKpis(setCards, userConfig.id),
        getDashboardAllCardDetails(setGetCardDetails, urlParams1),
        getAdvertisementDetails((response) => localDispatch({ type: 'setAdvertisementData', payload: response }), urlParams2),
        getAssignCardsData(setAssignCardDetails)
      ]);
    } catch (error) {
    } finally {
      localDispatch({ type: 'setNewCardsDataLodaer', payload: false });
    }
  };
  const handleTabClick = useCallback((tab) => {
    localDispatch({ type: 'setActiveTab', payload: tab?.id });
  }, []);
  const handleApplyNow = useCallback(() => {
    navigate('/cards/apply')
  }, []);

  const breadCrumbList = [
    { id: "1", title: t("cards.Cards") },
  ];
  return (
    <>


      <div ref={cardDivRef}></div>
      {localState?.newCardsDataLodaer && <CardsDashboardLoader />}
      {!localState?.newCardsDataLodaer && <> <PageHeader breadcrumbList={breadCrumbList} />
        <div className="grid md:grid-cols-4 gap-5 mb-5">
          <DashBoardAppKpis data={cards} isSeparate={true} />
          <div className="p-3.5 border border-dbkpiStroke hover:border-primaryColor active-hyperlink hover:bg-primaryColor hoveranim rounded-5 ">
            <FeatureCard
              icon="add-crypto-icon"
              title={t("cards.My Cards")}
              description={t("cards.mycards_tagline")}
              hasSeparator={true}
              routing="/cards/mycards"
            />
          </div>
          <div className='p-3.5 border border-dbkpiStroke hover:border-primaryColor active-hyperlink hover:bg-primaryColor hoveranim rounded-5 '>
            <FeatureCard
              icon="add-crypto-icon"
              title={t("cards.Apply Cards")}
              description={t("cards.applycards_tagline")}
              routing="/cards/apply"
            />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-5'>
          {<h4 className={`text-2xl font-semibold text-titleColor mb-2`} >
            <button className={userConfig?.accountType !== "Business" && "cursor-pointer" || ""} onClick={() => userConfig?.accountType !== "Business" && navigate(`/cards/mycards`)}>
              {userConfig?.accountType !== "Business" && t("cards.My Cards") || t("cards.Cards")}
              {userConfig?.accountType !== "Business" && <button className='icon lg square-arrow cursor-pointer ml-1' onClick={() => navigate(`/cards/mycards`)}></button>}
            </button>
          </h4>}
          <h4 className={`text-2xl font-semibold text-titleColor mb-2 md:block hidden`} >
            <button className={userConfig?.accountType !== "Business" && "cursor-pointer" || ""} onClick={() => userConfig?.accountType !== "Business" && navigate(`/cards/apply`)}>{t('cards.Available Cards')}
              {userConfig?.accountType !== "Business" && <button className='icon lg square-arrow cursor-pointer ml-1' onClick={() => navigate(`/cards/apply`)}></button>}</button>
          </h4>
        </div>
        <div className='grid md:grid-cols-1 lg:grid-cols-2 gap-5'>
          <div className='w-full rounded-5 border border-dbkpiStroke md:p-5 p-2.5 mb-5'>
            <div >
              {userConfig?.accountType == "Business" && (
                <div className='normal-tab-btn'>
                  <AppTabs
                    tabsData={tabsData}
                    labelKey="name"
                    idKey="id"
                    onTabChange={handleTabClick}
                  />
                </div>
              )}
              {localState?.activeTab === 'myCards' && (
                <div className={`overflow-y-auto max-h-[534px] pr-2`}>
                  {localState?.cardsLoader && <div className='w-full'><RecentActivityBoxLoader /></div>}
                  {!localState?.cardsLoader && localState?.cardsData?.length > 0 && (
                    <button className='p-0 h-full w-full text-left' >
                      {localState?.cardsData?.map((item) => (
                        <CardComponent
                          cardData={item}
                          cardType={item.cardType}
                          screenType="overview"
                          key={item.id}
                        />
                      ))}
                    </button>
                  )}
                  {!localState?.cardsLoader && localState?.cardsData?.length === 0 && (
                    <div className="md:flex items-center justify-between md:space-y-0 space-y-4">

                      {/* 1. SVG Icon on the left */}
                      <div className="flex-shrink-0 p-6 flex items-center justify-center md:!block">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          // Kept original classes for size and color.
                          className="h-24 w-24 text-paraColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z"
                          />
                        </svg>
                      </div>

                      {/* 2. Text content in the middle */}
                      {/* Kept original font and color classes. */}
                      <div className="md:flex flex-grow items-center justify-between md:space-y-0 space-y-4 md:p-6">
                        <div className="mx-6">
                          {/* <h3 className='text-lg font-medium text-lightWhite'>
                          {t('cards.Don’t miss out on exclusive card benefits!')}
                        </h3> */}
                          <p className="text-base font-light text-lightWhite">
                            {`It looks like you don't have any cards yet.
                            Let's apply one to get started!`}
                          </p>
                        </div>

                        {/* 3. ActionController button on the right */}
                        {/* Replaced the simple button with the ActionController component. */}
                        <div className="flex-shrink-0">
                          <ActionController
                            handlerType="button"
                            onAction={handleApplyNow}
                            actionFrom="Cards"
                            redirectTo={`/cards`}
                            buttonType="primary"
                            buttonClass={''}
                          >
                            {t('cards.APPLY FOR CARD')}
                          </ActionController>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {localState?.activeTab === 'allCards' && (
                <div className={``}>
                  <AllCards assignCardDetails={assignCardDetails} />
                </div>
              )}
            </div>
          </div>
          <h4 className={`text-2xl font-semibold text-titleColor mb-2 md:hidden justify-between items-center block`} >
            <button className={userConfig?.accountType !== "Business" && "cursor-pointer" || ""} onClick={() => userConfig?.accountType !== "Business" && navigate(`/cards/apply`)}>{t('cards.Available Cards')}
              {userConfig?.accountType !== "Business" && <button className='icon lg square-arrow cursor-pointer' onClick={() => navigate(`/cards/apply`)}></button>}</button>
          </h4>
          <div className='w-full rounded-5 border border-dbkpiStroke md:pb-5 pb-2.5 mb-5'>
            <div className={"overflow-y-auto max-h-[534px]"}>
              {!localState?.newCardsDataLodaer && localState?.newCardsData?.length == 0 &&
                <div className='nodata-content my-6'>
                  <div className='no-data'>
                    <img src={darknoData} width={'100px'} alt="No data available" className="dark:block hidden mx-auto"></img>
                    <img src={lightnoData} width={'100px'} alt="No data available" className="dark:hidden block mx-auto"></img>
                    <p className='text-lightWhite text-sm font-medium mt-3'>{t('cards.No Cards Available To Apply')} </p>
                  </div>
                </div>}

              {(!localState?.newCardsDataLodaer && localState?.newCardsData?.length > 0) && localState?.newCardsData?.map((item) => (
                <PhysicalCardComponent
                  cardData={item}
                  cardType={item?.type}
                  screenType="overview"
                  key={item?.id}
                />
              ))}
            </div>
          </div>
        </div>
        <div className='grid md:grid-cols-2'>
          <h3 className={`font-semibold text-titleColor mb-2 text-2xl md:block hidden`}>{t('cards.Recent Transactions')}</h3>
          <h3 className="text-2xl font-semibold text-titleColor mb-0 md:block hidden">{t('cards.Transactions Summary')}</h3>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <div className='w-full rounded-5 border border-dbkpiStroke mb-9 recent-grid-br'>
            <Transactions screenType={"Transactions"} screenName={"cards"} />
          </div>
          <div className='w-full rounded-5 border border-dbkpiStroke mb-9 p-2.5 md:p-5'>
            <SummaryGraph />
          </div>
        </div>
      </>}
    </>
  );
}
const connectStateToProps = ({ userConfig }) => {
  return { user: userConfig.details }
}
export default connect(connectStateToProps)(Overview)