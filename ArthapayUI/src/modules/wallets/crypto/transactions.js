import List from "../../../core/grid.component";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { setTransactionGridRefresh } from "../../../reducers/vaults.reducer";
import CommonDrawer from "../../../core/shared/drawer";
import PaymentsTransactionDetails from "../../../core/shared/paymentsTransactionDetails";
import { useTranslation } from "react-i18next";
import { TransactionDateHandler, TransactionIdHandler, TransactionStateHandler } from "./service";

const Transactions = ({ url }) => {
    const navigate = useNavigate();
    const [isViewDrawer, setISViewDrawer] = useState(false)
    const [handleViewData, setHandleViewData] = useState({})
    const { t } = useTranslation();
    const WalletType = window.runtimeConfig.VITE_WALLET_TYPE
    const baseURL = WalletType === 'non_custodial' ? window.runtimeConfig.VITE_WEB3_API_END_POINT : window.runtimeConfig.VITE_CORE_API_END_POINT
    const gridRef = useRef(null);
    const dispatch = useDispatch();
    const isRefresh = useSelector((storeInfo) => storeInfo?.withdrawReducer?.isRefreshTransactionGrid);
    const selectedVault = useSelector((storeInfo) => storeInfo?.vaultsAccordion?.selectedVault);

    const stateHandler = (cellprops) => {
        return (<TransactionStateHandler cellprops={cellprops} />)
    }

    const dateHandler = (props) => {
        return (<TransactionDateHandler dateProps={props} />)
    }
  

    const txIdHandler = (cellProps) => {
         return (<TransactionIdHandler txIdProps={cellProps} />)
    }
    const walletColumns = [
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
            width: 160,
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
            filterType: "numeric",
            width: 90,
        },
        {
            field: 'fee',
            title: t('vault.vaultscrypto.fee'),
            filter: false,
            filterType: "numeric",
            width: 90,
        },
        {
            field: 'state',
            title: t('vault.vaultscrypto.state'),
            width: 100,
            filter: false,
            sortable: false,
            customCell: stateHandler
        },
    ];
    // as of now we are not using this function in future it may be used
    const handleView = (data) => { // NOSONAR
        setISViewDrawer(true)
        setHandleViewData(data)
    }
    useEffect(() => {
        if (isRefresh) {
            gridRef?.current?.refreshGrid();
            dispatch(setTransactionGridRefresh(false));
        }
    }, [isRefresh])
    const handleToRedirect = () => {
       navigate(`/transactions?module=Vaults&vaultId=${selectedVault.id}`);
    }
    const isCloseDrawer = useCallback(() => {
        setISViewDrawer(false);
        setHandleViewData({})
    }, [])

    const closeDrawerHandler = useCallback(() => {
        setISViewDrawer(false)
    }, [])
    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-md font-semibold text-titleColor my-2">{t('vault.vaultscrypto.transactions')}
                    {/* <span className="icon lg square-arrow cursor-pointer" onClick={handleToRedirect}></span> */}

                </h1>
                <button type="normal" className="secondary-outline" onClick={handleToRedirect}>All Transactions  <span className="icon btn-arrow shrink-0 ml-2"></span></button>

            </div>
            <div>
                <List
                    ref={gridRef}
                    pageable={false}
                    columns={walletColumns}
                    url={baseURL + url}
                />
            </div>
            {<CommonDrawer title={`Transaction Details`} isOpen={isViewDrawer} onClose={closeDrawerHandler}>
                {isViewDrawer && <PaymentsTransactionDetails data={handleViewData} isCloseDrawer={isCloseDrawer} />}
            </CommonDrawer>}
        </div>
    )
}

export default memo(Transactions);
