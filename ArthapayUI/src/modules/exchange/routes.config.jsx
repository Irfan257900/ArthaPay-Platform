import React, { lazy } from "react";
import ProtectedRoute from "../../core/layout/protected.route.jsx";
import PageError from "../../core/layout/pageError.jsx";
import withSuspense from "../../core/shared/withSuspense.jsx";

// Lazy-loaded components
const Exchange = lazy(() => import("./index.jsx"));
const Dashboard = lazy(() => import("./layout.jsx"));
const BuyLayout = lazy(() => import("./buy/layout.jsx"));
const BuyFallback = lazy(() => import("./buy/buy.fallback.jsx"));
const BuyComponent = lazy(() =>
  import("./buy/layout.jsx").then((module) => ({
    default: module.BuyWithNavigation,
  }))
);
const BuySummary = lazy(() =>
  import("./buy/layout.jsx").then((module) => ({
    default: module.SummaryWithNavigation,
  }))
);
const BuySuccess = lazy(() =>
  import("./buy/layout.jsx").then((module) => ({
    default: module.SuccessWithNavigation,
  }))
);
const SellComponent = lazy(() =>
  import("./sell/layout.jsx").then((module) => ({
    default: module.SellWithNavigation,
  }))
);
const SellSummary = lazy(() =>
  import("./sell/layout.jsx").then((module) => ({
    default: module.SummaryWithNavigation,
  }))
);
const SellSuccess = lazy(() =>
  import("./sell/layout.jsx").then((module) => ({
    default: module.SuccessWithNavigation,
  }))
);
const SellLayout = lazy(() => import("./sell/layout.jsx"));
const SellFallback = lazy(() => import("./sell/sell.fallback.jsx"));

const RoutesConfig = [
  {
    path: "exchange",
    element: (
      <ProtectedRoute>
        <Exchange />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(Dashboard),
      },
      {
        path: "buy",
        element: withSuspense(BuyLayout),
        children: [
          {
            index: true,
            element: withSuspense(BuyFallback),
          },
          {
            path: ":coinToBuy",
            element: (
              <ProtectedRoute>
                <BuyComponent />
              </ProtectedRoute>
            ),
          },
          {
            path: ":coinToBuy/summary/:isCrypto",
            element: (
              <ProtectedRoute>
                <BuySummary />
              </ProtectedRoute>
            ),
          },
          {
            path: ":coinToBuy/success",
            element: (
              <ProtectedRoute>
                <BuySuccess />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: "sell",
        element: withSuspense(SellLayout),
        children: [
          {
            index: true,
            element: withSuspense(SellFallback),
          },
          {
            path: ":coinToSell",
            element: (
              <ProtectedRoute>
                <SellComponent />
              </ProtectedRoute>
            ),
          },
          {
            path: ":coinToSell/summary/:isCrypto",
            element: (
              <ProtectedRoute>
                <SellSummary />
              </ProtectedRoute>
            ),
          },
          {
            path: ":coinToSell/success",
            element: (
              <ProtectedRoute>
                <SellSuccess />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
    errorElement: <PageError />,
  },
];

export default RoutesConfig;
