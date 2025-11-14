import React, { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { Modal, Tooltip, Row } from "antd";
import Transactions from "./card.transactions";
import { connect, useDispatch, useSelector } from "react-redux";
import Leftpanel from "../../../core/shared/leftpanel";
import ShowPin from "./card.showpin";
import SetPin from "./card.setpin";
import FreezeOrUnfreeze from "./card.freezecontrol";
import TopUp from "./card.topup";
import { useNavigate, useParams } from "react-router";
import { carddetails, getCardViewData } from "../httpServices";
import CommonDrawer from "../../../core/shared/drawer";
import PageHeader from "../../../core/shared/page.header";
import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader";
import defaultCardImg from "../../../assets/images/default-cards.png";
import {
  badgeColor,
  badgeStyle,
  formatCardNumber,
  getIconClass,
  getTooltipTitle,
} from "../service";
import AddCard from "./card.add";
import ActionController from "../../../core/onboarding/action.controller";
import { initialState, reducer } from "./card.reducer";
import { useTranslation } from "react-i18next";
import AppAlert from "../../../core/shared/appAlert";
import CardsKpis from "../overview";
import CardsScreenTabs from "../screenTabs";
import CustomButton from "../../../core/button/button";
import AppEmpty from "../../../core/shared/appEmpty";
import CardBind from "./card.bind";
import DetailsViewHeader from "./details.view.header";
import BindNote from "./bind.note";
import { decryptAES } from "../../../core/shared/encrypt.decrypt";
import { getSelectedCard } from "../reducers/applyCardReducer";
import NumericText from "../../../core/shared/numericText";
import AppDefaults from "../../../utils/app.config";
const CardDetails = (props) => {
  const navigate = useNavigate();
  const permissions = useSelector((state) => state.userConfig.permissions);
  const cardDivRef = React.useRef(null);
  const { cardId, tabName, action } = useParams();
  const currentScreen = useSelector((state) => state.userConfig.currentScreen);
  const [localState, localDispatch] = useReducer(reducer, initialState);
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const dispatch=useDispatch()

  const getLeftPanelData = useCallback(
    (leftpanneldata, type) => {
      localDispatch({
        type: "setLeftPanelSelectedData",
        payload: leftpanneldata,
      });
      localDispatch({ type: "setSelectedCurdID", payload: leftpanneldata?.id||leftpanneldata?.programId });
      localDispatch({ type: "setIsViewCard", payload: false });
      dispatch(getSelectedCard({ data: leftpanneldata }));
      if (leftpanneldata?.id||leftpanneldata?.programId) {
        navigate(
          `/cards/mycards/${localState?.activeTab}/${leftpanneldata?.id||leftpanneldata?.programId}`
        );
      } else {
        navigate(`/cards/mycards/${localState?.activeTab}`);
      }
    },
    [localState, navigate, dispatch]
  );
  const getLeftPanelLoader = useCallback(
    (panelLoader) => {
      localDispatch({ type: "setLoader", payload: panelLoader });
    },
    [localState]
  );
  const navigateToDashboard = () => {
    navigate(`/cards`);
  };
  const breadCrumbList = useMemo(() => {
    const defaultList = [
      {
        id: "1",
        title: `${t("cards.myCards.Cards")}`,
        handleClick: () => navigateToDashboard(),
      },
      { id: "2", title: `${t("cards.myCards.My_Cards")}` },
    ];
    let list = [...defaultList];
    if (localState?.leftPanelSelectedData?.cardName) {
      list = [
        ...list,
        { id: "3", title: localState?.leftPanelSelectedData?.cardName },
      ];
    }
    return list;
  }, [localState?.leftPanelSelectedData?.cardName, t]);
  useEffect(() => {
    if (localState?.selectedCurdID || cardId) {
      getCardDetails();
    }
  }, [
    localState?.selectedCurdID,
    localState?.activeTab,
  ]);
  useEffect(()=>{
    if(localState?.isTopUpChange){
      handleTopUpChange(false)
    }
  },[localState?.isTopUpChange])
  useEffect(() => {
    const checkMobileView = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);
  const setGetCardsData = (response) => {
    if (response) {
      localDispatch({ type: "setDetails", payload: response });
      localDispatch({
        type: "setIsShowMyStatusProgress",
        payload: response?.state,
      });
      localDispatch({
        type: "setFreeze",
        payload: response?.state?.toLowerCase() == "freezed",
      });
      const transactionFlags = response?.transactionAdditionalFields
        ? JSON.parse(response?.transactionAdditionalFields)
        : {};
      localDispatch({ type: "setTransactionFlags", payload: transactionFlags });
      localDispatch({ type: 'setLoader', payload: false });
    } else {
      cardDivRef.current.scrollIntoView(0, 0);
      localDispatch({ type: "setErrorMsg", payload: response });
      localDispatch({ type: 'setLoader', payload: false });
    }
  };
  const getCardDetails = async () => {
    localDispatch({ type: "setErrorMsg", payload: null });
    const urlParams = {
      id: props.user.id,
      cardid: localState?.selectedCurdID || cardId,
      cardType:
        localState?.leftPanelSelectedData?.type?.toLowerCase() === "physical"
          ? "PhysicalCards"
          : "VirtualCards",
    };
    await carddetails(localDispatch, setGetCardsData, urlParams);
  };
  const showModal = () => {
    localDispatch({ type: "setIsViewCard", payload: false });
    if (!localState?.details?.isFreezEnable) {
      localDispatch({
        type: "setErrorMsg",
        payload: t("cards.Messages.CONTACT_ADMIN"),
      });
    } else {
      localDispatch({ type: "setErrorMsg", payload: null });
      handleFreezeModal();
    }
  };
  const topup = async () => {
    localDispatch({ type: "setErrorMsg", payload: null });
    if (localState?.freeze) {
      localDispatch({
        type: "setErrorMsg",
        payload: t("cards.Messages.CARD_FREEZE_TOPUP"),
      });
    } else {
      localDispatch({ type: "setErrorMsg", payload: null });
      handleTopUpModal();
      handleShowTransactions(false)
    }
  };
  const handlePinVisibility = () => {
    localDispatch({ type: "setErrorMsg", payload: null });
    if (localState?.freeze) {
      localDispatch({
        type: "setErrorMsg",
        payload: t("cards.Messages.CARD_FREEZE_PIN"),
      });
    } else {
      localDispatch({ type: "setErrorMsg", payload: null });
      handleSetPinModal();
      handleShowTransactions(false)
    }
  };
  const isNotEmpty = (obj) => {
    return obj && Object.keys(obj)?.length > 0;
  };
  const handleModalActions = useCallback(() => {
    localDispatch({
      type: "setIsModalOpen",
      payload: !localState?.isModalOpen,
    });
  }, [localState]);
  const setGetCardViewData = (response) => {
    if (response) {
      localDispatch({
        type: "setIsViewCard",
        payload: response,
      });
    }
  };
  const handleView = async () => {
    if (localState?.isShowMyStatusProgress?.toLowerCase() === "approved" && !localState?.isViewCard) {
      const urlParams = {
        cardid: localState?.selectedCurdID || cardId,
      };
      await getCardViewData(localDispatch, setGetCardViewData, urlParams);
    }else{
      localDispatch({ type: "setIsViewCard", payload: false });
    }
  };
  const handleShowPinModal = useCallback(() => {
    localDispatch({
      type: "setShowPinModal",
      payload: !localState?.showPinModal,
    });
  }, [localState]);
  const handleSetPinModal = useCallback(
    (action) => {
      localDispatch({
        type: "setSetPinModal",
        payload: !localState?.setPinModal,
      });
      if (action == "save") {
        localDispatch({ type: "setModalAction", payload: action });
        localDispatch({ type: "setAvailableBalanceUpdate", payload: action });
        getCardDetails();
      }
    },
    [localState]
  );
  const handleFreezeModal = useCallback(
    (action) => {
      localDispatch({
        type: "setFreezeModal",
        payload: !localState?.freezeModal,
      });
      localDispatch({ type: "setModalAction", payload: action });
      if (action == "save") {
        localDispatch({
          type: "setIsTopUpChange",
          payload: !localState?.isTopUpChange,
        });
        const updatedDisabled = {};
        const activeTabObject = permissions?.tabs?.find(
          (tab) => tab.name === localState?.activeTab
        );

        activeTabObject?.actions?.forEach((permission, index) => {
          updatedDisabled[index] =
            permission.name !== "Freeze" &&
            localState?.details.state === "Approved";
        });
        localDispatch({ type: "setDisabledIcons", payload: updatedDisabled });
        getCardDetails();
      }
    },
    [localState, permissions]
  );
  const handleTopUpModal = useCallback(
    (action) => {
      localDispatch({
        type: "setTopUpModal",
        payload: !localState?.topUpModal,
      });
      if (action == "save") {
        getCardDetails();
        localDispatch({ type: "setModalAction", payload: action });
        localDispatch({ type: "setAvailableBalanceUpdate", payload: action });
      }
    },
    [localState]
  );
  const handleErrorMessage = useCallback(
    (error) => {
      localDispatch({ type: "setErrorMsg", payload: error });
      error && cardDivRef.current.scrollIntoView(0, 0);
    },
    [cardDivRef]
  );
  const handleShowTransactions = useCallback(
    (flag) => {
      localDispatch({ type: "setShowTransactions", payload: flag });
    },
    [localState]
  );
  const handleTopUpChange = useCallback(
    (flag) => {
      localDispatch({ type: "setIsTopUpChange", payload: flag });
    },
    [localState]
  );
  const showActions = () => {
    const tabs = permissions?.permissions?.tabs || [];
    if (tabs?.length === 0) {
      return;
    }
    const activeTabObject = tabs?.find(
      (tab) => tab.name === localState?.activeTab
    );
    if (activeTabObject?.actions?.length === 0) {
      return [];
    }
    const state = localState?.details?.state?.toLowerCase();
    const type = localState?.details?.type?.toLowerCase();
    const isApprovedOrFreezed = state === "approved" || state === "freezed";
    const isCompanyCard = localState?.details?.isCompanyCard;
    const IsCardAssignedValue = localState?.transactionFlags?.IsCardAssignedValue;

    let filteredPermissions = activeTabObject?.actions?.filter(
      (permission) => {
        switch (permission.name) {
          case "Top Up":
          case "View":
          case "Freeze":
            return isApprovedOrFreezed;
          case "Set Pin":
            return (
              localState?.details?.cardSetPinAmountFee && isApprovedOrFreezed
            );
          case "Show Pin":
            return type === "physical" && isApprovedOrFreezed;
          case "Assign Card":
            return (
              props?.user?.accountType === "Business" &&
              IsCardAssignedValue === true &&
              isApprovedOrFreezed
            );
          default:
            return false;
        }
      }
    );
    if (isCompanyCard) {
      filteredPermissions = filteredPermissions?.filter(
        (perm) => perm.name === "View" || perm.name === "Freeze"
      );
    }
    return filteredPermissions || [];
  };
  const filteredPermissions = showActions();
  const handleActionClick = useCallback(
    (e, isClickEvent = true) => {
      const actionName = isClickEvent ? e.currentTarget.id : e;

      const state = localState?.details?.state?.toLowerCase();
      const type = localState?.details?.type?.toLowerCase();
      const isApprovedOrFreezed = state === "approved" || state === "freezed";

      switch (actionName) {
        case "Top Up":
          if (state === "approved") {
            topup();
          }
          break;
        case "View":
          handleView();
          break;
        case "Freeze":
          if (isApprovedOrFreezed) {
            showModal();
          }
          break;
        case "Set Pin":
          if (
            localState?.details?.cardSetPinAmountFee &&
            state === "approved"
          ) {
            handlePinVisibility();
          }
          break;
        case "Show Pin":
          if (type === "physical" && state === "approved") {
            handleShowPinModal();
          }
          break;
        case "Assign Card":
          if (state === "approved") {
            handleAssignCard(true);
          }
          break;
        default:
          break;
      }
    },
    [localState]
  );
  const handleAssignCard = useCallback((flag) => {
    localDispatch({ type: "setAssignCard", payload: flag });
  }, []);
  const clearErrorMsg = useCallback(() => {
    localDispatch({ type: "setErrorMsg", payload: null });
  }, [localState]);
  const getFreezeTitle = useCallback(() => {
    const freezeAction =
      localState?.details?.state?.toLowerCase() === "freezed"
        ? t("cards.freeze.UnFreeze")
        : t("cards.freeze.Freeze");
    return `${t("cards.freeze.Confirm")} ${freezeAction}`;
  }, [localState, t]);
  const navigateToBindCard = useCallback(() => {
    navigate(
      `/cards/mycards/${tabName}/${cardId}/${localState.details?.programId}/bind`
    );
  }, [localState.details, cardId]);
  const onBindSuccess = useCallback(() => {
    handleTopUpChange(true);
    getCardDetails();
  }, [localState?.selectedCurdID, cardId]);
  const handleAssignCardModel = useCallback((action) => {
    if (action == "save") {
      getCardDetails();
    }
  }, [localState]);

  return (
    <>
      <PageHeader breadcrumbList={breadCrumbList} />
      <CardsKpis />

      <Row className="row-stretch">
        <div className="layout-bg left-panel pannel-bg left-items-stretch sm-none cards-container">
          <CardsScreenTabs screenName={"MyCards"} />
          <Leftpanel
            getLeftPanelData={getLeftPanelData}
            isTopUpChange={localState?.isTopUpChange}
            getLeftPanelLoader={getLeftPanelLoader}
            curdId={localState?.selectedCurdID || cardId}
            noDataText={`${t("cards.myCards.No_Cards_Available")}`}
            activeTab={localState?.activeTab}
            screenType={"myCards"}
            handleModalActions={handleModalActions}
          />
        </div>
        {isMobile &&<>
        <div className="layout-bg left-panel pannel-bg left-items-stretch md-none">
          <div className="bg-leftamountbg border border-StrokeColor rounded-sm p-[14px] md-none">
            <CardsScreenTabs screenName={"MyCards"} />
          </div>
        </div>
        <div className="layout-bg left-panel pannel-bg left-items-stretch md-none">
          <div className="buy-token md-none mt-0">
            <div className="buy-coinselect" onClick={handleModalActions}>
              <span className="buy-from">
                {localState?.leftPanelSelectedData?.cardName ||
                  t("cards.myCards.Select_Card")}
              </span>
              <span className="icon sm down-angle" />
            </div>
          </div>
        </div> </>}
        <div className="layout-bg right-panel withdraw-rightpanel min-h-[85vh]">
          <div ref={cardDivRef}></div>
          {localState?.loader && <ContentLoader />}
          {localState?.errorMsg !== undefined &&
            localState?.errorMsg !== null && (
              <div className="alert-flex mb-24">
                <AppAlert
                  type="error"
                  description={localState?.errorMsg}
                  afterClose={clearErrorMsg}
                  closable={true}
                  showIcon
                />
              </div>
            )}
          {!localState?.loader &&
            !isNotEmpty(localState?.leftPanelSelectedData) && (
              <div className="nodata-content loader-position flex justify-center items-center">
              <AppEmpty description={ props?.user?.role?.toLowerCase() === 'employee' ? 'No Cards Available' : `It Looks like you dont have any cards yet. Let's apply one to get started .`} >
                {props?.user?.role?.toLowerCase() !== 'employee' && <button
                  type="button"
                  className="cardssecondary-outline"
                  onClick={() => navigate('/cards/apply')}
                >
                  Apply Card 
                </button>}
              </AppEmpty>
              </div>
            )}

          {!localState?.loader && isNotEmpty(localState?.leftPanelSelectedData) && isNotEmpty(localState?.details) && (
            <>
              {!action && (
                <>
                  <DetailsViewHeader
                    hasData={isNotEmpty(localState?.leftPanelSelectedData)}
                    data={localState.details}
                  />
                  <div className="panel-card buy-card card-paddingrm">
                    <div className="card-paddingadd">
                      <div className="buy-rpanel">
                        <div
                          className={`inner-card ${
                            localState?.details?.type?.toLowerCase() ==
                            "physical"
                              ? "physical-bg"
                              : "virtual-bg"
                          }`}
                        >
                          <div
                            className={
                              "carosal-card card-bg mb-0 card-block cust-card-height cust-cards-position"
                            }
                          >
                            <img
                              src={localState?.details?.image || defaultCardImg}
                              alt={localState?.details?.name}
                              className="card-img view-card-img"
                            ></img>
                            <div className=" absolute right-4 top-0">
                              <p className={`px-3 py-0.5 rounded-b-2xl ${localState?.details?.type?.toLowerCase() == "physical" ? "bg-darkpurple" : "bg-purpleBlueGradiant"} text-textWhite flex justify-center items-center text-xs`}>
                                <span>{localState?.details?.type}</span>
                              </p>
                            </div>
                            <div className="mb-4 absolute top-0 left-0 h-full w-full p-4 flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                <h4 className="detailcard-name">
                                  {localState?.details?.name}
                                </h4>
                              </div>
                              <div>
                                <p className="card-number mb-0">
                                  {" "}
                                  {formatCardNumber(
                                    localState?.isViewCard,localState?.details
                                  )}{" "}
                                </p>
                              </div>
                              {localState?.details.state && 
                              <div className="mt-1">
                                <p
                                  className={`card-state-default`}
                                  style={{
                                    backgroundColor:
                                      badgeStyle[
                                        localState?.details.state?.toLowerCase()
                                      ] || "#037A00",
                                    color:
                                      badgeColor[
                                        localState?.details.state?.toLowerCase()
                                      ] || "#ffff",
                                  }}
                                >
                                  {localState?.details?.state === "Approved"
                                    ? "Active"
                                    : localState?.details?.state}
                                </p>
                              </div>
                              }

                              <div className="mt-3 md:mt-1">
                                {/* <p className='detailcard-name !capitalize'>{localState?.details?.name}</p> */}
                                <div className="flex items-end justify-between">
                                  <div>
                                    <p className="text-textWhite md:text-base text-sm font-normal">
                                      Card Currency
                                    </p>
                                    <p className="md:text-md text-base text-textWhite font-semibold">
                                      {localState?.details?.cardcurrency||localState?.details?.cardCurrency}
                                    </p>
                                  </div>
                                  <h2 className="text-md font-semibold m-0 text-textWhite">
                                    {localState?.isViewCard?.expireDate
                                      ?  decryptAES(localState?.isViewCard?.expireDate)
                                      : "**/**"}
                                  </h2>
                                  <h2 className="text-md font-semibold m-0 text-textWhite">
                                    {localState?.isViewCard?.cvv
                                      ? decryptAES(localState?.isViewCard?.cvv)
                                      : "***"}
                                  </h2>
                                <p className='text-textWhite text-2xl font-semibold '> {localState?.details?.assoc||'VISA'} </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          {localState?.details?.type === "Physical" &&
                            localState?.details?.state === "Pending" && 
                            !localState?.details?.iHaveCard &&  (
                              <div className="text-center md:mt-4 mt-16">
                                <BindNote />
                                <div className="mt-8">
                                <CustomButton
                                  type="primary"
                                  onClick={navigateToBindCard}
                                  className="w-full"
                                >
                                  Bind Now
                                </CustomButton>
                                </div>
                              </div>
                            )}
                          {(localState?.details?.type === "Virtual" ||
                            (localState?.details?.type === "Physical" &&
                              localState?.details?.iHaveCard)) && (
                            <>
                              {isNotEmpty(
                                localState?.leftPanelSelectedData
                              ) && (
                                <div>
                                  <ul className="flex gap-4 items-center justify-center mt-4">
                                    {filteredPermissions?.length > 0 &&
                                      filteredPermissions?.map(
                                        (action, index) => {
                                          const normalizedName =
                                            action.name?.toLowerCase();
                                          const tooltipTitle = getTooltipTitle(
                                            action.name,
                                            localState?.details?.state
                                          );
                                          return (
                                            <li key={action.name}>
                                              <Tooltip
                                                placement="top"
                                                title={tooltipTitle}
                                                className="inline-block"
                                              >
                                                {" "}
                                                {localState?.activeTab !==
                                                "Corporate Cards" ? (
                                                  <ActionController
                                                    handlerType="button"
                                                    actionParams={[
                                                      action?.name,
                                                      false,
                                                    ]}
                                                    onAction={handleActionClick}
                                                    actionFrom={
                                                      currentScreen?.featureName
                                                    }
                                                    buttonType="plain"
                                                    buttonClass={
                                                      "p-0 rounded-full hover:bg-transparent focus:outline-0 outline-offset-0 border-none"
                                                    }
                                                    redirectTo={
                                                      currentScreen?.path
                                                    }
                                                    disabled={
                                                      localState?.disabledIcons[
                                                        index
                                                      ] || false
                                                    }
                                                    allowWithoutKyc={localState?.details?.isCompanyCard === true }
                                                  >
                                                    <button
                                                      disabled={
                                                        localState
                                                          ?.disabledIcons[
                                                          index
                                                        ] || false
                                                      }
                                                    >
                                                      <span
                                                        className={getIconClass(
                                                          normalizedName,
                                                          localState?.isViewCard,
                                                          localState?.disabledIcons,
                                                          index,
                                                          localState?.details
                                                            ?.state
                                                        )}
                                                      ></span>
                                                    </button>
                                                  </ActionController>
                                                ) : (
                                                  <button
                                                    id={action?.name}
                                                    onClick={handleActionClick}
                                                    disabled={
                                                      localState?.disabledIcons[
                                                        index
                                                      ] || false
                                                    }
                                                  >
                                                    <span
                                                      className={getIconClass(
                                                        normalizedName,
                                                        localState?.isViewCard,
                                                        localState?.disabledIcons,
                                                        index,
                                                        localState?.details
                                                          ?.state
                                                      )}
                                                    ></span>
                                                  </button>
                                                )}
                                              </Tooltip>
                                            </li>
                                          );
                                        }
                                      )}
                                  </ul>
                                </div>
                              )}
                              <div className="progress-section mt-4">
                                <div className=" panel-card summary-list summary-panel">
                                  <div className="summary-list-item">
                                    <h2 className="summary-label">
                                      {t("cards.myCards.Holder_Name")}
                                    </h2>
                                    <h2 className="summary-text m-0 break-all">
                                      {localState?.details?.holderName ||'--'}
                                    </h2>
                                  </div>
                                  <div className="summary-list-item">
                                    <h2 className="summary-label">
                                      {t("cards.myCards.CVV")}
                                    </h2>
                                    <h2 className="summary-text m-0 break-all">
                                      {localState?.isViewCard?.cvv
                                        ? decryptAES(localState?.isViewCard?.cvv) 
                                        : "***"}
                                    </h2>
                                  </div>
                                  <div className="summary-list-item">
                                    <h2 className="summary-label">
                                      {t("cards.myCards.Valid_Upto")}
                                    </h2>
                                    <h2 className="summary-text m-0 break-all">
                                      {localState?.isViewCard?.expireDate
                                        ? decryptAES(localState?.isViewCard?.expireDate) 
                                        : "**/**"}
                                    </h2>
                                  </div>
                                  {props?.user?.accountType === "Business" && localState?.transactionFlags?.IsCardAssignedValue &&
                                  <div className="summary-list-item">
                                    <h2 className="summary-label">
                                      {t("cards.myCards.Assigned_To")}
                                    </h2>
                                    <h2 className="summary-text m-0 break-all">
                                      {localState?.details?.assignedTo || "--"}
                                    </h2>
                                  </div>}
                                  <div className="bg-menuhover border border-dashed border-summarytotalbr md:mt-6 mt-10 py-4 px-3 flex items-center justify-between rounded-lg">
                                    <h2 className="text-xl font-semibold text-lightWhite">
                                      {t("cards.myCards.Card_Balance")}
                                    </h2>
                                    <NumericText className="font-semibold text-subTextColor !text-xl"
                                      value={localState?.details?.amount}
                                      suffixText={localState?.details?.cardcurrency}
                                      decimalScale={AppDefaults.fiatDecimals}
                                      prefixText={(localState?.details?.cardcurrency || localState?.details?.cardCurrency) === 'USD' ? '$' : '€'} 
                                    />
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {(localState?.details?.type === "Virtual" ||
                    (localState?.details?.type === "Physical" &&
                      localState?.details?.state !== "Pending")) && (
                    <div className="right-panel-transactions">
                      <Transactions
                        showTransactions={localState?.showTransactions}
                        screenName="Details"
                        cardId={
                          localState?.selectedCurdID ||
                          localState?.leftPanelSelectedData?.id
                        }
                        key={localState?.leftPanelSelectedData?.cardName}
                        screenType={"Transactions"}
                      ></Transactions>
                    </div>
                  )}
                </>
              )}
              {isNotEmpty(localState?.leftPanelSelectedData) &&
                action === "bind" && (
                  <CardBind
                    onBindSuccess={onBindSuccess}
                    cardDetails={localState.details}
                  />
                )}
            </>
          )}
        </div>
      </Row>
      <Modal
        className="custom-modal mobile-drop mobile-modal"
        onCancel={handleModalActions}
        closable={true}
        visible={localState?.isModalOpen}
        footer={false}
      >
        <div className="custom-flex p-4 pb-0">
          <h1 className="text-2xl text-titleColor font-semibold">
            {t("cards.myCards.My_Cards")}
          </h1>
          <span
            onClick={handleModalActions}
            className="icon lg close c-pointer"
          ></span>
        </div>

        <div
          id="scrollableDiv"
          className="mobile-left-panel mycards-mobile-leftpanel"
        >
          <div className="custom-flex p-4 pb-0"></div>
          <Leftpanel
            getLeftPanelData={getLeftPanelData}
            isTopUpChange={localState?.isTopUpChange}
            getLeftPanelLoader={getLeftPanelLoader}
            curdId={localState?.selectedCurdID || cardId}
            noDataText={`${t("cards.myCards.No_Cards_Available")}`}
            activeTab={localState?.activeTab}
            screenType={"myCards"}
            handleModalActions={handleModalActions}
          />
        </div>
      </Modal>

      {localState?.freezeModal && (
        <CommonDrawer
          title={getFreezeTitle()}
          isOpen={localState?.freezeModal}
          onClose={handleFreezeModal}
        >
          <FreezeOrUnfreeze
            user={props?.user}
            cardDetails={localState?.details}
            selectedCurdID={localState?.selectedCurdID}
            handleErrorMessage={handleErrorMessage}
            handleFreezeModal={handleFreezeModal}
          ></FreezeOrUnfreeze>
        </CommonDrawer>
      )}

      {localState?.setPinModal && (
        <CommonDrawer
          title={t("cards.setPin.Set_Pin")}
          isOpen={localState?.setPinModal}
          onClose={handleSetPinModal}
        >
          <SetPin
            handleSetPinModal={handleSetPinModal}
            cardDetails={localState?.details}
            user={props?.user}
            selectedCurdID={localState?.selectedCurdID}
            handleTopUpChange={handleTopUpChange}
            handleShowTransactions={handleShowTransactions}
          ></SetPin>
        </CommonDrawer>
      )}

      {localState?.showPinModal && (
        <CommonDrawer
          title={t("cards.showPin.Show_Pin")}
          isOpen={localState?.showPinModal}
          onClose={handleShowPinModal}
        >
          <ShowPin
            cardDetails={localState?.details}
            user={props?.user}
          ></ShowPin>
        </CommonDrawer>
      )}
      {localState?.topUpModal && (
        <CommonDrawer
          title={t("cards.topUp.Top_Up")}
          isOpen={localState?.topUpModal}
          onClose={handleTopUpModal}
        >
          <TopUp
            handleTopUpModal={handleTopUpModal}
            cardDetails={localState?.details}
            selectedCurdID={localState?.selectedCurdID}
            handleShowTransactions={handleShowTransactions}
            handleTopUpChange={handleTopUpChange}
          ></TopUp>
        </CommonDrawer>
      )}
      {localState?.assignCard && (
        <AddCard
          title={t("cards.assignCard.Assign_Card")}
          isOpen={localState?.assignCard}
          onClose={handleAssignCard}
          handleAssignCardModel={handleAssignCardModel}
          cardDetails={localState?.details}
        />
      )}
    </>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return {
    user: userConfig.details,
    trackauditlogs: userConfig?.trackAuditLogData,
  };
};
export default connect(connectStateToProps)(CardDetails);
