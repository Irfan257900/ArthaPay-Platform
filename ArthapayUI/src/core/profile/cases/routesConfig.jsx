import React, { lazy } from "react";
import { Outlet } from "react-router";
import ProtectedRoute from "../../layout/protected.route.jsx";
import PageError from "../../layout/pageError.jsx";
import withSuspense from "../../shared/withSuspense.jsx";

const CasesList = lazy(() => import("./list.jsx"));
const Case = lazy(() => import("./case.jsx"));

const RoutesConfig = [
  {
    path: "support",
    element: (
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(CasesList),
      },
      {
        path: ":id/:caseNumber?",
        element: withSuspense(Case),
      },
    ],
    errorElement: <PageError />,
  },
];

export default RoutesConfig;
