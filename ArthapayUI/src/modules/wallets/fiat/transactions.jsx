import { useCallback, useRef, memo } from "react";
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router";
import List from "../../../core/grid.component";
import { FiatTransactionsDateHandler, FiatTransactionsStatusHandler } from "../service";
import { TransactionIdHandler } from "../crypto/service";

const WalletType = window.runtimeConfig.VITE_WALLET_TYPE
const baseURL = WalletType === 'non_custodial' ? window.runtimeConfig.VITE_WEB3_API_END_POINT : window.runtimeConfig.VITE_CORE_API_END_POINT

function FiatTransactions({ selectedCurrency, actionType }) {
    const gridRef = useRef(null);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const handleToRedirect = useCallback(() => {
        navigate('/transactions?module=Vaults')
    }, [])

    const txIdHandler = (cellProps) => {
        return (<TransactionIdHandler txIdProps={cellProps} />)
    }

    const dateHandler = useCallback((dateProps) => {
        return (<FiatTransactionsDateHandler dateProps={dateProps} />)
    }, [selectedCurrency, actionType])
    const statusHandler = useCallback((statusProps) => {
        return (<FiatTransactionsStatusHandler statusProps={statusProps} />)
    }, [selectedCurrency, actionType])
    const fiatColumns = [
        {
            field: 'txId',
            title: t('vault.vaultscrypto.transactionID'),
            filter: false,
            filterType: 'text',
            sortable: false,
            width: 140,
            customCell: txIdHandler
        },
        {
            field: "date",
            title: t('vault.vaultscrypto.date'),
            width: 165,
            filter: false,
            sortable: false,
            customCell: dateHandler
        },
        {
            field: 'code',
            title: t('vault.vaultscrypto.wallet'),
            filter: false,
            filterType: 'text',
            sortable: false,
            width: 110

        },
        {
            field: 'amount',
            title: t('vault.vaultscrypto.amount'),
            filter: false,
            filterType: "text",
            width: 90,
        },
        {
            field: 'fee',
            title: t('vault.vaultscrypto.fee'),
            filter: false,
            filterType: "text",
            width: 90,
        },
        {
            field: 'state',
            title: t('vault.vaultscrypto.state'),
            width: 100,
            filter: false,
            sortable: false,
            customCell: statusHandler
        },
    ];
    return (
        <div>
            <div className="px-3 flex items-center justify-between">
                <h1 className="text-md font-semibold text-titleColor my-2">{t('vault.fiatvaults.transactions')}
                    {/* <span className="icon lg square-arrow cursor-pointer" onClick={handleToRedirect}></span> */}
                </h1>
                <button type="normal" className="secondary-outline" onClick={handleToRedirect}>All Transactions  <span className="icon btn-arrow shrink-0 ml-2"></span></button>

            </div>
            <div className="px-3">
                <List
                    key={`${selectedCurrency}-${actionType}`}
                    ref={gridRef}
                    pageable={false}
                    columns={fiatColumns}
                    url={`${baseURL}/api/v1/${actionType === 'deposit' ? 'deposit' : 'withdraw'}/fiat/transactions`}
                    pSize={5}
                />
            </div>
        </div>
    )
}

export default memo(FiatTransactions)