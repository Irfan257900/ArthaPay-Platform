import { useCallback, useEffect, useReducer, useMemo } from "react";
import { Tooltip } from "antd";
import moment from "moment/moment";
import TransactionDetails from "./transaction";
import CommonDrawer from "../shared/drawer";
import List from "../grid.component";
import { textStatusColors } from "../../utils/statusColors";
import { useTranslation } from "react-i18next";
import { TransactionsCardNumberHandler } from "./grid.columns";
import { currentApiVersion } from "../http.clients";
import { gridReducer, gridState } from "./reducer";
import AppSelect from "../shared/appSelect";
import CustomButton from "../button/button";
import AppSearch from "../shared/appSearch";
import MomentDatePicker from "../momentDatePicker";
import { fetchLookups, fetchVaultsLookUp } from "./http.services";
import { useSelector } from "react-redux";
import AppAlert from "../shared/appAlert";
import { useSearchParams } from "react-router";
import { parse } from "uuid";
import AppDefaults from "../../utils/app.config";
import CopyComponent from "../shared/copyComponent";
import NumericText from "../shared/numericText";
const { RangePicker } = MomentDatePicker;
const allModules = ["All", "Wallets", "Exchange", "Cards", "Banks", "Payments"];
const Grid = () => {
    const [state, setState] = useReducer(gridReducer, gridState);
    const selectedKpi = useSelector((store) => store.txsStore.selectedKpi);
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    useEffect(() => {
        if (selectedKpi) {
            onModuleChange(selectedKpi);
        }
    }, [selectedKpi]);

    const module = useMemo(() => searchParams.get("module"), [searchParams]);
    const action = useMemo(() => searchParams.get("action"), [searchParams]);
    const walletId = useMemo(() => searchParams.get("walletId") || "00000000-0000-0000-0000-000000000000", [searchParams]);

    useEffect(() => {
        if (module && allModules.includes(module) && walletId) {
            setState({
                type: "setFilters",
                payload: {
                    module,
                    action: action || "all",
                    walletId: walletId ,
                },
            });
        }
    }, [module, action, walletId]);

    const onModuleChange = useCallback((moduleToSet) => {
        searchParams.set("module", moduleToSet);
        // Optionally reset action when module changes
        searchParams.set("action", "all");
        setSearchParams(searchParams);
    }, [searchParams, setSearchParams]);

    const handleWalletsChange = useCallback((wallets) => {
        searchParams.set("walletId", wallets);
        searchParams.set("action", "all");
        setSearchParams(searchParams);
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        fetchLookups({
            setData: (data) => setState({ type: "setLookups", payload: data }),
            setLoader: (payload) =>
                setState({ type: "setLoading", payload: payload ? "lookups" : "" }),
            setError: (payload) =>
                setState({ type: "setError", payload: { message: payload } }),
        });
        fetchVaultsLookUp({
            setData: (data) => setState({ type: "setLookups", payload: data }),
            setLoader: (payload) =>
                setState({ type: "setLoading", payload: payload ? "lookups" : "" }),
            setError: (payload) =>
                setState({ type: "setError", payload: { message: payload } }),
        })
    }, []);



    const handleStatusChange = useCallback((status) => {
        setState({ type: "setFilters", payload: { status } });
        searchParams.set("action", "all");
        setSearchParams(searchParams);
    }, []);

    const handleTransactionSelection = useCallback((data) => {
        setState({ type: "setSelectedTransaction", payload: data });
    }, []);
    const renderTransactionId = (propsData) => (
        <td className='px-3'>
            <div className="flex items-center !gap-2">
                <CustomButton
                    type="normal"
                    className="table-text transaction-id-text text-link cursor-pointer text-left"
                    onClick={handleTransactionSelection}
                    onClickParams={[propsData?.dataItem]}
                    passEvent="end"
                >
                    {propsData?.dataItem["txId"]}
                </CustomButton>
                <CopyComponent
                    text={propsData?.dataItem["txId"]}
                    noText="No refId"
                    shouldTruncate={false}
                    type=""
                    className="icon copy-icon cursor-pointer text-primaryColor"
                    textClass="text-primaryColor"
                />
            </div>
        </td>
    );
    const renderStatus = (cellprops) => {
        const state = cellprops.dataItem.state || cellprops.dataItem.status;
        return (
            <td>
                <span className={textStatusColors[state]}>
                    {state}
                </span>
            </td>
        );
    };
 const renderAmout = (cellprops) => {
    const value = cellprops.dataItem.amount;
    const transactionType = cellprops.dataItem?.type;
    const isCryptoType = [
        "Withdraw Crypto",
        "Deposit Crypto",
        "Buy",
        "Sell",
        "PayOut Crypto",
        "PayIn Crypto",
    ].includes(transactionType);

    const fractionDigits = isCryptoType ? 4 : 2;

    return (
        <td>
            <p className="text-sm font-medium text-subTextColor">
                {value !== null && value !== undefined && value !== ""
                    ? value
                          .split("/")
                          .map((num) =>
                              Number(num).toLocaleString(undefined, {
                                  minimumFractionDigits: fractionDigits,
                                  maximumFractionDigits: fractionDigits,
                              })
                          )
                          .join(" / ")
                    : Number(0).toLocaleString(undefined, {
                          minimumFractionDigits: fractionDigits,
                          maximumFractionDigits: fractionDigits,
                      })}
            </p>
        </td>
    );
};

    const FeeAmount = (cellprops) => {
        const value = cellprops.dataItem.fee;
        const type = cellprops.dataItem.type;
        let formattedFee;
        if (type?.toLowerCase()?.includes("crypto")) {
            formattedFee = AppDefaults?.cryptoDecimals
        } else if (type?.toLowerCase()?.includes("fiat")) {
            formattedFee = AppDefaults?.fiatDecimals
        }
        return (
            <td>
                <p className="text-sm font-medium text-subTextColor">
                   <NumericText
                   value={value}
                   decimalScale={formattedFee}
                //    fixedDecimals={true}
                   />
                </p>
            </td>
        );
    };

    const NetAmout = (cellprops) => {
        const value = cellprops.dataItem.netAmount;
        const type = cellprops.dataItem.type;
        let formattedNetAmount;
        if (type?.includes("Crypto")) {
            formattedNetAmount = AppDefaults.cryptoDecimals;
        } else if (type?.includes("Fiat")) {
            formattedNetAmount = AppDefaults?.fiatDecimals;
        } else {
            formattedNetAmount = AppDefaults?.fiatDecimals;
        }
        return (
            <td>
                <p className="text-sm font-medium text-subTextColor">
                    <NumericText
                       value={value}
                       decimalScale={formattedNetAmount}
                    //    fixedDecimals={true}
                   />
                </p>
            </td>
        );
    }


    const cardNumberHandler = (cellprops) => {
        return <TransactionsCardNumberHandler cellprops={cellprops} />;
    };
    const baseURL = window.runtimeConfig.VITE_CORE_API_END_POINT;
    const transactionColoumns = [
        {
            field: "txId",
            title: t("transactions.Transaction ID"),
            filter: true,
            filterType: "text",
            width: 220,
            customCell: renderTransactionId,
        },
        {
            field: "date",
            title: t("transactions.Transaction Date"),
            filter: true,
            filterType: "date",
            isShowTime: true,
            width: 215,
        },
        {
            field: "name",
            title: t("transactions.Card/Wallet Name"),
            filter: true,
            filterType: "text",
            width: 210,
        },
        {
            field: "type",
            title: t("transactions.Transaction Type"),
            filter: true,
            filterType: "text",
            width: 210,
        },
        {
            field: "wallet",
            title: t("transactions.Wallet"),
            filter: true,
            filterType: "text",
            width: 120,
        },
        {
            field: "network",
            title: t("transactions.Network"),
            filter: true,
            filterType: "text",
            width: 140,
        },
        {
            field: "amount",
            title: t("transactions.Amount"),
            filterType: "numeric",
            width: 140,
            sortable: true,
            filter: true,
            customCell: renderAmout,
        },
        {
            field: "fee",
            title: t("transactions.Fee"),
            filter: true,
            filterType: "numeric",
            width: 95,
            customCell: FeeAmount,
        },
        {
            field: "netAmount",
            title: "Net Amount",
            filter: true,
            filterType: "numeric",
            width: 150,
            customCell: NetAmout,
        },
        {
            field: "adrress",
            title: t("transactions.CardNumberOrAddress"),
            filter: true,
            filterType: "text",
            width: 240,
            customCell: cardNumberHandler,
        },
        {
            field: "state",
            title: t("transactions.Status"),
            filter: false,
            sortable: false,
            width: 100,
            customCell: renderStatus,
        },
        {
            field: "merchantName",
            title: "Merchant Name",
            filter: true,
            filterType: "text",
            isShowTime: true,
            width: 215,
        },
        // {
        //     field: "remarks",
        //     title: t("transactions.Remarks"),
        //     filter: false,
        //     sortable: false,
        //     width: 240,
        // },
    ];

    const handleInputChange = useCallback(async (e) => {
        const value = e.target.value || null;
        setState({ type: "setSearchInput", payload: value });
    }, []);
    const handleTxSearch = useCallback(async (value) => {
        const searchQuery = (value && typeof value === "string") ? value.trim() : null;
        setState({ type: "setFilters", payload: { searchQuery } });
    }, []);
    const handleDownload = useCallback(() => {
        setState({ type: "setShouldDownload", payload: true });
    }, []);
    const handleDates = useCallback((_, dateStrings) => {
        const startDate = dateStrings?.[0]
            ? moment(dateStrings[0], "DD/MM/YYYY")
                ?.startOf("date")
                ?.format("YYYY-MM-DD")
            : "";
        const endDate = dateStrings?.[1]
            ? moment(dateStrings[1], "DD/MM/YYYY")
                ?.endOf("date")
                ?.format("YYYY-MM-DD")
            : "";
        setState({ type: "setFilters", payload: { startDate, endDate } });
        searchParams.set("action", "all");
        setSearchParams(searchParams);
    }, [searchParams, setSearchParams]);
    const handleDrawerClose = useCallback(() => {
        setState({ type: "setSelectedTransaction", payload: null });
    }, []);

    const onExportSuccessHandler = useCallback(() => {
        setState({ type: "setShouldDownload", payload: false });
    }, []);
    const gridQuery = useMemo(() => {
        const { searchQuery = null, startDate = '', endDate = '', status = 'All', module = 'All', wallet = walletId || "00000000-0000-0000-0000-000000000000", action = "all" } = state.filters;
        return `module=${module}&search=${searchQuery}&startDate=${startDate}&endDate=${endDate}&status=${status}&vaultId=${wallet}&action=${action}`;
    }, [state.filters]);
    const clearError = useCallback(() => {
        setState({ type: "setError", payload: { message: "" } });
    }, []);
    const handleClearSearch = useCallback((e) => {
        e?.preventDefault?.()
        setState({ type: "setSearchInput", payload: null });
    }, [])
    return (
        <>
            {state.error.message && (
                <div className="alert-flex withdraw-alert fiat-alert">
                    <AppAlert
                        type="error"
                        description={state.error.message}
                        showIcon
                        closable
                        afterClose={clearError}
                    />
                </div>
            )}
            <div className="">
                <div className="kpicardbg db-table mt-14 hover-bg">
                    <div className="md:flex gap-3 items-center justify-between mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 flex-1 pb-0">
                            <AppSelect
                                className=""
                                maxLength={15}
                                placeholder={t("transactions.selectModule")}
                                value={state.filters.module}
                                onChange={onModuleChange}
                                loading={state.loading === "lookups"}
                                options={state.lookups.TransactionScreens}
                                fieldNames={{ label: "name", value: "code" }}
                            />
                            <AppSelect
                                className=""
                                maxLength={15}
                                placeholder={t("transactions.Status")}
                                value={state.filters.status}
                                loading={state.loading === "lookups"}
                                onChange={handleStatusChange}
                                options={state.lookups.TransactionStatus || []}
                                fieldNames={{ label: "name", value: "code" }}
                            />
                            <RangePicker
                                presets={{
                                    [t("transactions.Today")]: [moment(), moment()],
                                    [t("transactions.This Month")]: [
                                        moment().startOf("month"),
                                        moment().endOf("month"),
                                    ],
                                    [t("transactions.Clear")]: null,
                                }}
                                format="DD/MM/YYYY"
                                className="payee-input input-bordered text-white sm-mb-10"
                                onChange={handleDates}
                            />
                            <AppSearch
                                allowClear={true}
                                className="coin-search-input border transaction-search"
                                value={state.searchInput}
                                onClear={handleClearSearch}
                                suffix={
                                    <AppSearch.SearchButton
                                        onSearch={handleTxSearch}
                                        searchParams={[state.searchInput]}
                                    />
                                }
                                onChange={handleInputChange}
                                onSearch={handleTxSearch}
                                placeholder={t("transactions.Search Transactions")}
                            />
                            {state.lookups.wallets?.length > 10 && (
                                <AppSelect
                                    className=""
                                    maxLength={15}
                                    placeholder={"Select Wallet"}
                                    value={state.filters.walletId}
                                    loading={state.loading === "lookups"}
                                    onChange={handleWalletsChange}
                                    options={state.lookups.wallets || []}
                                    fieldNames={{ label: "name", value: "id" }}
                                />
                            )}
                        </div>
                        <div className="text-right mt-5 md:mt-0">
                            <Tooltip title={t("transactions.Download")}>
                                <button
                                    className="c-pointer rounded-8 m-0"
                                    onClick={handleDownload}
                                >
                                    <span className="icon download-sample"></span>
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    <List
                        url={`${baseURL}/${currentApiVersion}transactions`}
                        pSize={10}
                        columns={transactionColoumns}
                        showExcelExport={state.shouldDownload}
                        onExportSuccess={onExportSuccessHandler}
                        excelFileName={t("transactions.Transactions")}
                        hasQuery={true}
                        query={gridQuery}
                    />
                </div>
                <CommonDrawer
                    title={t(`transactions.Transaction Details`)}
                    isOpen={state.selectedTransaction !== null}
                    onClose={handleDrawerClose}
                >
                    <TransactionDetails
                        data={state.selectedTransaction}
                        onClose={handleDrawerClose}
                    />
                </CommonDrawer>
            </div>
        </>
    );
};
export default Grid;