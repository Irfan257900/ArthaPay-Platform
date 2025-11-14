import React, { lazy } from "react";
import { Outlet } from "react-router";
import ProtectedRoute from "../../core/layout/protected.route.jsx";
import PageError from "../../core/layout/pageError.jsx";
import withSuspense from "../../core/shared/withSuspense.jsx";

// Lazy-loaded components
const Referrals = lazy(() => import("./index.jsx"));
const Fees = lazy(() => import("./fees.jsx"));
const ViewReferrals = lazy(() => import("./details.jsx"));


const RoutesConfig = [
  {
    path: "referrals",
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(Referrals),
      },
      {
        path: "referrer/:refno/:member/:refid",
        element: withSuspense(ViewReferrals),
      },
      {
        path: "fees",
        element: withSuspense(Fees),
      },
    ],
    errorElement: <PageError />,
  },
];

export default RoutesConfig;
