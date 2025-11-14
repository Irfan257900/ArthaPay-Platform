import React, { useEffect, useState, useCallback } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router';
import CopyComponent from '../../../core/shared/copyComponent';
import { textStatusColors } from '../../../utils/statusColors';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { getRecentTransactions } from '../httpServices';
import { useSelector } from 'react-redux';
import AppAlert from '../../../core/shared/appAlert';

const QuestTransactions = ({ screenName }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userDetails = useSelector((state) => state.userConfig?.details);
  const customerId = userDetails?.id;

  useEffect(() => {
    if (screenName) {
      fetchCardTransactions();
    }
  }, [screenName]);

  const fetchCardTransactions = useCallback(async () => {
    try {
      await getRecentTransactions(customerId, screenName, setLoading, setData, setError);
    } catch (err) {
      setError(err);
    }
  }, [screenName]);

  const renderTransactionDate = (cellprops) => (
    <td className="px-4 py-2">
      <div>
        {cellprops.dataItem.createdDate
          ? moment.utc(cellprops.dataItem.createdDate).local().format("DD/MM/YYYY hh:mm:ss A")
          : cellprops.dataItem.createdDate}
      </div>
    </td>
  );

  const txIdHandler = (cellProps) => {
    const value = cellProps?.dataItem?.transactionId;
    const shortTxId = `${value.slice(0, 4)}...${value.slice(-4)}`;
    return (
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          {shortTxId}
          <CopyComponent
            text={value}
            noText="No refId"
            shouldTruncate={false}
            type=""
            className="icon copy-icon cursor-pointer text-primaryColor"
            textClass="text-primaryColor"
          />
        </div>
      </td>
    );
  };

  const customStatusCell = (propsData) => {
    const status = propsData.dataItem?.status || "";
    return (
      <td className="px-4 py-2">
        <span className={textStatusColors[status]}>
          {status}
        </span>
      </td>
    );
  };

  const customValueCell = (cellProps) => {
    const value = cellProps?.dataItem?.amount;
    const formattedValue =
      typeof value === "number"
        ? value.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4,
          })
        : "";

    return (
      <td>
        <div className="px-4 py-2">
          {formattedValue}
        </div>
      </td>
    );
  };

  const detailsGridColoumns = [
    { field: 'transactionId', title: 'Transaction ID', width: 140, customCell: txIdHandler },
    { field: 'createdDate', title: 'Transaction Date', width: 200, customCell: renderTransactionDate },
    { field: 'triggerEvent', title: 'Action', width: 125 },
    { field: 'currencyCode', title: 'Wallet', width: 125 },
    { field: 'source', title:'Reward', width: 150 },
    { field: 'sourceType', title: 'Source Type', width: 120 },
    { field: 'amount', title: 'Value', width: 80 ,customCell: customValueCell},
    { field: 'status', title: 'Status', width: 100, customCell: customStatusCell },
  ];

  const columns = detailsGridColoumns;

  let tableBodyContent;

  if (loading) {
    tableBodyContent = (
      <tr>
        <td colSpan={columns.length} className="text-center !px-4 py-3">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </td>
      </tr>
    );
  } else if (error) {
    tableBodyContent = (
      <tr>
        <td colSpan={columns.length} className="text-center px-4 py-3 text-red-500">
          {error.message || 'Something went wrong'}
        </td>
      </tr>
    );
  } else if (data.length === 0) {
    tableBodyContent = (
      <tr>
        <td colSpan={columns.length} className="text-center px-4 py-3">
          No transactions found.
        </td>
      </tr>
    );
  } else {
    tableBodyContent = data.map((item) => (
      <tr key={item.transactionId} className="border-t border-StrokeColor hover:bg-kendotdBghover">
        {columns.map((col) =>
          col.customCell ? (
            <React.Fragment key={col.field}>
              {col.customCell({ dataItem: item })}
            </React.Fragment>
          ) : (
            <td key={col.field} className="!px-4 py-3">
              {item[col.field] ?? '-'}
            </td>
          )
        )}
      </tr>
    ));
  }

  return (
    <div className=''>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-md font-semibold text-subTextColor">
          {'Recent Transactions'}
        </h1>
        <button
          type="button"
          className="secondary-outline"
          onClick={() => navigate('/transactions?module=All')}>
          All Transactions <span className="icon btn-arrow shrink-0 ml-2"></span>
        </button>
      </div>
      <div className="flex-1   px-2 md:px-0">
        {!loading && error && (
          <div className='error-message-box'>
            <AppAlert
              type="error"
              description={error}
              closable={true}
              showIcon
            />
          </div>
        )}
      </div>
      <div className='kpicardbg rewards-transaction'>
      <div className="!overflow-x-auto w-full border border-StrokeColor rounded-5">
        <table className="min-w-full w-[1300px] overflow-auto  text-left text-sm text-subTextColor border border-StrokeColor rounded-5">
          <thead className="bg-inputBg text-paraColor font-medium">
            <tr>
              {columns.map((col) => (
                <th key={col.field} className="px-4 py-3" style={{ width: col.width }}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="">
            {tableBodyContent}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

QuestTransactions.propTypes = {
  screenName: PropTypes.string,
};

export default QuestTransactions;
