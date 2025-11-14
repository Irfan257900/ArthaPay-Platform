import React, { useCallback, useEffect, useMemo, useReducer } from "react";
import moment from "moment/moment";
import List from "../../../core/grid.component";
import CommonDrawer from "../../../core/shared/drawer";
import TransactionDetails from "./transactionDetails";
import {
  memberTransactionsReducer,
  memberTransactionsState,
} from "../reducers";
import { useParams } from "react-router";
import AppAlert from "../../../core/shared/appAlert";
import AppSearch from "../../../core/shared/appSearch";
import MomentDatePicker from "../../../core/momentDatePicker";
import AppSelect from "../../../core/shared/appSelect";
import { getPageInititalDetails } from "../httpServices";
import { TransactionDate, TransactionId, TransactionStatus } from "./transactions.columns";
import { currentApiVersion } from "../services";
const { RangePicker } = MomentDatePicker;
const baseURL = `${window.runtimeConfig.VITE_CORE_API_END_POINT}`;
const TransactionsGrid = () => {
  const [state, setState] = useReducer(
    memberTransactionsReducer,
    memberTransactionsState
  );
  const cardDivRef = React.useRef(null);
  const { memberId, refId } = useParams();
  useEffect(() => {
    getPageInititalDetails(setState);
  }, []);
  const showTransactionDetails = useCallback((data) => {
    setState({ type: "setShowDetails", payload: data });
  }, [])
  const renderTransactionId = (cellProps) => {
    return (
      <TransactionId
        data={cellProps.dataItem}
        state={state}
        handleClick={showTransactionDetails}
      />
    );
  };
  const transactionColoumns = [
    {
      field: "transactionId",
      title: "Transaction ID",
      filter: false,
      filterType: "text",
      width: 210,
      customCell: renderTransactionId
    },
    {
      field: "date",
      title: "Transaction Date",
      filter: false,
      filterType: "date",
      width: 200,
      customCell: TransactionDate
    },
    {
      field: "vaultOrCardName",
      title: "Wallet/Card Name",
      filter: false,
      filterType: "text",
      width: 180,
    },
    {
      field: "type",
      title: "Transaction Type",
      filter: false,
      filterType: "text",
      width: 160,
    },
    {
      field: "txType",
      title: "Wallet",
      filter: false,
      filterType: "text",
      width: 100,
    },
    {
      field: "network",
      title: "Network",
      filter: false,
      filterType: "text",
      width: 100,
    },
    {
      field: "amount",
      title: "Amount",
      filter: false,
      filterType: "numeric",
      width: 120,
    },
    {
      field: "status",
      title: "Status",
      filter: false,
      sortable: false,
      width: 120,
      customCell: TransactionStatus
    },
  ];
  const onSearchInputChange = useCallback((e) => {
    const searchValue = e.target.value?.trim();
    setState({ type: "setSearchInput", payload: searchValue });
  }, []);
  const onSearch = useCallback((value) => {
    setState({ type: "setFilters", payload: { searchQuery: value || null }, });
  }, []);
  const handleDates = useCallback((_, dateStrings) => {
    const startDate = dateStrings?.[0] ? moment(dateStrings[0], "DD/MM/YYYY")?.startOf('date')?.format('YYYY-MM-DDTHH:mm:ss') : ''
    const endDate = dateStrings?.[1] ? moment(dateStrings[1], "DD/MM/YYYY")?.endOf('date')?.format('YYYY-MM-DDTHH:mm:ss') : ''
    const formattedDates = [startDate, endDate].join('/')
    setState({ type: "setFilters", payload: { selectedDates: formattedDates } });
    setState({ type: "setFilters", payload: { fromdate: startDate } });
    setState({ type: "setFilters", payload: { todate: endDate } });
  }, []);
  const setSelectedTxType = useCallback((item) => {
    setState({ type: "setFilters", payload: { transactionType: item } });
  }, [])
  const handleDrawerClose = useCallback(() => {
    setState({ type: "setShowDetails", payload: null });
  }, [])
  const closeError = useCallback(() => {
    setState({ type: "setError", payload: { message: "" } })
  }, [])
  const gridQuery = useMemo(() => {
        const { searchQuery=null, fromdate='',todate='', transactionType=null, } = state.filters;
        return `type=${transactionType}&search=${searchQuery}&fromdate=${fromdate}&todate=${todate}`;
  }, [state.filters]);

  return (
    <>
      <div ref={cardDivRef}></div>
      {state.error.message && (
        <div className="alert-flex">
          <AppAlert
            type="error"
            description={state.error.message}
            showIcon
            closable
            afterClose={closeError}
          />
        </div>
      )}
      <div className="kpicardbg db-table hover-bg">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
          <div className="mb-2.5 md:mb-0">
            <AppSearch
              onChange={onSearchInputChange}
              onSearch={onSearch}
              placeholder="Wallets/Card Name"
              className="coin-search-input border transaction-search"
              suffix={
                <button onClick={() => onSearch(state.searchInput)}>
                  <span className="icon md search c-pointer" />
                </button>
              }
              size="middle"
              maxLength={30}
            />
          </div>
          <RangePicker
            presets={{
              Today: [moment(), moment()],
              "This Month": [
                moment().startOf("month"),
                moment().endOf("month"),
              ],
            }}
            format="DD/MM/YYYY"
            className="payee-input input-bordered text-white sm-mb-10"
            onChange={handleDates}
          />

          <AppSelect
            className=""
            maxLength={15}
            placeholder="Type"
            value={state.filters.transactionType}
            loading={state.loading === "data"}
            onSelect={setSelectedTxType}
            options={state.lookups.transactionTypes || []}
            fieldNames={{ label: 'name', value: 'code' }}
          />
        </div>

        <div className="layout-bg dashboard-transactions sm-m-0 db-table mt-14 hover-bg">
          <List
            url={`${baseURL}/${currentApiVersion}/teams/members/${memberId}/transactions`}
            pSize={10}
            columns={transactionColoumns}
            excelFileName={`${refId}_Transactions`}
            hasQuery={true}
            query={gridQuery}
          />
        </div>
        {
          <CommonDrawer
            title={`Transaction Details`}
            isOpen={state.showDetails !== null}
            onClose={handleDrawerClose}
          >
            {state.showDetails !== null && (
              <TransactionDetails data={state.showDetails} onCancel={handleDrawerClose} />
            )}
          </CommonDrawer>
        }
      </div>
    </>
  );
};
export default TransactionsGrid;
