import * as SignalR from '@microsoft/signalr';
import { fetchCasesData, fetchUserDetails, setCurrentRole, setIsSubscribed, setKycStatus, setReKycEnabled, updateDocRequest } from '../reducers/userconfig.reducer';
import { store } from '../store';
import { notification } from 'antd';
import { fetchDashboardCalls, setNotificationCount } from '../reducers/dashboard.reducer';
import { getNotificationIcon } from './app.config';
import { fetchKpis } from '../modules/exchange/reducer';
import { fetchKpisData } from '../modules/payments/reducers/payout.reducer';
import { fetchKpis as fetchBankKpis } from '../reducers/banks.reducer';
import { fetchGraphDetails, fetchKpis as fetchVaultKpis } from '../reducers/vaults.reducer';
import { fetchKpis as fetchCardKpis, fetchGraphDetails as fetchCardsGraphDetails } from '../reducers/cards.reducer';
function openNotification(message, title, user, text) {
    const args = {
        message: title,
        description: message,
        duration: 10,
        icon: <span className={getNotificationIcon(title, true) || getNotificationIcon(message, true)} />
    };
    notification.open(args);
}
async function start(id) {
    const connection = new SignalR.HubConnectionBuilder()
        .withUrl(window.runtimeConfig.VITE_NOTIFICATION_HUB + "NotificationHub?userid=" + id)
        .configureLogging(window.runtimeConfig.DEV
            ? SignalR.LogLevel.Information
            : SignalR.LogLevel.None)
        .build();
    try {
        await connection.start();
    } catch (err) {
        const { userConfig: { details } } = store.getState();
        setTimeout(() => { start(details?.id) }, 10000);
    }
    connection.onclose(async () => {
        const { userConfig: { details } } = store.getState();
        await start(details?.id);
    });
    connection.on("sendToUser", (user, message, title, text) => {
        const currentPath = window.location.pathname;
        if (user?.toLowerCase() === "cases" || user?.toLowerCase() === "case") {
            const { userConfig: { details } } = store.getState();
            store.dispatch(fetchCasesData(details?.id));
        }
        if (["KYC", "KYB", "kyc", "kyb"].includes(user)) {
            if (message?.toLowerCase()?.includes('under review')) {
                store.dispatch(setKycStatus("Under Review"));
            }
            else if (message?.toLowerCase()?.includes('rejected')) {
                store.dispatch(setKycStatus("Rejected"));
            } else if (message?.toLowerCase()?.includes('approved')) {
                store.dispatch(setKycStatus("Approved"));
                store.dispatch(setReKycEnabled(false));
            } else if (message?.toLowerCase()?.includes('approval in progress')) {
                store.dispatch(setKycStatus("Approval In Progress"));
            }
        }
        if (["upgrade membership", "membership upgrade", "membership purchase", "purchase membership", "upgrade package", "package upgrade", "purchase package", "package purchase"].includes(user?.toLowerCase())) {
            store.dispatch(setIsSubscribed(true));
        }
        if (["Affiliate Status Activated", "affiliate status activated", "affiliate"].includes(user?.toLowerCase())) {
            store.dispatch(setCurrentRole('Affiliate'));
        }
        if (["Buy", "buy", "Sell", "sell"].includes(user?.toLowerCase()) && (currentPath.toLowerCase().includes("/exchange/buy") || currentPath.toLowerCase().includes("/exchange/sell"))) {
            store.dispatch(fetchKpis({ showLoading: false }));
        }
        if (["Withdraw Crypto", "withdraw crypto"].includes(user?.toLowerCase()) && currentPath.toLowerCase().includes("/payments/payouts")) {
            store.dispatch(fetchKpisData({ showLoading: false }));
        }
        if (["Payments", "payments","payoutfiat","PayoutFiat","PayOut Fiat","payout fiat","PayoutCrypto","payoutcrypto","PayOut Crypto",'payout crypto'].includes(user?.toLowerCase()) && (currentPath.toLowerCase().includes("/payments/payins")||currentPath.toLowerCase().includes("/payments/payouts"))) {
            store.dispatch(fetchKpisData({ showLoading: false }));
        }
        if (["Withdraw Fiat", "withdraw fiat", "Deposit Crypto", "deposit crypto", "Deposit Fiat", "deposit fiat"].includes(user?.toLowerCase()) && (currentPath.toLowerCase().includes("/wallets/crypto") || currentPath.toLowerCase().includes("/wallets/fiat"))) {
            store.dispatch(fetchVaultKpis({ showLoading: false }));
            store.dispatch(fetchGraphDetails({ showLoading: false }));
        }
        if (["Withdraw", "withdraw", "Deposit", "deposit", "Deposit Fiat", "deposit fiat",  "Account Created", "account created", "Account Creation", "account creation","Account Creation", "account creation","Account Creation", "account creation"].includes(user?.toLowerCase()) && (currentPath.toLowerCase().includes("/banks/withdraw") || currentPath.toLowerCase().includes("/banks/deposit") || currentPath.toLowerCase().includes("/banks/account/create/")||currentPath.toLowerCase().includes("success"))) {
            store.dispatch(fetchBankKpis({ showLoading: false }));
        }
        if (["Apply Card", "apply card", "Top UP", "top up", "topup", "TopUp", "consume", "consumed"].includes(user?.toLowerCase()) && (currentPath.toLowerCase().includes("/cards/apply") || currentPath.toLowerCase().includes("/cards/mycards"))) {
            store.dispatch(fetchCardKpis({ showLoading: true }));
            store.dispatch(fetchCardsGraphDetails({ showLoading: true }));
        }
        if (message?.toLowerCase()?.includes('forcedkyc')) {
            store.dispatch(setReKycEnabled(true));
        }
        if (["KYC", "kyc", "KYB", "kyb", "Customer", "customer"].includes(user?.toLowerCase())) {
            store.dispatch(fetchUserDetails());
        }

        openNotification(message, user);

        const { dashboardReducer: { notificationCount } } = store.getState();
        store.dispatch(setNotificationCount(notificationCount ? notificationCount + 1 : 1));
    });
    connection.on("SendDocRequestedMessage ", () => {
        store.dispatch(updateDocRequest(true));
    });
    connection.on("SendDocApproved", (b) => {
        store.dispatch(updateDocRequest(b === "Requested"));
    });

    connection.on("UpdateWallet", () => {
        const { userConfig: { details } } = store.getState();
        store.dispatch(fetchDashboardCalls(details?.id));
    });
    connection.on("SendRoleUpdatedMessage", () => {

    });
}



function startConnection(id) {
    start(id);
}

export { startConnection }