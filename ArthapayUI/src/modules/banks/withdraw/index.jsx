import { useCallback, useEffect, useMemo, useReducer } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import { bankReducer, bankStates } from "../deposit/reducer";
import AppAlert from "../../../core/shared/appAlert";
import { setLeftPanelRefresh } from "../../../reducers/vaults.reducer";
import { BuySellViewLoader } from "../../../core/skeleton/buysell";
import AppEmpty from "../../../core/shared/appEmpty";
import List from "./list";
import { getAccounts } from "../../../reducers/accounts.reducer";
const TransferComponent = (props) => {
    const [state, setState] = useReducer(bankReducer, bankStates)
    const {loader}=useSelector(store=>store.transferReducer.accounts)
    let navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const { currency } = useParams()
    const walletCode = useMemo(() => {
        return (currency === "undefined" || currency === "null") ? null : currency
    }, [currency])
    const isRefreshLeftPanel = useSelector((storeInfo) => storeInfo?.withdrawReducer?.isleftPanelRefresh);
    const navigateToDashboard = () => {
        navigate(`/dashboard`)
    }
    const navigateToWithdraw = () => {
        navigate(`/banks/withdraw/${walletCode}`)
    }
    const getBreadCrumbList = (pathname, walletCode, navigateToDashboard, navigateToWithdraw) => {
        const baseCrumbs = [
            { id: "1", title: "Bank", handleClick: navigateToDashboard },
            { id: "2", title: "Withdraw" },           
        ];
        if (pathname.includes("recipientDetails")) {
            return [
                ...baseCrumbs,
                { id: "3", title: walletCode, handleClick: navigateToWithdraw },
                { id: "4", title: "Select Payee" }
            ];
        }

       else if (pathname.includes("transferSummary")) {
            return [
                ...baseCrumbs,
                { id: "3", title: walletCode, handleClick: navigateToWithdraw },
                { id: "4", title: "Summary" }
            ];
        }

        else if (pathname.includes("transferSuccess")) {
            return [
                ...baseCrumbs,
                { id: "3", title: walletCode, handleClick: navigateToWithdraw },
                { id: "4", title: "Success" }
            ];
        }else if(walletCode){
            return [
                ...baseCrumbs,
                { id: "3", title: walletCode, handleClick: navigateToWithdraw },
            ];
        }

        return baseCrumbs;
    };

    const breadCrumbList = useMemo(() => {
        return getBreadCrumbList(pathname, walletCode, navigateToDashboard, navigateToWithdraw);
    }, [pathname, walletCode, navigateToDashboard, navigateToWithdraw]);

    useEffect(() => {
        if (pathname === "/banks/withdraw")
            dispatch(getAccounts());
    }, [pathname]);
    useEffect(() => {
        if (isRefreshLeftPanel) {
            dispatch(getAccounts());
            dispatch(setLeftPanelRefresh(false));
        }
    }, [isRefreshLeftPanel, walletCode]);

    const clearErrorMessage = () => {
        setState({ type: 'setError', payload: null });
    }
    const onRefresh = useCallback(() => {
        dispatch(setLeftPanelRefresh(true));
    }, [])
    return <ListDetailLayout
        breadCrumbList={breadCrumbList}
        showBreadcrumb={true}
        ListHeader={
            loader ? <></> : <ListDetailLayout.ListHeader title="Withdraw" showAdd={false} refreshBtn={true} onRefresh={onRefresh} />
        }
        ListComponent={<List/>
        }
        ListComponentTitle="Select Account"
        ViewHeader={(<></>)}
    >
        {state?.error && (
            <div className="alert-flex">
                <AppAlert
                    className="w-100 "
                    type="warning"
                    description={state?.error}
                    showIcon
                />
                <button className="icon sm alert-close" onClick={() => clearErrorMessage()}></button>
            </div>
        )
        }
        {loader && <BuySellViewLoader />}
         {!loader && Object.keys(props?.initialselectedObj)?.length === 0 && <AppEmpty />} 
        {!loader && Object.keys(props?.initialselectedObj)?.length > 0  && <Outlet />}
    </ListDetailLayout>
}
const connectStateToProps = ({ userConfig, transferReducer }) => {
    return {
        userConfig: userConfig.details, setAccountDetails: transferReducer?.accountDetails,
        initialselectedObj: transferReducer?.initialselectedObj
    };
};
const connectDispatchToProps = (dispatch) => {
    return {
        dispatch
    };
};
export default connect(connectStateToProps, connectDispatchToProps)(TransferComponent);