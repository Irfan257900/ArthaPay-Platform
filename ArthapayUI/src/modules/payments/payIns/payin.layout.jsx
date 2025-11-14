import React, { useState, useMemo, useEffect, useReducer, useCallback, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import AppDefaults from "../../../utils/app.config";
import { fetchPayins, payinInvoiceDwd ,getwalletsTotalBalance} from '../httpServices' ;
import { Dropdown, Menu, Spin, Tooltip } from "antd";
import FormItem from "antd/es/form/FormItem";
import { actionStatusList, statusWarningTexts } from "./service";
import { payInsReducer, payInsState } from "./reducer";
import StateChange from "./stateChange";
import AppAlert from "../../../core/shared/appAlert";
import { successToaster } from "../../../core/shared/toasters";
import { LoadingOutlined } from "@ant-design/icons"
import ActionController from "../../../core/onboarding/action.controller";
import { replaceExtraSpaces } from "../../../core/shared/validations";
import { useTranslation } from "react-i18next";
import { toasterMessages } from "./payin.constants";
import ShareOptions from "../../../core/shared/shareOptions";
import { NumericFormat } from "react-number-format";
import { setSelectedTab } from "../payouts/payout.accordion.reducer";
import ScreenTabs from "../../../core/shared/screenTabs";
import NumericText from "../../../core/shared/numericText";
import PaymentsKpis from "../kpis.and.tabs";
const pageSize = 10;

const badgeColors = {
  'Paid': "!text-paidApproved !border !border-paidApproved",
  'Not Paid': '!text-notPaid !border !border-notPaid',
  'Cancelled': '!text-canceled !border !border-canceled',
  'Partially Paid': "!text-partiallyPaid !border !border-partiallyPaid",
}

const PayInsLayout = () => {
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const [loaderDwnd, setLoaderDwnd] = useState(false);
  const [searchInput, setSearchInput] = useState(null);
  const [selectedPayin, setSelectedPayin] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [balanceLoader, setBalanceLoader] = useState(false);
  const [totalBalances, setTotalBalances] = useState(0);
  const [payinViewDetails, setPayinViewDetails] = useState(null);
  const [state, setState] = useReducer(payInsReducer, payInsState)
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id, mode, type, vaultName} = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const activeKeyForTab = useSelector((state) => state?.payoutAccordianReducer?.selectTab);
  const userProfile = useSelector((store) => store.userConfig.details);
  const tabs = useSelector((state) => state?.userConfig?.permissions?.permissions?.tabs);
  const permissions = tabs?.filter((item) => item?.name === 'Pay In');

  const breadCrumbList = useMemo(() => {
    const defaultList = [
      { id: "1", title: `${t('payments.breadcrumb.payments')}`, handleClick: () => navigate('/payments') },
    ];

    if (!mode || (mode !== 'generate' && !selectedPayin?.invoiceNo)) {
      return defaultList;
    }

    const formattedMode = mode !== 'generate'
      ? `${selectedPayin?.invoiceNo?.[0]?.toUpperCase()}${selectedPayin?.invoiceNo?.substring(1)}`
      : `${mode?.[0]?.toUpperCase()}${mode?.substring(1)}`;

    let list = [...defaultList];

    if (mode === "generate") {
      list = [
        ...list,
        {
          id: "2",
          title: `${t('payments.payin.payin')}`,
          handleClick: () => navigate(
            `/payments/payins/payin/${selectedPayin?.id}/${selectedPayin?.invoiceNo}/view/${selectedPayin?.type}`
          )
        },
        { id: "3", title: `${t('payments.breadcrumb.createinvoice')}`, url: "" }
      ];
    } else if (mode === "update") {
      if (type === "Static") {
        list = [
          ...list,
          {
            id: "2", title: `${t('payments.payin.payin')}`, handleClick: () => navigate(
              `/payments/payins/payin/${selectedPayin?.id}/${selectedPayin?.invoiceNo}/view/${selectedPayin?.type}`
            )
          },
          { id: "3", title: `${t('payments.breadcrumb.editstaticinvoice')}` }
        ];
      } else if (type === "Invoice") {
        list = [
          ...list,
          {
            id: "2", title: `${t('payments.payin.payin')}`, handleClick: () => navigate(
              `/payments/payins/payin/${selectedPayin?.id}/${selectedPayin?.invoiceNo}/view/${selectedPayin?.type}`
            )
          },
          { id: "3", title: `${t('payments.breadcrumb.editregularinvoice')}` }
        ];
      } else {
        list = [
          ...list,
          {
            id: "2", title: `${t('payments.payin.payin')}`, handleClick: () => navigate(
              `/payments/payins/payin/${selectedPayin?.id}/${selectedPayin?.invoiceNo}/view/${selectedPayin?.type}`
            )
          },
          { id: "3", title: formattedMode }
        ];
      }
    } else {
      list = [
        ...list,
        { id: "2", title: `${t('payments.payin.payin')}` },
        { id: "3", title: formattedMode }
      ];
    }
    return list;
  }, [selectedPayin?.merchantName, mode, type, id, t]);

const getDataCalled = useRef(false);

useEffect(() => {
  if (
    activeKeyForTab === "Pay In" &&
    location.pathname === "/payments/payins" &&
    !getDataCalled.current
  ) {
    getDataCalled.current = true;
    getData();
  } else if (location.pathname !== "/payments/payins") {
    getDataCalled.current = false; // Reset the flag if you navigated away
  }
}, [activeKeyForTab, location.pathname]);

  useEffect(() => {
    navigate('/payments/payins')
    dispatch(setSelectedTab('Pay In'));
    cryptoBalances();
  }, []);

  const cryptoTotalBalances = useCallback(async () => {
    await getwalletsTotalBalance(setBalanceLoader, setTotalBalances, setErrorMessage, true,"payin")
    await getData([], 1, searchInput || null, true);
  }, []);

    const cryptoBalances = useCallback(async () => {
    await getwalletsTotalBalance(setBalanceLoader, setTotalBalances, setErrorMessage, true,"payin")
  }, [])


  const invoiceDownload = useCallback(async () => {
    const urlParams = {
      id: selectedPayin?.id,
      type: selectedPayin?.type
    }
    await payinInvoiceDwd(setLoaderDwnd, setGetdownloadInvoice, setState, urlParams);
  },[id,type,selectedPayin])

  const setGetdownloadInvoice = (response) => {
    setLoader(false);
    const link = document.createElement('a');
    link.href = response;
    link.download = selectedPayin?.invoiceNo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    successToaster({ content: toasterMessages.download })
  }

  const clearErrorMessage = () => {
    setState({ type: 'setError', payload: null })
  }

  const getData = async (
    currentData = [],
    pageToFetch = 1,
    searchValue = searchInput || null,
    isCancel = ''
  ) => {
    const urlParams = {
      id: userProfile?.id,
      searchValue: searchValue,
      pageNo: pageToFetch,
      pageSize: pageSize,
      currentData: data,
      cusName: vaultName
    }
    if(pageToFetch === 1) {
    await fetchPayins(setLoader, setData, setErrorMessage, urlParams, selectPayin, setPage, isCancel);
    }else{
      return
    }
  };

  const selectPayin = useCallback((payinToSelect) => {
    const {
      id,
      invoiceNo,
      mode = "view",
      type,
    } = payinToSelect || {};
    setSelectedPayin(payinToSelect);
    setState({ type: 'setError', payload: null })
    if (!payinToSelect) {
      return
    } else {
      navigate(`/payments/payins/payin/${id}/${invoiceNo}/${mode}/${type}`);
    }

  }, []);


  const handleForm = useCallback(() => {
    setState({ type: 'setError', payload: '' })
    navigate(`/payments/payins/payin/${AppDefaults.GUID_ID}/new/generate`);
  }, []);

  const handleSearchPayin = useCallback((value) => {
    value = replaceExtraSpaces(value);
    setSearchInput(value);
    getData([], 1, value || null);
  }, []);

  const fetchNextPage = useCallback(async (pageToFetch) => {
    await getData(data, pageToFetch + 1)
  }, [data])
  const handleSelectPayin = useCallback((item) => {
    selectPayin(item)
  }, [])


  const ItemRow = useCallback(({ data, handleListModalClose }) => {
    return (
      <ListDetailLayout.ListItem
        data={data}
        itemFields={{
          id: "id",
          title: "invoiceNo",
          logo: "image",
          status: "status",
        }}
        handleListModalClose={handleListModalClose}
        badgeColor={badgeColors}
        selectedRow={selectedPayin}
        onItemSelect={handleSelectPayin}
        hasStatusBadge={true}
        ItemDescription={
          <div className="text-xs font-medium text-summaryLabelGrey !flex">
            {`${data?.currency} (${data?.network})`}
          </div>
        }
      >
        <span className="text-xs font-medium text-summaryLabelGrey !flex">
          <NumericFormat value={data?.amount} displayType="text" decimalScale={4} thousandSeparator={true} /> {data?.currency}
        </span>
      </ListDetailLayout.ListItem>
    );
  }, [badgeColors, selectedPayin, handleSelectPayin]);

  const shareConfig = {
    url: `${payinViewDetails?.paymentLink} \nThank you.`,
    showWhatsapp: true,
    showEmail: true,
    showTwitter: false,
    showTelegram: false,
    emailSubject: "Wallet Address",
    whatsappTitle: `Hello, I would like to share my ${payinViewDetails?.currency} (${payinViewDetails?.network}) address for receiving: \n${payinViewDetails?.walletAddress}\nPlease make sure you are using the correct protocol otherwise you are risking losing the funds.\nI am using Payment Gateway:`,
    emailContent: `Hello, I would like to share my ${payinViewDetails?.currency} (${payinViewDetails?.network}) address for receiving: \n${payinViewDetails?.walletAddress}\nPlease make sure you are using the correct protocol otherwise you are risking losing the funds.\nI am using Payment Gateway:\n`,
    btnBoxClass: "",
    whatsappIcon: 'icon lg whatsapp',
    emailIcon: 'icon lg mail'
  }

  const menu = (
    <Menu className="share-payments !bg-transparent">
      <ul className="dropdown-list share-payment-link">
        <FormItem className="mb-0 ">
          <div className="d-flex share-icons">
            <Menu className="share-adrs text-center">
              <Menu.Item >
                <ActionController
                  handlerType="button"
                  redirectTo='/payments/payins'
                  actionFrom="Payments"
                  buttonType="plain"
                  buttonClass={'cursor-pointer c-pointer border-none p-0 outline-none'}
                >
                  <ShareOptions shareConfig={shareConfig} />
                </ActionController>
              </Menu.Item>
            </Menu>
          </div>
        </FormItem>
      </ul>
    </Menu>
  );

  const handleAction = useCallback((key) => {
    const selectedPayinData = selectedPayin
    const status = selectedPayinData?.status?.toLowerCase() || ''
    if (actionStatusList[key]?.includes(status)) {
      setState({ type: 'setError', payload: statusWarningTexts(key)[status] })
      return key === 'share' ? Promise.reject() : Promise.resolve();
    }
    const actions = {
      'Edit': updateLink,
      'State Change': handleStateChange,
      'Download': invoiceDownload,

    }
    actions[key]?.(selectedPayin)
  }, [selectedPayin, actionStatusList])
  const updateLink = (selectedPayin) => {
    navigate(`/payments/payins/payin/${selectedPayin.id}/${selectedPayin.merchantName}/update/${selectedPayin?.type}/${selectedPayin?.invoiceNo}`)
  }
  const handleStateChange = () => {
    setState({ type: 'setOpenModal', payload: 'stateChange' })
  }
  const onStatusChangeSuccess = useCallback(async () => {
    setState({ type: 'closeStateChangeModal', payload: '' });
    await getData();
    setLoader(false)
  }, []);

  const onStatusCancel = useCallback(() => {
    setState({ type: 'closeStateChangeModal', payload: '' })
  }, [])

  const onTabChange = useCallback((value) => {
    if (value === 'Pay Out') {
      dispatch(setSelectedTab(value));
      navigate('/payments/payouts/payout/00000000-0000-0000-0000-000000000000/new/add/fiat');
    }
  }, []);
  const navigateToPayinView = useCallback(() => {
    navigate(`/payments/payins/payin/${selectedPayin?.id}/${selectedPayin?.invoiceNo}/view/${selectedPayin?.type}`)
  }, [selectedPayin])

  return (
    <>
      <ListDetailLayout
        breadCrumbList={breadCrumbList}
        showBreadcrumb={true}
        hasOverview={true}
        Overview={<PaymentsKpis/>}
        ListHeader={
          <>
            <div className="flex !justify-between md:p-3 py-3 gap-3">
              <div className="toggle-btn custom-tabs">
                <ScreenTabs
                  tabFields={{ title: "name", key: "name", icon: null }}
                  activeKey={activeKeyForTab}
                  className="custom-crypto-tabs"
                  onChange={onTabChange}
                />
              </div>
              <div className="">
                <ListDetailLayout.ListHeader title={t('payments.payin.payin')} onAdd={handleForm}  showAdd={true} activeTab={activeKeyForTab}/>
              </div>
            </div>
            <div className="md:p-3 py-3">
              <p className="text-base font-semibold text-titleColor mb-0">Total Amount</p>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-subTextColor text-3xl"><NumericText value={totalBalances?.amount || 0} prefixText={"$  "} thousandSeparator={true} decimalScale={2} /></span>
                <span className="icon refresh cursor-pointer" onClick={cryptoTotalBalances} />
              </div>
            </div>
          </>
        }
        ListComponent={
          <ListDetailLayout.List
            list={data || []}
            ItemComponent={ItemRow}
            onSearch={handleSearchPayin}
            onSearchInput={setSearchInput}
            showAlert={errorMessage !== ""}
            alterMessage={errorMessage}
            searchValue={searchInput}
            pageSize={pageSize}
            currentPage={page}
            fetchNext={fetchNextPage}
            setShowAlert={setErrorMessage}
            searchPlaceholer={'Pay In'}
            loading={loader || balanceLoader}
          />
        }
        ViewHeader={
          (mode === 'view' && data.length > 0) ? (
            <div className="md:flex justify-between items-center border-b-2 border-cryptoline pb-2">
              <ListDetailLayout.ViewHeader
                logoType="custom"
                hasLogo={true}
                logo={<span>{selectedPayin?.invoiceNo?.[0]}</span>}
                title={selectedPayin?.invoiceNo}
                metaData={`${selectedPayin?.amount} ${selectedPayin?.currency}`}
                showActions={false}
              />
              <div className="flex gap-3">
                {permissions?.[0]?.actions &&
                  permissions?.[0]?.actions
                    .filter((action) => action.isEnabled && !["View", "Add"].includes(action.name))
                    .map((action, index) => {
                      const isLastAction = permissions?.[0].actions.length >= 2 && index === permissions?.actions?.length - 1;
                      return (
                        <>
                          {action.name !== 'Share' && (
                            <div key={action.name} className="text-center max-w-14">
                              <Tooltip title={action.name} placement={isLastAction ? "left" : "top"}>
                                <ActionController
                                  handlerType="button"
                                  actionParams={[action?.name]}
                                  onAction={handleAction}
                                  redirectTo='/payments/payins'
                                  actionFrom="Payments"
                                  buttonType="plain"
                                  buttonClass={'cursor-pointer border-none p-0 outline-none mx-auto'}
                                  disabled={loaderDwnd}
                                >
                                  <span
                                    className={`icon ${action.icon}`}
                                    style={{
                                      pointerEvents: loaderDwnd && action.name === 'Download' ? 'none' : 'auto',
                                      display: 'inline-block',
                                      position: 'relative',
                                    }}
                                  >
                                    {loaderDwnd && action?.name === 'Download' ? (
                                      <Spin
                                        indicator={<LoadingOutlined spin />}
                                        style={{
                                          position: 'absolute',
                                          top: '50%',
                                          left: '50%',
                                          transform: 'translate(-50%, -50%)',
                                        }}
                                      />
                                    ) : (
                                      <span className={`icon ${action.icon}`} style={{ visibility: loaderDwnd ? 'hidden' : 'visible' }} />
                                    )}
                                  </span>

                                </ActionController>
                                <p className={`text-center text-xs font-medium text-textGrey mt-1`}>{action.tooltipTitle}</p>
                              </Tooltip>
                            </div>
                          )}
                          {action?.name === 'Share' && (
                            <Dropdown placement="topRight" overlay={menu} trigger={['hover']} className="" overlayClassName="">
                              <div className="flex items-start">
                                <div className="cursor-pointer">
                                  <span className={`icon ${action.icon}`}></span>
                                </div>
                              </div>
                            </Dropdown>
                          )}
                        </>
                      );
                    })}
              </div>
            </div>) : (
            mode === 'generate' && (<div className="flex justify-between items-start mb-5">
              <ListDetailLayout.ViewHeader
                logoType="custom"
                hasLogo={true}
                title={'Create Invoice'}
                logoBg={""}
                logo={<button type="button" onClick={navigateToPayinView}><span className="icon lg btn-arrow-back"></span></button>}
                showActions={false}
              />

            </div>) || (<></>)
          )
        }
      >
        {state?.error && (
          <div className="alert-flex" style={{ width: "100%" }}>
            <AppAlert
              className="w-100 "
              type="warning"
              description={state?.error}
              showIcon
            />
            <button className="icon sm alert-close" onClick={() => clearErrorMessage()}></button>
          </div>
        )
        }
        <Outlet context={{ getData: getData, selectedPayin: selectedPayin, payinGridData: data ,setPayinViewDetails:setPayinViewDetails}} />
      </ListDetailLayout>
      {state.openModal === 'stateChange' && <StateChange selectedPayin={selectedPayin} isModalOpen={state.openModal === 'stateChange'} onCancel={onStatusCancel} onSuccess={onStatusChangeSuccess} />}

    </>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return {
    user: userConfig.details,
    trackauditlogs: userConfig?.trackAuditLogData,
  };
};
export default connect(connectStateToProps)(PayInsLayout);
