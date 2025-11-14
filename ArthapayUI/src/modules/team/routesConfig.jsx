import { lazy } from "react";
import { Outlet } from "react-router";
import ProtectedRoute from "../../core/layout/protected.route.jsx";
import PageError from "../../core/layout/pageError.jsx";
import withSuspense from "../../core/shared/withSuspense.jsx";

// Lazy-loaded components
const Team = lazy(() => import("./index"));
const InviteMember = lazy(() => import("./invite.jsx"));
const Member = lazy(() => import("./member"));
const MemberProfile = lazy(() => import("./member/profile.jsx"));
const MemberCards = lazy(() => import("./member/cards.jsx"));
const MemberCard = lazy(() => import("./member/card.jsx"));
const MemberTransactions = lazy(() => import("./member/transactions.jsx"));
const MemberCardHistory = lazy(() => import("./member/card.history.jsx"));
const MemberCardTransactions = lazy(() =>
  import("./member/card.tranasaction.jsx")
);

const RoutesConfig = [
  {
    path: "settings/team",
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(Team),
      },
      {
        path: "invite",
        element: withSuspense(InviteMember),
      },
      {
        path: "member/:memberId/:refId",
        element: withSuspense(Member),
        children: [
          {
            path: "profile",
            element: withSuspense(MemberProfile),
          },
          {
            path: "cards",
            element: withSuspense(MemberCards),
          },
          {
            path: "transactions",
            element: withSuspense(MemberTransactions),
          },
          {
            path: "cards/:cardId/:cardName",
            element: withSuspense(MemberCard),
            children: [
              {
                path: "history",
                element: withSuspense(MemberCardHistory),
              },
              {
                path: "transactions",
                element: withSuspense(MemberCardTransactions),
              },
            ],
          },
        ],
      },
    ],
    errorElement: <PageError />,
  },
];

export default RoutesConfig;
