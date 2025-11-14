import React, { lazy } from "react";
import ProtectedRoute from "../../core/layout/protected.route.jsx";
import PageError from "../../core/layout/pageError.jsx";
import AppEmpty from "../../core/shared/appEmpty.js";
import withSuspense from "../../core/shared/withSuspense.jsx";

// Lazy-loaded components
const Payments = lazy(() => import("./index.jsx"));
const Dashboard = lazy(() => import("./dashboard.jsx"));
const BatchPayoutsLayout = lazy(() => import("./batchPayouts/batch.payouts.layout.jsx"));
const Paymentvaults = lazy(() => import("../wallets/index"));
const Payment = lazy(() => import("./batchPayouts/payment.js"));
const Payouts = lazy(() => import("./payouts/payoutLayout"));
const Payout = lazy(() => import("./payouts/payout"));
const PayInsLayout = lazy(() => import("./payIns/payin.layout.jsx"));
const PayIn = lazy(() => import("./payIns/payIn/index"));
const PayoutSummary = lazy(() => import("./payouts/summary"));
const PayinLayout = lazy(()=>import("./payIns/index.jsx"))


const RoutesConfig = [
  {
    path: "payments",
    element: (
      <ProtectedRoute>
      <Payments/>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(PayinLayout),
      },
      {
        path: "vaults",
        element: withSuspense(Paymentvaults),
      },
      {
        path: "payins",
        element: withSuspense(PayinLayout),
        children: [
          {
            index: true,
            element: withSuspense(AppEmpty),
          },
          {
            path: "payin/:id/:vaultName/:mode/:type?/:invno?",
            element: withSuspense(PayIn),
          },
        ],
      },
      {
        path: "payouts",
        element: withSuspense(Payouts),
        children: [
          {
            path: "payout/:id/:vaultName/:mode/:currencyType?/:transactionType?",
            element: withSuspense(Payout),
          },
          {
            path: "payout/:currency/:network/:payeeName/:payeeAccNum/:amount/:document?",
            element: withSuspense(PayoutSummary),
          },
        ],
      },
      {
        path: "batchpayouts",
        element: withSuspense(BatchPayoutsLayout),
        children: [
          {
            index: true,
            element: withSuspense(AppEmpty),
          },
          {
            path: "payout/:id/:vault/:mode",
            element: withSuspense(Payment),
          },
        ],
      },
    ],
    errorElement: <PageError />,
  },
];

export default RoutesConfig;
