import React, { isValidElement, useCallback, useEffect, useState } from 'react';
import { Input, List, Typography } from 'antd';
import { connect, useDispatch, useSelector } from 'react-redux';
import { getAllCardDetails, getMyCardsDetails, getPhysicalCardDetails } from '../../modules/cards/httpServices';
import AppAlert from './appAlert';
import ListLoader from '../skeleton/common.page.loader/list.loader';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { setRefreshLeftPanel } from '../../modules/wallets/fiat/withdraw.components/withdrawFiatReducer';
const  pageSize = 10;
const defaultPage = 1;
const itemKey = 'id';
const renderElement = (Element, extraProps = {}) => {
  if (isValidElement(Element)) {
    return cloneElement(Element, { ...Element.props, ...extraProps });
  }
  return Element;
};
import AppInfiniteScroll from './appInfiniteScroll';
import NumericText from './numericText';
import AppDefaults from '../../utils/app.config';
import DefaultCardImage from '../../assets/images/default-cards.png';
const Leftpanel = (props) => {
  const [leftPannelData, setLeftPannelData] = useState([]);
  const [leftPannelLoader, setLeftPannelLoader] = useState(true);
  const [isError, setIsError] = useState(null);
  const { Text } = Typography;
  const { Search } = Input;
  const [loadmore, setLoadmore] = useState(true);
  const [pageNo, setPageNo] = useState(1);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isleftPannelCall, setIsleftPannelCall]=useState(false);
  const [isChecked, setIsChecked] = useState(false); 
  const { t } = useTranslation();
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isRefreshLeftPanel = useSelector((storeInfo) => storeInfo?.withdrawFiat?.isRefreshLeftPanel);
  const urls = {
    "my cards": `cards`,
    "corporate cards": `${props?.user?.accountType}/Corporate/MyCards`,
    "assign cards": "AssignCards",
  };
  useEffect(() => {
    setSearchQuery('');
    getLeftPannelData(1);
    setIsleftPannelCall(false);
  }, [props?.screenType, props?.activeTab, isChecked]);
  useEffect(() => {
    if (isRefreshLeftPanel) {
      setSearchQuery('');
      getLeftPannelData(1);
      setIsleftPannelCall(false);
      dispatch(setRefreshLeftPanel(false));
    }
  }, [isRefreshLeftPanel]);
  useEffect(() => {
    if(props?.isSuccessCreationCard){
      setSearchQuery('');
      getLeftPannelData(1);
      setIsleftPannelCall(false);
    }
  }, [props?.isSuccessCreationCard]);

  useEffect(() => {
    if (props?.isTopUpChange) {
      setSearchQuery('');
      getLeftPannelData(1);
      setIsleftPannelCall(false);
    }
  }, [props?.isTopUpChange]);
  useEffect(() => {
    if (props?.isBack) {
      setSearchQuery('');
      getLeftPannelData(1);
      setIsleftPannelCall(false);
    }
  }, [props?.isBack]);
  const updateLeftPanelData = (response, currentPaze) => {
    if (currentPaze === 1) {
      let selectedRecord = response?.find(record => record.programId === props.curdId || record.id === props.curdId);
      if (!selectedRecord) {
        selectedRecord = response[0];
      }
      if (selectedRecord) {
        props.getLeftPanelData(selectedRecord,'default');
        setSelectedCard(selectedRecord);
      }else if(!selectedRecord && props?.screenType==="myCards"){
        props.getLeftPanelData(null);
      }
    }
  }
  const setGetCardsData = (response,currentPaze)=>{
    if (response) {
      setPageNo(currentPaze);
      const previousData = Array.isArray(leftPannelData) ? leftPannelData : [];
      const mergedData = currentPaze === 1 ? [...response] : [...previousData, ...response];
      setLoadmore(response?.length > 9);
      setLeftPannelData(mergedData);
      if(!isRefreshLeftPanel){
        setIsleftPannelCall(true);
        updateLeftPanelData(response, currentPaze);
      }else{
        setSelectedCard(response[0]||null);
      }      
    }else {
      !isRefreshLeftPanel && props?.getLeftPanelLoader(false);
      setIsError(response);
    }
  }
  const getLeftPannelData = async (currentPaze) => {
    try {
      !isRefreshLeftPanel && props?.getLeftPanelLoader(true);
      if (props?.screenType === "AllCards") {
        const urlParams = { id: props.user.id, pageSize: 10, pageNo: currentPaze || pageNo }
        await getAllCardDetails(setLeftPannelLoader,(response) => setGetCardsData(response, currentPaze), setIsError, urlParams)
      } 
      else if(props?.screenType==="QuickLinks"){
        const urlParams = {id:props.user.id}
        await getPhysicalCardDetails(setLeftPannelLoader,(response) => setGetCardsData(response, currentPaze), setIsError, urlParams)
      }
       else if(props?.screenType==="myCards"){
        const urlParams = {id:props.user.id,pageSize: 10,pageNo: currentPaze || pageNo,
          url: urls[props?.activeTab?.toLowerCase()],isExclude:isChecked,
          isBussinesMyCards: props?.activeTab === "My Cards" && props?.user?.accountType === "Business" }
        await getMyCardsDetails(setLeftPannelLoader,(response) => setGetCardsData(response, currentPaze), setIsError, urlParams)
      }
    } catch (error) {
      setIsError(error.message);
    }finally{
      !isRefreshLeftPanel && props?.getLeftPanelLoader(false);
      setLeftPannelLoader(false);
    }
  };

  const fetchMoreData = useCallback(async () => {
    if (loadmore && isleftPannelCall) {
      await getLeftPannelData(pageNo + 1);
    }
  },[loadmore,isleftPannelCall,pageNo,getLeftPannelData]);

  const getSelectedCoin = (item) => {
    setSelectedCard(item);
    props.getLeftPanelData(item,'selected');
  };

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'EUR':
        return '€';
      case 'USD':
        return '$';
      default:
        return '';
    }
  };

  const filteredData = leftPannelData?.filter(item =>
    (item.cardName || item.name)?.toLowerCase()?.includes(searchQuery?.toLowerCase()?.trim())
  );
  const handleCheckboxChange = useCallback((e) => {
    setIsChecked(e.target.checked);
  if(props?.curdId){
    navigate(`/cards/mycards/${props?.activeTab}`)
  }
},[props]);
  const handleSearchQueryChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);
  const ItemComponent = (data)=>{
    const cardInfo = data?.data;
    const handleClick = useCallback(() => {
      getSelectedCoin(cardInfo);
    },[cardInfo]);
    return(
      <List.Item
      key={cardInfo?.programId}
      className={`coin-item coin-flexgrow db-coinlist ${(cardInfo?.programId ?? cardInfo?.id) === (selectedCard?.programId ?? selectedCard?.id) ? "active" : ""}`}
      onClick={handleClick}
    >
      <List.Item.Meta
        avatar={<div><img src={cardInfo?.image || DefaultCardImage} alt="card" style={{width:'46px',height:'30px'}}/></div>}
        title={<><Text className="coin-title">{cardInfo?.cardName || cardInfo.name}</Text></>}
        description={
          <div className="coin-fillname">
            { cardInfo?.number ? `${cardInfo?.number?.substr(0, 4)} XXXX XXXX ${cardInfo?.number?.substr(-4)}` : 'XXXX XXXX XXXX XXXX'}
            <Text className="fw-600 text-upper text-secondary d-block"></Text>
            {props?.activeTab === "Assign Cards" && <p>{cardInfo?.assignedTo}</p>}
          </div>
        }
      />
      <div className="d-nonecoinlist text-right d-coinlist ">                
          {window.location.pathname.includes("apply") && cardInfo.type && <span className={`${cardInfo?.type === "Physical" ? "physical-badge " : "virtual-badge "}`}>{cardInfo.type}</span>}
          {window.location.pathname.includes("mycards") && <span className="coin-val coinval-width  !block">
            <NumericText className="font-semibold text-subTextColor"
              value={cardInfo?.amount}
              decimalScale={AppDefaults.fiatDecimals}
              prefixText={getCurrencySymbol(cardInfo?.currency)}
            />
          </span>
          }
        {window.location.pathname.includes("mycards") && cardInfo.type && <span className={`${cardInfo?.type === "Physical" ? "physical-badge" : "virtual-badge "}`}>{cardInfo.type}</span>}
      </div>
    </List.Item>
    )
  }
  
  return (
    
      <div className="coin-container">
      {isError !== undefined && isError !== null && (<div className='px-4'>
        <div className="alert-flex withdraw-alert fiat-alert">
        <AppAlert
          type="error"
          description={isError}
          showIcon
        />
        <span className="icon sm alert-close" onClick={()=>setIsError(null)}></span>

      </div>
      </div>
      )}
        <div className="coin-search dt-topspace">
          <Search
            placeholder={t('cards.applyCards.Search_Cards')}
            value={searchQuery}
            onChange={handleSearchQueryChange}
            suffix={<span className="icon md search c-pointer" />}
            size="middle"
            className="coin-search-input"
          />
        {!leftPannelLoader&& window.location.pathname.includes("mycards") && props?.user?.accountType === "Business" && props?.activeTab === "My Cards" &&
          <div className='flex items-center justify-end gap-1.5 mt-4 pr-1.5'>
            <p className='mb-0 text-sm font-normal text-lightWhite' >{t('cards.myCards.Exclude_Assigned')}</p>
            <label className="text-center custom-checkbox !mb-0">
              <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
              <span></span>{" "}
            </label>
          </div>}
        </div>
        <div>
        <List id='cards-scroll-div'>
        <List>
                <AppInfiniteScroll
                  data={filteredData}
                  containerHeight={600}
                  page={pageNo}
                  ItemComponent={renderElement(ItemComponent)}
                  Loader={ListLoader}
                  loading={leftPannelLoader}
                  pageSize={pageSize}
                  loadMore={fetchMoreData}
                  hasMore={loadmore}
                  defaultPage={defaultPage}
                  itemKey={itemKey}
                  handleListModalClose={props?.handleModalActions}
                  description={props?.noDataText}
                />
              </List>
          </List>
      </div>
      </div>
  );
};

const connectStateToProps = ({ userConfig }) => {
  return { user: userConfig.details };
};

export default connect(connectStateToProps)(Leftpanel);
