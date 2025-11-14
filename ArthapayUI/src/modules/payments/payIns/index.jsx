import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import PaymentsKpis from "../kpis.and.tabs";
import { payInsReducer, payInsState } from "./reducer";
import { Outlet, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import ScreenTabs from "../../../core/shared/screenTabs";
import { setSelectedTab } from "../payouts/payout.accordion.reducer";
import AppDefaults from "../../../utils/app.config";
import AppTabs from "../../../core/shared/appTabs";
import { currencyTypes, fetchPayins, getPaymentLinks, payinInvoiceDwd } from "../httpServices";
import { actionStatusList, statusWarningTexts } from "./service";
import AppAlert from "../../../core/shared/appAlert";
import StateChange from "./stateChange";
import { Menu } from "antd";
import FormItem from "antd/es/form/FormItem";
import ActionController from "../../../core/onboarding/action.controller";
import ShareOptions from "../../../core/shared/shareOptions";
import { fetchFiatDetails, getPayinCurrencyLists, setErrorMessages } from "../reducers/payin.reducer";
import MerchantDropDown from "./payIn/merchantDropdown";
import PayinFiatDetails from "./payIn/payin.fiat.view";
import { toasterMessages } from "./payin.constants";
import { successToaster } from "../../../core/shared/toasters";
import numberFormatter from "../../../utils/numberFormatter";
import ListLoader from "../../../core/skeleton/common.page.loader/list.loader";
import NumericText from "../../../core/shared/numericText";

const pageSize = 10;

const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED
const payinFiatDisable = window.runtimeConfig.VITE_APP_IS_SHOW_PAYIN_FIAT;

const isPayinFiatDisabled = payinFiatDisable === "true" || payinFiatDisable === true;

const badgeColors = {
    'Paid': "!text-paidApproved !border !border-paidApproved",
    'Not Paid': '!text-notPaid !border !border-notPaid',
    'Cancelled': '!text-canceled !border !border-canceled',
    'Partially Paid': "!text-partiallyPaid !border !border-partiallyPaid",
    'Expired': "!text-canceled !border !border-canceled",
    'expired': "!text-canceled !border !border-canceled",
};


const truncateToTwoDecimals = (num) => {
    return Math.floor(num * 100) / 100;
};

const getBalanceInKsMs = (amount, isSuffix, isOnlyAmount, type) => {
    if ((!amount || isNaN(amount)) && type === 'payin') {
        return '';
    }
    if (typeof amount !== 'number' || isNaN(amount)) return '0.00';

    const { number, suffix } = numberFormatter(amount) || {};
    const formattedNumber = (number ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    if (isSuffix) {
        return `${suffix || ""}`;
    }
    if (isOnlyAmount) {
        return `${formattedNumber}`;
    }
    return `${'$ ' || suffix}${formattedNumber}`;
};


const getBalanceText = (amount, type) => {
    if ((!amount || isNaN(amount)) && type === 'payin') {
        return '';
    }
    if (!amount || isNaN(amount)) {
        return "0.00";
    }

    const { number, suffix } = numberFormatter(amount);
    const truncatedNumber = truncateToTwoDecimals(number);

    return (
        truncatedNumber.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + (suffix || "")
    );
};
const PayinLayout = () => {
    // State
    const [loader, setLoader] = useState(false);
    const [data, setData] = useState([]);
    const [loaderDwnd, setLoaderDwnd] = useState(false);
    const [searchInput, setSearchInput] = useState(null);
    const [selectedPayin, setSelectedPayin] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [page, setPage] = useState(1);
    const [selectedPayinFiat, setSelectedPayinFiat] = useState({});
    const [payinViewDetails, setPayinViewDetails] = useState(null);
    const [paymentLinksData, setPaymentLinksData] = useState([]);
    const [selectedPaymentLink, setSelectedPaymentLink] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [detailsView, setDetailsView] = useState(null);
    const [invoiceHeading, setInvoiceHeading] = useState('');

    const [state, setState] = useReducer(payInsReducer, payInsState);

    // Hooks
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { id, mode, type, vaultName, invno: currencyType } = useParams();
    const dispatch = useDispatch();
    const activeKeyForTab = useSelector((state) => state?.payoutAccordianReducer?.selectTab);
    const userProfile = useSelector((store) => store.userConfig.details);
    const selectedPayinFiatCoin = useSelector((state) => state.payinstore.selectedFiatCoin);
    const { loading: currencyListLoading, data: currencyLists } = useSelector((state) => state.payinstore.currencyLists);
    const { loading: fiatDetailsLoading, data: fiatDetailsData, error: fiatDetailsError } = useSelector((state) => state?.payinstore?.fiatDetails);
    const isFiatPayments = useMemo(
        () => currencyType === 'fiat' && selectedPayinFiatCoin?.type?.toLowerCase() === 'payments',
        [currencyType, selectedPayinFiatCoin]
    );
    const isFiatNonPayments = useMemo(
        () => currencyType === 'fiat' && selectedPayinFiatCoin?.type?.toLowerCase() !== 'payments' && selectedPayinFiatCoin?.type?.toLowerCase() !== 'all',
        [currencyType, selectedPayinFiatCoin]
    );

    const isForAllCurrencies = useMemo(
        () => currencyType === 'fiat' && selectedPayinFiatCoin?.type?.toLowerCase() === 'all',
        [currencyType, selectedPayinFiatCoin]
    )
    const isCrypto = useMemo(
        () => currencyType === 'crypto',
        [currencyType]
    );
    // Breadcrumbs
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
                        `/payments/payins/payin/${selectedPayin?.id}/${selectedPayin?.invoiceNo}/view/${selectedPayin?.type}/crypto`
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
                            `/payments/payins/payin/${selectedPayin?.id}/${selectedPayin?.invoiceNo}/view/${selectedPayin?.type}/crypto`
                        )
                    },
                    { id: "3", title: `${t('payments.breadcrumb.editstaticinvoice')}` }
                ];
            } else if (type === "Invoice") {
                list = [
                    ...list,
                    {
                        id: "2", title: `${t('payments.payin.payin')}`, handleClick: () => navigate(
                            `/payments/payins/payin/${selectedPayin?.id}/${selectedPayin?.invoiceNo}/view/${selectedPayin?.type}/crypto`
                        )
                    },
                    { id: "3", title: `${t('payments.breadcrumb.editregularinvoice')}` }
                ];
            } else {
                list = [
                    ...list,
                    {
                        id: "2", title: `${t('payments.payin.payin')}`, handleClick: () => navigate(
                            `/payments/payins/payin/${selectedPayin?.id}/${selectedPayin?.invoiceNo}/view/${selectedPayin?.type}/crypto`
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
    }, [selectedPayin, mode, type, id, t, navigate, selectedPayin]);

    // Navigation and selection handlers
    const onTabChange = useCallback((value) => {
        if (value === 'Pay Out') {
            dispatch(setSelectedTab(value));
            navigate('/payments/payouts/payout/00000000-0000-0000-0000-000000000000/new/add/fiat');
        }
    }, [navigate, dispatch]);

    const handleForm = useCallback(() => {
        setState({ type: 'setError', payload: '' });
        if (isCrypto) {
            navigate(`/payments/payins/payin/${AppDefaults.GUID_ID}/new/generate/PaymentLink/crypto`);
        } else {
            navigate(`/payments/payins/payin/${AppDefaults.GUID_ID}/IDR/fiatadd/payments/fiat`);
        }
    }, [navigate, isCrypto]);

    const selectFiatPayin = useCallback((payinToSelect) => {
        const { id, code, type, mode = "view" } = payinToSelect || {};
        setSelectedPayinFiat(payinToSelect);
        setState({ type: 'setError', payload: null });
        if (!payinToSelect) return;
        navigate(`/payments/payins/payin/${id}/${code}/${mode}/${type}/fiat`);
    }, [navigate]);

    const selectPayin = useCallback((payinToSelect) => {
        const { id, invoiceNo, mode = "view", type } = payinToSelect || {};
        setSelectedPayin(payinToSelect);
        setState({ type: 'setError', payload: null });
        // if (!payinToSelect) return;
        navigate(`/payments/payins/payin/${id}/${invoiceNo}/${mode}/${type}/crypto`);
    }, [navigate]);

    const PaymentsLinkIDR = (idrData) => {
        const { id, mode = "view" } = idrData || {};
        setSelectedPaymentLink(idrData);
        setState({ type: 'setError', payload: null });
        if (!idrData) return;
        navigate(`/payments/payins/payin/${id}/${idrData?.currency}/${mode}/payments/fiat`);
    };

    // Data fetchers
    const getPaymentsLinksIDR = async (
        currentData = [],
        pageToFetch = 1,
        searchValue = searchInput || null,
    ) => {
        const urlParams = {
            id: userProfile?.id,
            searchValue,
            pageNo: pageToFetch,
            pageSize,
            currentData: currentData,
            cusName: vaultName,
            balances: fiatDetailsData
        };
        if (pageToFetch === 1) {
            await getPaymentLinks(setLoader, setPaymentLinksData, setErrorMessage, urlParams, PaymentsLinkIDR, setPage);
        }
    };

    const fetchNextPaymentsLinks = async (
        currentData = [],
        pageToFetch = 1,
        searchValue = searchInput || null,
    ) => {
        const urlParams = {
            id: userProfile?.id,
            searchValue,
            pageNo: pageToFetch,
            pageSize,
            currentData: currentData,
            cusName: vaultName
        };
        await getPaymentLinks(setLoader, setPaymentLinksData, setErrorMessage, urlParams, PaymentsLinkIDR, setPage);
    };

    const getData = async (
        currentData = [],
        pageToFetch = 1,
        searchValue = searchInput || null,
        isCancel = ''
    ) => {
        const urlParams = {
            id: userProfile?.id,
            searchValue,
            pageNo: pageToFetch,
            pageSize,
            currentData: currentData,
            cusName: vaultName
        };
        await fetchPayins(setLoader, setData, setErrorMessage, urlParams, selectPayin, setPage, isCancel);
    };

    const getFiatCoins = useCallback(async () => {
        dispatch(fetchFiatDetails())
    }, []);

    const onCryptoSelection = (value) => {
        if (value) {
            setSelectedPayinFiat(value);
            setDetailsView(value)
            navigate(`/payments/payins/payin/${value?.id}/${value?.code}/view/${value?.type?.toLowerCase()}/fiat`);
        }
    };

    // List item renderers
    const ItemRow = useCallback(({ data, handleListModalClose }) => (
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
            onItemSelect={selectPayin}
            hasStatusBadge={true}
            ItemDescription={
                <div className="text-xs font-medium text-summaryLabelGrey !flex">
                    {`${data?.currency} (${data?.network})`}
                </div>
            }
        >
            <span className="text-xs font-medium text-summaryLabelGrey !flex">
                <NumericText value={data?.amount} displayType="text" decimalScale={AppDefaults?.cryptoDecimals} fixedDecimalScale={true} thousandSeparator={true} />&nbsp;{data?.currency}
            </span>
        </ListDetailLayout.ListItem>
    ), [selectedPayin, selectPayin]);

    const ItemRowForPaymentLink = useCallback(({ data: paymentLinksData, handleListModalClose }) => (
        <ListDetailLayout.ListItem
            data={paymentLinksData}
            itemFields={{
                id: "id",
                title: "invoiceNo",
                logo: "image",
                status: "status",
            }}
            handleListModalClose={handleListModalClose}
            badgeColor={badgeColors}
            selectedRow={selectedPaymentLink}
            onItemSelect={PaymentsLinkIDR}
            hasStatusBadge={true}
            ItemDescription={
                <div className="text-xs font-medium text-summaryLabelGrey !flex">
                    {`${paymentLinksData?.currency}`}
                </div>
            }
        >
            <span className="text-xs font-medium text-summaryLabelGrey !flex">
                <NumericText
                    value={getBalanceText(paymentLinksData?.amount)}
                    displayType="text"
                    thousandSeparator={true}
                    fixedDecimalScale={true}
                    decimalScale={AppDefaults?.fiatDecimals}
                    suffixText={paymentLinksData?.currency}
                    isdecimalsmall={Smalldecimals}
                />
                {getBalanceText(paymentLinksData?.amount)} {paymentLinksData?.currency}
            </span>
        </ListDetailLayout.ListItem>
    ), [selectedPaymentLink, PaymentsLinkIDR]);

    // New: ItemRow for Fiat Coin List
    const ItemRowForFiatCoin = useCallback(({ data, handleListModalClose }) => (
        <ListDetailLayout.ListItem
            data={data}
            itemFields={{
                id: "id",
                title: "name",
                logo: "image",
                status: "status",
            }}
            handleListModalClose={handleListModalClose}
            badgeColor={badgeColors}
            selectedRow={detailsView}
            onItemSelect={onCryptoSelection}
            hasStatusBadge={false}
            ItemDescription={
                <div className="text-xs font-medium text-summaryLabelGrey !flex">
                    {`${data?.code} ${data?.accountNumber ? - data?.accountNumber : ''}`}
                </div>
            }
        >
            <span className="text-xs font-medium text-summaryLabelGrey !flex">
                {getBalanceText(data?.amount)} {data?.code}
                {/* <NumericFormat value={data?.amount} displayType="text" decimalScale={2} thousandSeparator={true} /> {data?.code} */}
            </span>
        </ListDetailLayout.ListItem>
    ), [selectedPayinFiat, onCryptoSelection]);

    const ItemRowForAllCurrencies = useCallback(({ data, handleListModalClose }) => (
        <ListDetailLayout.ListItem
            data={data}
            itemFields={{
                id: "id",
                title: "code",
                logo: "image",
                status: "status",
            }}
            handleListModalClose={handleListModalClose}
            badgeColor={badgeColors}
            hasStatusBadge={false}
            selectedRow={detailsView}
            onItemSelect={onCryptoSelection}
        >
            <span className="text-xs font-medium text-summaryLabelGrey !flex">
                {getBalanceText(data?.amount)} {data?.code}
            </span>

        </ListDetailLayout.ListItem>
    ), [onCryptoSelection])

    const handlePaymentsAllCurrencies = (value) => {
        value = value?.replace(/\s+/g, ' ').trim();
        setSearchInput(value);
        dispatch(getPayinCurrencyLists({ faitCoint: value, setDetailsView, navigate, navigateOrNot: true }));
    }

    // ListComponent logic
    const getListComponent = () => {
        if (isFiatPayments) {
            return (
                <ListDetailLayout.List
                    list={currencyLists || []}
                    showSearch={false}
                    ItemComponent={ItemRowForFiatCoin}
                    onSearch={handleSearchPayin}
                    onSearchInput={setSearchInput}
                    showAlert={errorMessage !== ""}
                    alterMessage={errorMessage}
                    searchValue={searchInput}
                    pageSize={pageSize}
                    currentPage={page}
                    fetchNext={fetchNextPage}
                    setShowAlert={setErrorMessage}
                    searchPlaceholer='Pay In'
                    loading={fiatDetailsLoading || currencyListLoading}
                />
            );
        }
        if (isFiatNonPayments) {
            return (
                <ListDetailLayout.List
                    list={currencyLists || []}
                    showSearch={false}
                    ItemComponent={ItemRowForFiatCoin}
                    onSearch={handleSearchPayin}
                    onSearchInput={setSearchInput}
                    showAlert={errorMessage !== ""}
                    alterMessage={errorMessage}
                    searchValue={searchInput}
                    pageSize={pageSize}
                    currentPage={page}
                    fetchNext={fetchNextPage}
                    setShowAlert={setErrorMessage}
                    searchPlaceholer='Pay In'
                    loading={currencyListLoading}
                />
            );
        }
        if (isCrypto) {
            return (
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
                    searchPlaceholer='Coin'
                    loading={loader || fiatDetailsLoading}
                />
            );
        }
        if (isForAllCurrencies) {
            return (
                <ListDetailLayout.List
                    list={currencyLists || []}
                    ItemComponent={ItemRowForAllCurrencies}
                    showAlert={fiatDetailsError !== ""}
                    alterMessage={fiatDetailsError}
                    searchValue={searchInput}
                    onSearch={handlePaymentsAllCurrencies}
                    onSearchInput={setSearchInput}
                    pageSize={pageSize}
                    currentPage={page}
                    searchPlaceholer='Currency'
                />
            )
        }
        return <ListLoader />;
    };

    const handleSearchPayin = useCallback((value) => {
        value = value?.replace(/\s+/g, ' ').trim();
        setSearchInput(value);
        getData([], 1, value || null);
    }, []);

    const handleSearchPaymentLink = useCallback((value) => {
        value = value?.replace(/\s+/g, ' ').trim();
        setSearchInput(value);
        getPaymentsLinksIDR([], 1, value || null);
    }, []);

    const fetchNextPage = useCallback(async (pageToFetch) => {
        await getData(data, pageToFetch + 1);
    }, [data, getData]);

    const fetchNextPaymentsLinksPage = useCallback(async (pageToFetch) => {
        await fetchNextPaymentsLinks(paymentLinksData, pageToFetch + 1);
    }, [paymentLinksData, fetchNextPaymentsLinks]);

    const clearErrorMessage = () => setState({ type: 'setError', payload: null });

    const handleTabChange = async (value) => {
        dispatch(setErrorMessages([{ key: 'savePaymentLinks', message: '' }]));
        if (value?.toLowerCase() === 'crypto') {
            await getData([], 1, null, "isCancel");
        } else {
            navigate(`/payments/payins/payin/${AppDefaults?.GUID_ID}/IDR/view/payments/fiat`);
        }
    };


    const onStatusCancel = useCallback(() => {
        setState({ type: 'closeStateChangeModal', payload: '' });
    }, []);

    const onStatusChangeSuccess = useCallback(async () => {
        setState({ type: 'closeStateChangeModal', payload: '' });
        await getData();
        setLoader(false);
    }, [getData]);

    // Share config and menu
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
    };

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
                                    buttonClass='cursor-pointer c-pointer border-none p-0 outline-none'
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

    const handleShowDetails = useCallback(() => setShowDetails(true), []);
    const handleCloseDetails = useCallback(() => setShowDetails(false), []);


    const updateLink = (selectedPayin) => {
        navigate(`/payments/payins/payin/${selectedPayin.id}/${selectedPayin.merchantName}/update/${selectedPayin?.type}/crypto`)
    }
    const handleStateChange = () => {
        setState({ type: 'setOpenModal', payload: 'stateChange' })
    }



    const setGetdownloadInvoice = (response) => {
        setLoader(false);
        const link = document.createElement('a');
        link.href = response;
        link.download = selectedPayin?.invoiceNo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        successToaster({ content: toasterMessages?.download })
    }


    const invoiceDownload = useCallback(async () => {
        const urlParams = {
            id: selectedPayin?.id,
            type: selectedPayin?.type
        }
        await payinInvoiceDwd(setLoaderDwnd, setGetdownloadInvoice, setState, urlParams);
    }, [id, type, selectedPayin, setGetdownloadInvoice])



    const handleAction = useCallback(async (key) => {
        const selectedPayinData = selectedPayin;
        const status = selectedPayinData?.status?.toLowerCase() || '';

        if (actionStatusList[key]?.includes(status)) {
            setState({ type: 'setError', payload: statusWarningTexts(key)[status] });
            if (key === 'share') {
                return Promise.reject();
            }
            return;
        }
        switch (key) {
            case 'Add':
                await handleForm(selectedPayin);
                break;
            case 'Edit':
                await updateLink(selectedPayin);
                break;
            case 'State Change':
                await handleStateChange(selectedPayin);
                break;
            case 'Download':
                await invoiceDownload(selectedPayin);
                break;
            default:
                console.warn(`Unhandled action key: ${key}`);
                break;
        }
    }, [selectedPayin, actionStatusList, handleForm, updateLink, handleStateChange, invoiceDownload]);

    useEffect(() => {
        if (isFiatPayments && paymentLinksData?.length <= 0 && !isPayinFiatDisabled) {
            getPaymentsLinksIDR();
        }
    }, [isFiatPayments, isPayinFiatDisabled]);

    useEffect(() => {
        dispatch(setSelectedTab('Pay In'));
    }, [dispatch]);

    useEffect(() => {
        if (!isPayinFiatDisabled) {
            getFiatCoins();
        }
    }, [dispatch]);

    useEffect(() => {
        if (fiatDetailsData && Object.keys(fiatDetailsData).length > 0) {
            selectFiatPayin(fiatDetailsData?.assets?.[0])
        }
    }, [fiatDetailsData]);

    const navigateToPayins = useCallback(() => {
        navigate(`/payments/payins/payin/${selectedPayin?.id}/${selectedPayin?.merchantName}/view/${selectedPayin?.type}/crypto`)
    }, [selectedPayin])

    const navigateToFiatPayins = useCallback(() => {
        navigate(`/payments/payins/payin/${detailsView?.id}/${detailsView?.code}/view/payments/fiat`)
    }, [detailsView]);

    useEffect(() => {
        if (isPayinFiatDisabled) {
            getData([], 1, null, "isCancel");
        }
    }, [isPayinFiatDisabled])


    const filteredCurrencyTypes = isPayinFiatDisabled
        ? currencyTypes.filter((c) => c.name.toLowerCase() !== 'fiat')
        : currencyTypes;

    return (
        <>
            <ListDetailLayout
                breadCrumbList={breadCrumbList}
                showBreadcrumb={true}
                hasOverview={true}
                ListComponentTitle={"Select Payin"}
                Overview={<PaymentsKpis />}
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
                            <div>
                                <ListDetailLayout.ListHeader
                                    title={t('payments.payin.payin')}
                                    showAdd={(isFiatPayments || isCrypto || detailsView?.type?.toLowerCase() === 'payments' || 'all') ? true : false}
                                    onAdd={handleForm}
                                    activeTab={activeKeyForTab}
                                />
                            </div>
                        </div>
                        <div className="md:p-3 py-3">
                            <MerchantDropDown
                                currrencyType={currencyType}
                                setSelectedPayinFiat={setSelectedPayinFiat}
                                getPaymentsLinksIDR={getPaymentsLinksIDR}
                                setDetailsView={setDetailsView}
                            />
                        </div>
                    </>
                }
                ListComponent={getListComponent()}
                ViewHeader={
                    <div className="md:flex justify-between items-center border-b-2 border-cryptoline pb-2">
                        {currencyType === 'fiat' ? (mode === 'view' ?
                            <ListDetailLayout.ViewHeader
                                logoType="img"
                                hasLogo={
                                    selectedPayinFiat?.type?.toLowerCase() === 'payments'
                                        ? !!detailsView?.image
                                        : !!detailsView?.image
                                }
                                showActions={false}
                                logo={
                                    selectedPayinFiat?.type?.toLowerCase() === 'payments'
                                        ? detailsView?.image
                                        : detailsView?.image
                                }
                                title={
                                    (detailsView?.type && detailsView?.code) && (selectedPayinFiat?.type?.toLowerCase() === 'payments' || 'all') ? (
                                        <>
                                            <NumericText
                                                value={getBalanceInKsMs(
                                                    detailsView?.amount || '', false, true,
                                                    selectedPayinFiat?.type?.toLowerCase() !== 'payments' || 'all' ? "" : 'payin'
                                                )}
                                                isdecimalsmall={Smalldecimals === "true" ? true : false}
                                                fixedDecimals={true}
                                                decimalScale={AppDefaults?.fiatDecimals}
                                                spaceBeforeSuffix={false}
                                                suffixText={getBalanceInKsMs(
                                                    detailsView?.amount, true, false,
                                                    selectedPayinFiat?.type?.toLowerCase() !== 'payments' || 'all' ? "" : 'payin'
                                                ) + `  ${detailsView?.code}`}
                                            />
                                            {(isFiatNonPayments ||
                                                (isForAllCurrencies && detailsView?.type?.toLowerCase() !== 'payments')) && (
                                                    <button
                                                        type="normal"
                                                        className="secondary-outline ml-5"
                                                        onClick={handleShowDetails}
                                                    >
                                                        Details
                                                    </button>
                                                )}
                                        </>
                                    ) : null
                                }
                            /> :
                            <ListDetailLayout.ViewHeader
                                logoType="custom"
                                customLogoClass=""
                                showActions={false}
                                hasLogo={true}
                                logoBg={""}
                                logo={<button onClick={navigateToFiatPayins}><span className="icon lg btn-arrow-back"></span></button>}
                                headerCustomClass={"flex1 justify-between"}
                            />
                        ) : (
                            mode !== 'generate' ? <ListDetailLayout.ViewHeader
                                logoType="custom"
                                hasLogo={!!selectedPayin?.invoiceNo?.[0]} // ensures first character exists
                                logo={<span>{selectedPayin?.invoiceNo?.[0] || '-'}</span>}
                                title={selectedPayin?.invoiceNo || ''}
                                metaData={
                                    selectedPayin?.amount && selectedPayin?.currency
                                        ? <NumericText value={selectedPayin.amount} decimalScale={AppDefaults?.cryptoDecimals} fixedDecimals={true} suffixText={selectedPayin.currency} />
                                        : ''
                                }
                                showActions={false}
                            /> :

                                <ListDetailLayout.ViewHeader
                                    logoType="custom"
                                    customLogoClass=""
                                    showActions={false}
                                    hasLogo={true}
                                    logoBg={""}
                                    logo={<button onClick={navigateToPayins}><span className="icon lg btn-arrow-back"></span></button>}
                                    headerCustomClass={"flex1 justify-between"}
                                />
                        )}
                        {mode === 'generate' &&
                            <div className="md:flex items-center gap-2 justify-end mt-3 md:mt-0">
                                <h1 className="text-xl font-semibold text-subTextColor mr-2">{`Genarate ${invoiceHeading === 'PaymentLink' ? 'Payment Link' : invoiceHeading}`}</h1>
                            </div>
                        }
                        {mode === 'fiatadd' &&
                            <div className="md:flex items-center gap-2 justify-end mt-3 md:mt-0">
                                <ListDetailLayout.ViewHeader
                                    logoType="custom"
                                    hasLogo={false}
                                    logo={<span>Genarate Invoice</span>}
                                    title={`Genarate Payment Link`}
                                    showActions={false}
                                />
                            </div>
                        }
                        {(mode === 'view' || (currencyType === 'crypto' && mode !== 'generate') || (currencyType === 'fiat' && mode !== 'fiatadd')) && <div className="md:flex items-center gap-2 justify-end mt-3 md:mt-0">
                            <div className="toggle-btn">
                                <AppTabs
                                    list={filteredCurrencyTypes.map((c) => ({
                                        title: c.name,
                                        key: c.name.toLowerCase(),
                                    }))}
                                    activeKey={
                                        isPayinFiatDisabled && currencyType?.toLowerCase() === 'fiat'
                                            ? 'crypto'
                                            : currencyType?.toLowerCase()
                                    }
                                    onChange={handleTabChange}
                                    defaultActiveKey={isPayinFiatDisabled ? 'crypto' : 'fiat'}
                                    className="custom-crypto-tabs"
                                />
                            </div>
                        </div>}
                    </div>
                }
            >
                {state?.error && (
                    <div className="alert-flex mt-5" style={{ width: "100%" }}>
                        <AppAlert
                            className="w-100 "
                            type="warning"
                            description={state?.error}
                            showIcon
                        />
                        <button className="icon sm alert-close" onClick={clearErrorMessage}></button>
                    </div>
                )}
                <Outlet context={{
                    getData,
                    selectedPayin,
                    payinGridData: data,
                    setPayinViewDetails,
                    handleAction: handleAction,
                    loaderDwnd,
                    menu,
                    selectedPayinFiat,
                    getPaymentsLinksIDR,
                    selectedPaymentLink,
                    detailsView,
                    setInvoiceHeading
                }} />
            </ListDetailLayout>
            {state.openModal === 'stateChange' && (
                <StateChange
                    selectedPayin={selectedPayin}
                    isModalOpen={state.openModal === 'stateChange'}
                    onCancel={onStatusCancel}
                    onSuccess={onStatusChangeSuccess}
                />
            )}
            {showDetails && (
                <PayinFiatDetails
                    isModalOpen={showDetails}
                    onCancel={handleCloseDetails}
                    selectedPayinFiat={detailsView}
                />
            )}
        </>
    );
};

export default PayinLayout;