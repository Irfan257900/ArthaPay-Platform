import React from "react";
import ProtectedRoute from "../../core/layout/protected.route";
import withSuspense from "../../core/shared/withSuspense";

const Notifications = React.lazy(() => import("../notifications/index"));

const RoutesConfig = [
  {
    path: "notifications",
    element: (
      <ProtectedRoute>
          {withSuspense(Notifications)}
      </ProtectedRoute>
    ),
  },
];

export default RoutesConfig;
