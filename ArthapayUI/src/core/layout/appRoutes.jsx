import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router";
import PlainLoader from "../shared/loaders/plain.loader";
import PageError from "./pageError";


const AppLayout = React.lazy(() => import("."));
const CallbackHandler = React.lazy(() => import("../authentication/callback.handler"));
const SilentSignIn = React.lazy(() => import("../authentication/silentSignIn"));
const Relogin = React.lazy(() => import("../authentication/relogin"));
const NotFound = React.lazy(() => import("./notFound"));
const ProtectedRoute = React.lazy(() => import("./protected.route"));
const AccessDenied = React.lazy(() => import("./accessDenied.jsx"));
const Dashboard = React.lazy(() => import("../dashboard/dashboard"));
const MarketHighlights = React.lazy(() => import("../dashboard/market"));
const MarketDeatils = React.lazy(() => import("../dashboard/market.details.jsx"));
const Kyc = React.lazy(() => import("../onboarding/kyc"));
const Kyb = React.lazy(() => import("../onboarding/kyb"));

import ProfileRoutes from "../profile/routesConfig.jsx";
import CardsRoutes from "../../modules/cards/routesConfig";
import PaymentsRoutes from "../../modules/payments/routesConfig";
import VaultsRoutes from "../../modules/wallets/routesConfig";
import ExchangeRoutes from "../../modules/exchange/routes.config";
import TeamRoutes from "../../modules/team/routesConfig";
import ReferralsRoutes from "../../modules/referrals/routesConfig";
import PayeesRoutes from "../../modules/payees/routes.config.jsx";
import NotificationsRoutes from "../../modules/notifications/routesConfig";
import BanksRoutes from "../../modules/banks/routes.config";
import SupportRoutes from "../profile/cases/routesConfig.jsx";
import TransactionsRoutes from "../transactions/routes.config.jsx";
import RewardsRoutes from "../../modules/rewards/routesConfig.jsx";
import NoAccess from "./noAccess.jsx";

const additionalModuleRoutes = [
  ...CardsRoutes,
  ...PaymentsRoutes,
  ...VaultsRoutes,
  ...ExchangeRoutes,
  ...TeamRoutes,
  ...ReferralsRoutes,
  ...PayeesRoutes,
  ...NotificationsRoutes,
  ...BanksRoutes,
  ...SupportRoutes,
  ...TransactionsRoutes,
  ...RewardsRoutes,
];

const AppRoutes = createBrowserRouter([
  {
    path: "/callback",
    element: (
      <Suspense fallback={<PlainLoader />}>
        <CallbackHandler />
      </Suspense>
    ),
    errorElement: <PageError />,
  },
  {
    path: "/silent_redirect",
    element: (
      <Suspense fallback={<PlainLoader />}>
        <SilentSignIn />
      </Suspense>
    ),
    errorElement: <PageError />,
  },
  {
    path: "/relogin",
    element: (
      <Suspense fallback={<PlainLoader />}>
        <Relogin />
      </Suspense>
    ),
    errorElement: <PageError />,
  },
  {
    path: "/",
    element: (
      <Suspense fallback={<PlainLoader />}>
        <AppLayout />
      </Suspense>
    ),
    errorElement: <PageError />,
    children: [
      {
        path: "access-denied",
        element: (
          <Suspense fallback={<PlainLoader />}>
            <AccessDenied />
          </Suspense>
        ),
      },
      {
        index: true,
        element: <PlainLoader />,
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<PlainLoader />}>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "dashboard/makethighlights",
        element: (
          <Suspense fallback={<PlainLoader />}>
            <ProtectedRoute>
              <MarketHighlights />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "dashboard/:coin/:id",
        element: (
          <Suspense fallback={<PlainLoader />}>
            <ProtectedRoute>
              <MarketDeatils />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "kyc",
        element: (
          <Suspense fallback={<PlainLoader />}>
            <ProtectedRoute canIgnoreAccess={true}>
            <Kyc showHeader={true} />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "kyb",
        element: (
          <Suspense fallback={<PlainLoader />}>
            <ProtectedRoute canIgnoreAccess={true}>
            <Kyb showHeader={true} />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      ...ProfileRoutes,
      ...additionalModuleRoutes,
      {
        path:'/noaccess',
        element:<NoAccess/>
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
])

export default AppRoutes;

// If needed, you can create a browser router instance like this:
// export const router = createBrowserRouter(routes);
