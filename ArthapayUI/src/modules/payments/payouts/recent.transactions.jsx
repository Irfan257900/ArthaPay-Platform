import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import moment from "moment";
import { useTranslation } from "react-i18next";
import CopyComponent from "../../../core/shared/copyComponent";
import AppEmpty from "../../../core/shared/appEmpty";
import { getRecentTransactions } from "../httpServices";
import { statusColorsPayout } from "../../../utils/statusColors";
import AppAlert from "../../../core/shared/appAlert";
import AppNumber from "../../../core/shared/inputs/appNumber";
import NumericText from "../../../core/shared/numericText";
import AppDefaults from "../../../utils/app.config";
import { setRefreshRecentTransaction } from "../reducers/payout.reducer";
import { useDispatch, useSelector } from "react-redux";

const StateHandler = ({ status }) => {
    return (
        <span className={`text-left text-sm font-medium ${statusColorsPayout[status?.toLowerCase()]}`}>
            {status}
        </span>
    );
};

const RecentActivity = ({ actionType, mode }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const dispatch = useDispatch();
    const isRefreshRecentTransations = useSelector((storeInfo) => storeInfo?.payoutReducer?.isRefreshRecentTransations);
    useEffect(() => {
        if (mode === 'add' || mode === 'success'){
            fetchTransactions();
            }
    }, [actionType, mode]);

    useEffect(()=>{
         if(isRefreshRecentTransations){
            fetchTransactions();
            dispatch(setRefreshRecentTransaction(false))
         }
    },[isRefreshRecentTransations])

    const fetchTransactions = async () => {
        await getRecentTransactions(setTransactions, setLoading, setErrorMsg, actionType);
    }
    const handleToRedirect = () => {
        navigate('/transactions')
    };

    const formatTxId = (id) => `${id?.slice(0, 4)}...${id?.slice(-4)}`;

    const onErrorMessage = useCallback(() => {
        setErrorMsg(null)
    }, []);

    return (
        <div>
            {errorMsg !== null && (
                <div className="alert-flex">
                    <AppAlert
                        type="error"
                        description={errorMsg}
                        onClose={onErrorMessage}
                        showIcon
                    />
                    <span className="icon sm alert-close" onClick={onErrorMessage}></span>
                </div>
            )}
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-md font-semibold text-titleColor">
                    {t('vault.vaultscrypto.transactions')}
                </h1>
                <button
                    type="button"
                    className="secondary-outline"
                    onClick={handleToRedirect}
                >
                    All Transactions <span className="icon btn-arrow shrink-0 ml-2"></span>
                </button>
            </div>
            <div className="overflow-x-auto w-full rewards-transaction">
                <table className="min-w-full w-[790px] text-left text-sm text-subTextColor border border-StrokeColor rounded-5">
                    <thead className="bg-inputBg text-paraColor text-sm font-medium rounded-l-5 rounded-r-5">
                        <tr>
                            <th className="px-4 py-3">Transaction ID</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Coin</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Fee</th>
                            <th className="px-4 py-3">Net Amount</th>
                            <th className="px-4 py-3">State</th>
                        </tr>
                    </thead>
                    <tbody className="">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="">
                                    <div className="flex justify-center items-center py-8">
                                        <div className="relative w-20 h-20">
                                            <div className="absolute inset-0 rounded-full border-2 border-t-lightWhite border-transparent animate-spin-slow"></div>
                                            <div className="absolute inset-2 rounded-full border-2 border-t-lightWhite border-transparent animate-spin-medium"></div>
                                            <div className="absolute inset-4 rounded-full border-2 border-t-subTextColor border-transparent animate-spin-fast"></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : transactions?.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4 recent-activity-empty">
                                    <AppEmpty />
                                    <span className="text-lightWhite text-sm font-medium mt-4">No records available</span>
                                </td>
                            </tr>
                        ) : (
                            transactions?.map((tx) => (
                                <tr key={tx.txId} className="border-t border-StrokeColor hover:bg-kendotdBghover transition">
                                    <td className="px-4 py-3 flex items-center gap-2">
                                        {formatTxId(tx.txId)}
                                        <CopyComponent
                                            text={tx.txId}
                                            noText="No refId"
                                            shouldTruncate={false}
                                            type=""
                                            className="icon copy-icon cursor-pointer text-primaryColor"
                                            textClass="text-primaryColor"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        {tx.date ? moment.utc(tx.date).local().format("DD/MM/YY hh:mm A") : "-"}
                                    </td>
                                    <td className="px-4 py-3">{tx.code || "-"}</td>
                                    <td className="px-4 py-3">
                                        <NumericText
                                            value={tx.amount}
                                            decimalScale={AppDefaults?.fiatDecimals}
                                            fixedDecimals={true}
                                            thousandSeparator={true}
                                        />

                                    </td>
                                    <td className="px-4 py-3">
                                        <NumericText
                                            value={tx.fee}
                                            decimalScale={AppDefaults?.fiatDecimals}
                                            fixedDecimals={true}
                                            thousandSeparator={true}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <NumericText
                                            value={tx.receviedAmount}
                                            decimalScale={AppDefaults?.fiatDecimals}
                                            fixedDecimals={true}
                                            thousandSeparator={true}
                                            suffixText={tx.txwith}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-textGreen">
                                        <StateHandler status={tx.state} />
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

export default RecentActivity;
