import React, { lazy } from "react";
import ProtectedRoute from "../../core/layout/protected.route.jsx";
import PageError from "../../core/layout/pageError.jsx";
import withSuspense from "../../core/shared/withSuspense.jsx";
import FiatSummary from "./create/fiat.summary.jsx";
import SuccessComponent from "./create/success.jsx";
import accountsSelection from "./create/accounts.selection.jsx";
import CryptoSummary from "./create/crypto.summary.jsx";

// Lazy-loaded components
const Banks = lazy(() => import("./index.jsx"));
const BanksLayout = lazy(() => import("./layout.jsx"));
const DepositAccount = lazy(() => import("./deposit/index.jsx"));
const DepositLayout = lazy(() => import("./deposit/layout.jsx"));
const WithdrawLayout = lazy(() => import("./withdraw/layout.jsx"));
const CreateAccountLayout = lazy(() => import("./create/layout.jsx"));
const DepositFallback = lazy(() =>
  import("./deposit/deposit.fallback.jsx")
);
const WithdrawFallback = lazy(() =>
  import("./withdraw/withdraw.fallback.jsx")
);
const PaymentsWidget = lazy(() =>
  import("./create/payments.selection.jsx")
);

const WithdrawWidget = lazy(() => import("./withdraw/widget.jsx"));
const PayeeSelection = lazy(() => import("./withdraw/payees.selection.jsx"));
const kycVerification=lazy(()=>import("./create/kyc.requriments"))
const SummaryDetails = lazy(() =>
  import("./withdraw/summary.jsx")
);
const SuccessTransfer = lazy(() => import("./withdraw/success.jsx"));

const RoutesConfig = [
  {
    path: "banks",
    element: (
      <ProtectedRoute>
        <Banks />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(BanksLayout),
      },
      {
        path: "account/create/:productId?",
        element: withSuspense(CreateAccountLayout),
        children:[
          {
            index:true,
            element:withSuspense(accountsSelection),
          },
          {
            path:":type",
            element:withSuspense(kycVerification),
            
          },
          {
            path:":type/pay",
            element:withSuspense(PaymentsWidget),

          },
          {
            path:":type/pay/fait/summary",
            element:withSuspense(FiatSummary),
          },
          {
            path:":type/pay/crypto/summary",
            element:withSuspense(CryptoSummary),
          },
          {
            path:":type/pay/fait/summary/success",
            element:withSuspense(SuccessComponent),
          },
          {
            path:":type/pay/crypto/summary/success",
            element:withSuspense(SuccessComponent),
          },
          {
            path:":type/success",
            element:withSuspense(SuccessComponent),
          }
  
        ],
      },
      {
        path: "deposit",
        element: withSuspense(DepositLayout),
        children: [
          {
            index: true,
            element: withSuspense(DepositFallback),
          },
          {
            path: ":id/details/:currency",
            element: withSuspense(DepositAccount),
          },
        ],
      },
      {
        path: "withdraw",
        element: withSuspense(WithdrawLayout),
        children: [
          {
            index: true,
            element: withSuspense(WithdrawFallback),
          },
          {
            path: ":currency",
            element: withSuspense(WithdrawWidget),
          },
          {
            path: ":currency/recipientDetails/:bankAmount/:mode?",
            element: withSuspense(PayeeSelection),
          },
          {
            path: ":currency/summary/:bankAmount",
            element: withSuspense(SummaryDetails),
          },
          {
            path: ":currency/success",
            element: withSuspense(SuccessTransfer),
          },
        ],
      },
    ],
    errorElement: <PageError />,
  },
];

export default RoutesConfig;
