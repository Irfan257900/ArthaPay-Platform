import { memo, useMemo } from "react";
import List from "../../../core/grid.component";
import { textStatusColors } from "../../../utils/statusColors";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { currentApiVersion } from "../http.clients";
import { TransactionIdHandler } from "../constant";
import NumericText from "../../../core/shared/numericText";
const WalletType = window.runtimeConfig.VITE_WALLET_TYPE;
const baseURL =
  WalletType === "non_custodial"
    ? `${window.runtimeConfig.VITE_WEB3_API_EXCHANGE_END_POINT}/${currentApiVersion}`
    : `${window.runtimeConfig.VITE_API_EXCHANGE_END_POINT}/${currentApiVersion}`;
const Transactions = () => {
  const selectedCryptoCoin = useSelector(
    (store) => store.buyState.selectedCryptoCoin
  );
  const { loader } = useSelector((store) => store.buyState.cryptoCoins);
  const customStatusCell = (propsData) => {
    const status = propsData.dataItem?.status || "Approved";
    return (
      <td>
        <span className={textStatusColors[status]}>{status}</span>
      </td>
    );
  };
   const txIdHandler = (cellProps) => {
         return (<TransactionIdHandler txIdProps={cellProps} />)
    }
 const customAmountCell = (propsData) => {
  const value = propsData.dataItem?.amount; // e.g., "24.78/12.7832"
  const amounts = value ? value.split("/") : [];

  return (
    <td>
      {amounts.length > 0 && (
        <>
          <NumericText
            value={amounts[0]}
            type="text"
            decimalScale={2}
            fixedDecimalScale={true}
            thousandSeparator={true}
            allowNegative={true}
            className="amount-text text-xs font-semibold text-subTextColor"
          />
          {amounts[1] && (
            <>
              <span>/</span>
              <NumericText
                value={amounts[1]}
                type="text"
                decimalScale={4}
                fixedDecimalScale={true}
                thousandSeparator={true}
                allowNegative={true}
                className="amount-text text-xs font-semibold text-subTextColor"
              />
            </>
          )}
        </>
      )}
    </td>
  );
};


const customFeeCell = (propsData) => {
  const value = propsData.dataItem?.fee; // ✅ get from row data
  return (
    <td>
      <NumericText
        value={value}
        type="text"
        prefixText=""
        suffixText=""
        decimalScale={2}
        fixedDecimalScale={true}
        thousandSeparator={true}
        allowNegative={true}
        className="amount-text text-xs font-semibold text-subTextColor"
      />
    </td>
  );
};

  const gridColumns = [
    {
      field: "txId",
      title: "Transaction ID",
      filter: false,
      filterType: "text",
      width: 140,
      customCell: txIdHandler,
    },
    {
      field: "date",
      title: "Transaction Date",
      filter: false,
      filterType: "datetime",
      width: 220,
    },
    {
      field: "walletCode",
      title: "Wallet",
      filter: false,
      filterType: "text",
      width: 100,
    },
    {
      field: "amount",
      title: "Amount",
      filter: false,
      filterType: "text",
      width: 160,
      sortable:false,
      customCell: customAmountCell
    },
    {
      field: "fee",
      title: "Fee",
      filter: false,
      filterType: "text",
      width: 100,
      sortable:false,
      customCell: customFeeCell
    },
    // {
    //   field: "netAmount",
    //   title: "Net Amount",
    //   filter: false,
    //   filterType: "text",
    //   width: 120,
    //   sortable:false
    // },
    {
      field: "state",
      title: "Status",
      filter: false,
      filterType: "text",
      width: 100,
      customCell: customStatusCell,
    },
  ];
  const listUrl = useMemo(() => {
    return `${baseURL}buy/transactions`;
  }, [baseURL]);
  if (!selectedCryptoCoin?.code || loader) {
    return <></>;
  }
  return (
    <div className="">
      <div className="flex justify-between items-center mb-2">
        <h3 className={`font-semibold text-titleColor  text-md }`}>
          Transactions
        </h3>
        <Link
          to="/transactions?module=Exchange&action=Buy"
          className="secondary-outline flex !items-center"
        >
          <span>All Transactions</span>
          <span className="icon btn-arrow shrink-0 ml-2"></span>
        </Link>
      </div>
      <List url={listUrl} pSize={5} pageable={false} columns={gridColumns} />
    </div>
  );
};
 
export default memo(Transactions);