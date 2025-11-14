import { useTranslation } from "react-i18next";
import List from "../../../../core/grid.component";
import { currentApiVersion } from "../../httpClients";
import { TransactionIdHandler } from "../../../wallets/crypto/service";
import { FiatTransactionsDateHandler, FiatTransactionsStatusHandler } from "../../../wallets/service";
import { useCallback, useMemo, useRef } from "react";
import { useOutletContext } from "react-router";
import AppEmpty from "../../../../core/shared/appEmpty";

const WalletType = window.runtimeConfig.VITE_WALLET_TYPE;
const baseURL =
    WalletType === "non_custodial"
        ? `${window.runtimeConfig.VITE_WEB3_API_EXCHANGE_END_POINT}/${currentApiVersion}`
        : `${window.runtimeConfig.VITE_API_PAYMENTS_END_POINT}/${currentApiVersion}`;


const RecentTransactions = () => {
    const gridRef = useRef(null);
    const { t } = useTranslation();
    const {detailsView} = useOutletContext();
    const txIdHandler = (cellProps) => {
        return (<TransactionIdHandler txIdProps={cellProps} />)
    }
    const dateHandler = useCallback((dateProps) => {
        return (<FiatTransactionsDateHandler dateProps={dateProps} />)
    }, [])

    const statusHandler = useCallback((statusProps) => {
        return (<FiatTransactionsStatusHandler statusProps={statusProps} />)
    }, [])

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

    const queryParams = useMemo(() => {
        if ((detailsView?.type && detailsView?.code) && detailsView?.type?.toLowerCase() !== 'payments') {
            return `type=${detailsView.type.toLowerCase()}&currency=${detailsView.code}`;
        }
        return null; // return null if not valid
    }, [detailsView?.type, detailsView?.code]);


    return (
        <div className="flex flex-col mt-5">
            { queryParams && <>
            
            <h1 className="text-md font-semibold text-titleColor my-2">Recent Transactions</h1>
            {/* <p className="text-gray-600">No recent transactions available.</p> */}
           <List
                url={`${baseURL}payments/deposit/fiat/transactions`}
                columns={fiatColumns}
                ref={gridRef}
                hasQuery={true}
                query={queryParams}
            /></>}
            { !queryParams && <AppEmpty description = "No transcations available"/>}
        </div>
    );

}

export default RecentTransactions;