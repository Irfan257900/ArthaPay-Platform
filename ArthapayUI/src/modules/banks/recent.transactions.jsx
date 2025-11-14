import { Link, useNavigate } from "react-router";
import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateCell, StatusCell, TransactionIdHandler } from "./service";
import CustomButton from "../../core/button/button";
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from "antd";
import { banksTransactions } from "./http.services";
import AppNumber from "../../core/shared/inputs/appNumber";
import NumericText from "../../core/shared/numericText";
import numberFormatter from "../../utils/numberFormatter";
import AppDefaults from "../../utils/app.config";
import { useSelector } from "react-redux";
const TransactionGrid = ({ url }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const renderDateCell = (dataItem) => {
    return <DateCell dataItem={dataItem} />
  };
  const txIdHandler = (cellProps) => {
    return (<TransactionIdHandler txIdProps={cellProps} />)
  }

  const IsRefresh=useSelector(store=>store.accountsReducer.isRefresh)
  useEffect(() => {
    if(IsRefresh){
      fetchTransactions();
    }
  }, [IsRefresh]);


  useEffect(() => {
    fetchTransactions();
  }, [url]);
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      await banksTransactions(url, setLoading, setTransactions, setErrorMsg);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      setTransactions([]);
    } finally {

      setLoading(false);
    }
  }
  const handleToRedirect = useCallback(() => {
    navigate(`/transactions`);
  }, []);
  const getBalanceText = (amount, isSuffix, isOnlyAmount) => {
    const numAmount = parseFloat(amount) || 0;
    if (isNaN(numAmount)) return '0.00';

    const { number, suffix } = numberFormatter(numAmount) || {};
    const formattedNumber = (number ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (isSuffix) {
      return suffix || "";
    }
    if (isOnlyAmount) {
      return formattedNumber;
    }
    return `$ ${formattedNumber}`;
  };
  return (
    <div>
      <div className="flex justify-between items-center my-2">
        <h1 className="text-md font-semibold text-titleColor flex items-center gap-1.5">
          <span>{t("vault.vaultscrypto.transactions")}</span>
          <CustomButton type="normal" onClick={handleToRedirect}>
            <span className="icon lg square-arrow cursor-pointer"></span>
          </CustomButton>
        </h1>
        <div>
          <Link
            to="/transactions?module=Banks"
            className="secondary-outline flex !items-center"
          >
            <span>All Transactions</span>
            <span className="icon btn-arrow shrink-0 ml-2"></span>
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto w-full rewards-transaction">
        <table className="min-w-full w-[790px] text-left text-sm text-subTextColor border border-StrokeColor rounded-5">
          <thead className="bg-inputBg text-paraColor text-sm font-medium rounded-l-5 rounded-r-5">
            <tr>
              <th className="px-4 py-3">Transaction ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Wallet</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Net Amount</th>
              <th className="px-4 py-3">State</th>
            </tr>
          </thead>
          <tbody className="">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  <div className="flex justify-center items-center h-full">
                    <Flex align="center" gap="middle">
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                    </Flex>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">No records available</td>
              </tr>
            ) : (
              transactions.map((tx, idx) => (
                <tr key={idx} className="border-t border-StrokeColor hover:bg-kendotdBghover transition">
                  <td className="px-4 py-3 flex items-center gap-2">
                    {txIdHandler(tx.txId)}
                  </td>
                  <td className="px-4 py-3">
                    {renderDateCell(tx?.date)}
                  </td>
                  <td className="px-4 py-3">{tx.walletCode || "-"}</td>
                  <td className="px-4 py-3">
                    <NumericText
                      value={tx.amount || 0}
                      decimalScale={AppDefaults.fiatDecimals}
                      thousandSeparator
                      className="block"
                      displayType="text"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <NumericText
                      value={tx.fee|| 0}
                      decimalScale={AppDefaults.fiatDecimals}
                      thousandSeparator
                      className="block"
                      displayType="text"
                    />

                  </td>
                  <td className="px-4 py-3">
                    <NumericText
                      value={tx.netAmount|| 0}
                      decimalScale={AppDefaults.fiatDecimals}
                      thousandSeparator
                      className="block"
                      displayType="text"
                    />
                  </td>
                  <td className="px-4 py-3 text-textGreen">
                    <StatusCell dataItem={tx.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default memo(TransactionGrid);
