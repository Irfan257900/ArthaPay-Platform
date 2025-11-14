import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import CommonDrawer from '../../../core/shared/drawer';
import CardsDetails from '../../../core/transactions/transaction';
import { textStatusColors } from '../../../utils/statusColors';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { currentApiVersion } from '../httpClients';
import CopyComponent from '../../../core/shared/copyComponent';
import { getMyCardsTransactions } from '../httpServices';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import NumericText from '../../../core/shared/numericText';

const WalletType = window.runtimeConfig.VITE_WALLET_TYPE;
const baseURL = WalletType === 'non_custodial'
  ? window.runtimeConfig.VITE_WEB3_API_END_POINT
  : `${window.runtimeConfig.VITE_API_CARDS_END_POINT}/${currentApiVersion}`;

const Transactions = (props) => {
  const [isViewDrawer, setISViewDrawer] = useState(false);
  const [handleViewData, setHandleViewData] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (props?.cardId) {
      fetchCardTransactions();
    }
  }, [props?.cardId, props?.showTransactions]);


  const handleViewDrawer = useCallback((data) => {
    setISViewDrawer(!isViewDrawer);
    setHandleViewData(data)
  }, [isViewDrawer]);

  const fetchCardTransactions = useCallback(async () => {
    try {
      await getMyCardsTransactions(props?.cardId, setLoading, setData, setError);
    } catch (err) {
      setError(err);
    }
  }, [props?.cardId]);



  // Custom render functions
  const renderTransactionDate = (cellprops) => (
    <td className='px-3'>
      <div>
        {cellprops.dataItem.date
          ? moment.utc(cellprops.dataItem.date).local().format("DD/MM/YYYY hh:mm:ss A")
          : cellprops.dataItem.date}
      </div>
    </td>
  );
  const renderCardName = (propsData) => (<></>
    // <td className='px-3'>
    //   <div className='flex items-center gap-2'>
    //     <img src={propsData?.dataItem['logo']} alt='logo' className='w-11 rounded-5 h-7 gap-2 object-cover' />
    //     <div>
    //       <p className='text-xs font-medium text-subTextColor'>
    //         {propsData?.dataItem?.txSubType === "Fiat"
    //           ? `${propsData?.dataItem?.cardNumber?.substr(0, 4) || "XXXX"} XXXX XXXX ${propsData?.dataItem?.cardNumber?.substr(-4) || "XXXX"}`
    //           : `${propsData?.dataItem?.cardNumber?.substr(0, 8)}....${propsData?.dataItem?.cardNumber?.substr(-8)}`}
    //       </p>
    //     </div>
    //   </div>
    // </td>
  );
  const renderDate = (cellprops) => (
    <td className='px-3'>{cellprops.dataItem.date
      ? moment.utc(cellprops.dataItem.date).local().format("DD/MM/YYYY hh:mm:ss A")
      : "-"}</td>
  );
  const renderAmount = (cellprops) => (
    // <td className='px-3'>{cellprops.dataItem.value || '-'}</td>
    <td className='px-3'>
      <NumericText
        value={cellprops.dataItem.value}
        thousandSeparator={true}
        displayType="text"
        decimalScale={2}
      />
    </td>

  );
  const renderCardNumber = (cellprops) => {
    const cardNumber = cellprops?.dataItem?.cardNumber || 'XXXX XXXX XXXX XXXX';
    const isSpecialType = ['First Recharge', 'Top up Card', 'Consume'].includes(cellprops?.dataItem?.type);
    return (
      <td className='px-3'>
        {isSpecialType
          ? cardNumber
          : `${cardNumber?.slice(0, 8)}...${cardNumber?.slice(-8)}`
        }
      </td>
    );
  };

  const txIdHandler = (cellProps) => {
    const value = cellProps?.dataItem?.txId;
    const shortTxId = `${value.slice(0, 4)}...${value.slice(-4)}`;
    return (
      <td className='px-3'>
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
    const status = propsData.dataItem?.status || "Approved";
    return (
      <td className='px-3'>
        <span className={textStatusColors[status]}>
          {status}
        </span>
      </td>
    );
  };

  // Grid column definitions
  const detailsGridColoumns = [
    { field: 'txId', title: t('cards.myCards.Transaction_ID'), width: 140, customCell: txIdHandler },
    { field: 'date', title: t('cards.myCards.Transaction_Date'), width: 200, customCell: renderTransactionDate },
    { field: 'transactionType', title: t('cards.myCards.Transaction_Type'), width: 170 },
    { field: 'type', title: t('cards.myCards.Action'), width: 130 },
    // { field: 'cardNumber', title: t('cards.myCards.Card_Number_Address'), width: 180, customCell: renderCardNumber },
    { field: 'value', title: t('cards.myCards.Amount'), width: 80, customCell: renderAmount },
    // { field: 'fee', title: t('cards.myCards.Fee'), width: 80 },
    // { field: 'value', title: t('cards.myCards.Net_Amount'), width: 180 },
    { field: 'status', title: t('cards.myCards.Status'), width: 100, customCell: customStatusCell },
    { field: 'merchantName', title: t('transactions.MerchantName'), width: 140 },
  ];

  const cardsGridColoumns = [
    { field: 'cardName', title: t('cards.CardNumberOrAddress'), width: 180, customCell: renderCardName },
    { field: 'type', title: t('cards.Type'), width: 100 },
    { field: 'date', title: t('cards.Date'), width: 100, customCell: renderDate },
    { field: 'value', title: t('cards.Amount'), width: 90, customCell: renderAmount },
  ];

  const columns = props.screenName === 'cards' ? cardsGridColoumns : detailsGridColoumns;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-md font-semibold text-titleColor">
          {props.screenName === 'cards'
            ? `${t('cards.myCards.Recent')} ${t('cards.myCards.Transactions')}`
            : t('vault.vaultscrypto.transactions')}
        </h1>
        <button
          type="button"
          className="secondary-outline"
          onClick={() => navigate('/transactions?module=Cards')}>
          All Transactions <span className="icon btn-arrow shrink-0 ml-2"></span>
        </button>
      </div>

      <div className="overflow-x-auto w-full rewards-transaction">
        <table className="min-w-full w-[1250px] text-left text-sm text-subTextColor border border-StrokeColor rounded-5">
          <thead className="bg-inputBg text-paraColor font-medium">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="py-3 px-3" style={{ width: col.width }}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 px-3">
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-red-500">
                  {error.message || 'Something went wrong'}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 px-3">
                  No transactions found.
                </td>
              </tr>
            ) : (
              data?.map((item, idx) => (
                <tr key={idx} className="border-t border-StrokeColor hover:bg-kendotdBghover">
                  {columns.map((col, cIdx) =>
                    col.customCell ? (
                      <React.Fragment key={cIdx}>
                        {col.customCell({ dataItem: item })}
                      </React.Fragment>
                    ) : (
                      <td key={cIdx} className="py-4 px-3">
                        {item[col.field] ?? ' '}
                      </td>
                    )
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isViewDrawer && (
        <CommonDrawer
          title="Transaction Details"
          isOpen={isViewDrawer}
          onClose={handleViewDrawer}>
          <CardsDetails data={handleViewData} isCloseDrawer={handleViewDrawer} />
        </CommonDrawer>
      )}
    </div>
  );
};
Transactions.propTypes = {
  screenName: PropTypes.string,
  cardId: PropTypes.string,
};
export default Transactions;
