import React, { lazy } from "react";
import ProtectedRoute from "../layout/protected.route.jsx";
import PageError from "../layout/pageError.jsx";
import { Outlet } from "react-router";
import withSuspense from "../shared/withSuspense.jsx";
const Transactions = lazy(() => import("./index.jsx"));
const RoutesConfigs = [
  {
    path: "transactions",
    element: (
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(Transactions),
      },
    ],
    errorElement: <PageError />,
  },
];

export default RoutesConfigs;
