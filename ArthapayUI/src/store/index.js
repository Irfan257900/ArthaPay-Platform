import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../reducers/auth.reducer.js';
import userConfigReducer from '../reducers/userconfig.reducer.js';
import profileReducer from '../reducers/profile.reducer.js';
import serviceWorkerReducer from '../reducers/serviceWorker';
import dashboardReducer from '../reducers/dashboard.reducer.js';
import applyCardReducer from '../modules/cards/reducers/applyCardReducer';
import PayeeReducer from '../reducers/payees.reducer.js';
import accordianReducer from '../modules/payments/payouts/payout.accordion.reducer.jsx'
import batchPayoutsReducer from '../modules/payments/reducers/batchPayoutsReducer';
import vaultsAccordionReducer from '../modules/wallets/vaultAccordianReducer'
import withdrawReducer from '../reducers/vaults.reducer.js';
import payoutFormSlice from '../modules/payments/reducers/payout.reducer'
import kycReducer from '../reducers/kyc.reducer.js';
import kybReducer from '../reducers/kyb.reducer.js';
import exchangeSlice from '../modules/exchange/reducer.js'
import buyReducer from '../modules/exchange/buy/store.reducer.js';
import sellReducer from '../modules/exchange/sell/store.reducer.js';
import accountsReducer from '../reducers/accounts.reducer.js';
import transferReducer from '../reducers/banks.widthdraw.reducer.js';
import WithdrawFaitReducer from '../modules/wallets/fiat/withdraw.components/withdrawFiatReducer.js';
import banksSlice from '../reducers/banks.reducer.js';
import cardsSlice from '../reducers/cards.reducer.js';
import transactionsSlice from '../reducers/transactions.reducer.js'
import questsSlice from '../reducers/quests.reducer.js'
import rewardsSlice from '../reducers/rewards.reducer.js'
import payinSlice from '../modules/payments/reducers/payin.reducer.js';
const rootReducer = combineReducers({
  oidc: authReducer,
  userConfig: userConfigReducer,
  serviceWorker: serviceWorkerReducer,
  dashboardReducer,
  payeeStore: PayeeReducer,
  applyCard: applyCardReducer,
  batchPayouts: batchPayoutsReducer,
  vaultsAccordion: vaultsAccordionReducer,
  withdrawReducer: withdrawReducer,
  payoutReducer: payoutFormSlice,
  kycStore: kycReducer,
  kybStore: kybReducer,
  payoutAccordianReducer: accordianReducer,
  exchangeStore: exchangeSlice,
  buyState: buyReducer,
  sellState: sellReducer,
  accountsReducer: accountsReducer,
  transferReducer: transferReducer,
  withdrawFiat: WithdrawFaitReducer,
  banks: banksSlice.reducer,
  cardsStore: cardsSlice,
  profileStore: profileReducer,
  txsStore: transactionsSlice,
  quests : questsSlice,
  rewards : rewardsSlice,
  payinstore:payinSlice
});

const store = configureStore({
  reducer: rootReducer,
  devTools: window.runtimeConfig.NODE_ENV !== 'production',
});


export { store };
