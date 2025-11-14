import React, { lazy } from "react";
import ProtectedRoute from "../../core/layout/protected.route.jsx";
import { Outlet } from "react-router";
import withSuspense from "../../core/shared/withSuspense.jsx";
import RightPanelFallback from "./crypto/rightpanel.fallback.jsx";

// Lazy-loaded components
const WalletsOutlet = lazy(() => import("./wallets.outlet.jsx"));
const WithdrawCryptoSummary = lazy(() => import("./crypto/summary.js"));
const WithdrawFiatSummary = lazy(() =>
  import("./fiat/withdraw.components/fiat.summary.jsx")
);
const Walletscrypto = lazy(() => import("../wallets/index"));
const WalletsLeftpannel = lazy(() => import("./crypto/vaults.rightpannel.jsx"));
const FiatLayout = lazy(() => import("../wallets/fiat/fiat.layout.jsx"));
const Fiat = lazy(() => import("../wallets/fiat/fiat.jsx"));
const FiatPayees = lazy(() =>
  import("./fiat/withdraw.components/fiatPayees.jsx")
);
const FiatSuccess = lazy(() =>
  import("./fiat/withdraw.components/fiat.success.jsx")
);
const Crypto = lazy(() => import("../wallets/crypto/index"));
const Payee = lazy(() => import("./crypto/payees.js"));
const Success = lazy(() => import("./crypto/success.js"));

const RoutesConfig = [
  {
    path: "wallets",
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ProtectedRoute>{withSuspense(WalletsOutlet)}</ProtectedRoute>,
      },
      {
        path: "crypto",
        element: <Walletscrypto />,
        children: [
          {
            index: true,
            element:<RightPanelFallback/>,
          },
          {
            path: ":actionType",
            element: (
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            ),
            children: [
              {
                index: true,
                element: <RightPanelFallback/>,
              },
              {
                path: ":code/:mrctid/:custid",
                element: (
                  <ProtectedRoute>
                    {withSuspense(WalletsLeftpannel)}
                  </ProtectedRoute>
                ),
                children: [
                  {
                    index: true,
                    element: (
                      <ProtectedRoute>{withSuspense(Crypto)}</ProtectedRoute>
                    ),
                  },
                  {
                    path: "selectedPayee/:network",
                    element: (
                      <ProtectedRoute>{withSuspense(Payee)}</ProtectedRoute>
                    ),
                  },
                  {
                    path: "summary",
                    element: (
                      <ProtectedRoute>
                        {withSuspense(WithdrawCryptoSummary)}
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: "success",
                    element: (
                      <ProtectedRoute>{withSuspense(Success)}</ProtectedRoute>
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "fiat",
        element: <FiatLayout />,
        children: [
          {
            path: ":actionType/:currency?",
            element: withSuspense(Fiat),
          },
          {
            path: ":actionType/:currency?/:currencyId?/selectedPayee/:mode",
            element: withSuspense(FiatPayees),
          },
          {
            path: ":actionType/:currency?/:currencyId?/summary",
            element: withSuspense(WithdrawFiatSummary),
          },
          {
            path: ":actionType/:currency?/:currencyId?/success",
            element: withSuspense(FiatSuccess),
          },
        ],
      },
    ],
  },
];

export default RoutesConfig;
