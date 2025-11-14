import React, { useCallback, useState } from "react";
import moment from "moment/moment";
import CommonDrawer from "../../core/shared/drawer.js";
import List from "../../core/grid.component/index.js";
import { textStatusColors } from "../../utils/statusColors.js";
import TransactionDetails from "../../core/transactions/transaction";
import { getNotificationIcon } from "../../utils/app.config.js";
import { WalletHandler } from "./service.js";
const baseURL = window.runtimeConfig.VITE_API_END_POINT;

const TransactionsBanks = () => {
  const [isViewDrawer, setISViewDrawer] = useState(false);
  const [handleViewData, setHandleViewData] = useState({});
  const handleView = (data) => {
    setISViewDrawer(true);
    setHandleViewData(data);
  };
  const isCloseDrawer = useCallback((data) => {
    setISViewDrawer(data);
}, []);
  const renderTransactionId = (propsData) => (
    <td>
      <div>
        <button
          className="table-text c-pointertransaction-id-text text-link c-pointer"
          onClick={() => handleView(propsData?.dataItem)}
        >
          {propsData?.dataItem["txId"]}
        </button>
      </div>
    </td>
  );
  const renderTransactionDate = (cellprops) => (
    <td className="px-3.5 py-1 text-subTextColor font-semibold">
      <div className="flex items-center space-x-2">
        <span
          className={`icon ${getNotificationIcon(
            cellprops.dataItem.transactionType
          )} cursor-pointer`}
        ></span>
        <p className="">
          <span className="text-subTextColor font-semibold text-base">
            {cellprops.dataItem.transactionType}
          </span>
          <span className="text-labelGrey block">
            {cellprops.dataItem.transactionDate
              ? moment
                  .utc(cellprops.dataItem.transactionDate)
                  .local()
                  .format("DD/MM/YYYY hh:mm:ss A")
              : cellprops.dataItem.transactionDate}
          </span>
        </p>
      </div>
    </td>
  );
  const renderStatus = (cellprops) => {
    const { status, volume } = cellprops.dataItem;
    return (
      <td className="px-3.5 py-1 text-subTextColor font-semibold">
        <p className="font-semibold">{volume}</p>
        <span
          className={`font-normal text-sm block ${textStatusColors[status]}`}
        >
          {status}
        </span>
      </td>
    );
  };
  
  const wallet = (cellprops) => {
    return(<WalletHandler cellprops={cellprops}/>)
  };
  const transactionColoumns = [
    {
      field: "txId",
      title: "ID",
      filter: false,
      filterType: "text",
      width: 180,
      customCell: renderTransactionId,
    },
    {
      field: "transactionType",
      title: "Type",
      filter: false,
      filterType: "date",
      width: 230,
      customCell: renderTransactionDate,
    },
    {
      field: "wallet",
      title: "Wallet",
      filter: false,
      filterType: "text",
      width: 120,
      customCell: wallet,
    },
    {
      field: "volume",
      title: "Amount",
      filter: false,
      sortable: false,
      width: 100,
      customCell: renderStatus,
    },
  ];

  const closeDrawerHandler=useCallback(()=>{
    setISViewDrawer(false)
  },[])

  return (
    <div className="mt-7 mb-7">
      <h4 className="text-2xl text-titleColor font-semibold mb-2">
        Recent Transactions
      </h4>
      <div className="layout-bg dashboard-transactions sm-m-0 db-table mt-14 hover-bg">
        <List
          url={`${baseURL}/Merchant/Bank/transactions/null`}
          pSize={10}
          columns={transactionColoumns}
          pageable={false}
        />
      </div>
      {
        <CommonDrawer
          title={"Transaction Details"}
          isOpen={isViewDrawer}
          onClose={closeDrawerHandler}
        >
          {isViewDrawer && (
            <TransactionDetails
              data={handleViewData}
              isCloseDrawer={isCloseDrawer}
            />
          )}
        </CommonDrawer>
      }
    </div>
  );
};
export default TransactionsBanks;
