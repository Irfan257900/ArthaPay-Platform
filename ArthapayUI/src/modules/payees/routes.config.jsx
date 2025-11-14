import React, { lazy } from "react";
import { Outlet, useParams } from "react-router";
import ProtectedRoute from "../../core/layout/protected.route.jsx";
import PageError from "../../core/layout/pageError.jsx";
import Success from "./success.jsx";
import withSuspense from "../../core/shared/withSuspense.jsx";

// Lazy-loaded components
const Payees=lazy(()=>import("./index.jsx"))
const FiatPayee = lazy(() => import("./fiat/index.jsx"));
const CryptoPayee = lazy(() => import("./crypto/index.jsx"));

const PayeeWrapper = () => {
  const { type } = useParams();
  return (
    withSuspense(type === "crypto" ? CryptoPayee : FiatPayee)
  );
};

const RoutesConfig = [
  {
    path: "payees",
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(Payees),
      },
      {
        path: ":type?",
        element: (
          <ProtectedRoute>
            <Payees />
          </ProtectedRoute>
        ),
        children: [
          {
            path: ":id?/:name?/:mode?/:step?",
            element: (
              <ProtectedRoute>
                <PayeeWrapper />
              </ProtectedRoute>
            ),
          },
          {
            path: ":id?/:name?/:mode?/:step",
            element: (
              <ProtectedRoute>
                <Success />
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
