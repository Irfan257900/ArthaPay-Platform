import React, { lazy } from "react";
import PageError from "../layout/pageError.jsx";
import ProtectedRoute from "../layout/protected.route.jsx";
import withSuspense from "../shared/withSuspense.jsx";
import { Outlet } from "react-router";

// Lazy-loaded components
const UserProfile = lazy(() => import("./index.jsx"));
const ProfileInfo = lazy(() => import("./profile.details.jsx"));
const AllAddresses = lazy(() => import("./addresses.jsx"));
const ManageAddress = lazy(() => import("./address.manage.jsx"));
const Security = lazy(() => import("./security.component/security.jsx"));
const Kyc = lazy(() => import("../onboarding/kyc/index.jsx"));
const Kyb = lazy(() => import("../onboarding/kyb/index.jsx"));
const FeeDetails = lazy(() => import("./fees/fees.details.jsx"));
const MembershipsExplore = lazy(() => import("./fees/memberships.explore.jsx"));
const Memberships = lazy(() => import("./membership/index.jsx"));
const MembershipList = lazy(() => import("./membership/list.jsx"));
const Member = lazy(() => import("./membership/membership.jsx"));
const SetFees = lazy(() => import("./membership/setFees.jsx"));
const RewardRules = lazy(() => import("../profile/rewardrules/rewardrules.details.jsx"));
const RoutesConfig = [
  {
    path: "profile",
    element: <ProtectedRoute canIgnoreAccess={true}>{withSuspense(UserProfile)}</ProtectedRoute>,
    children: [
      {
        path: "details",
        element: <ProtectedRoute canIgnoreAccess={true}>{withSuspense(ProfileInfo)}</ProtectedRoute>,
      },
      {
        path: "addresses",
        element: <ProtectedRoute canIgnoreAccess={true}><Outlet/></ProtectedRoute>,
        children: [
          {
            index: true,
            element: <ProtectedRoute canIgnoreAccess={true}>{withSuspense(AllAddresses)}</ProtectedRoute>,
          },
          {
            path: ":id/:mode",
            element: <ProtectedRoute canIgnoreAccess={true}>{withSuspense(ManageAddress)}</ProtectedRoute>,
          },
        ],
      },
      {
        path: "security",
        element:<ProtectedRoute canIgnoreAccess={true}>{withSuspense(Security)}</ProtectedRoute>,
      },
      {
        path: "kyc",
        element: (
          <ProtectedRoute canIgnoreAccess={true}>
            {withSuspense(Kyc, { screen: "manageAccount" })}
          </ProtectedRoute>
        ),
      },
      {
        path: "kyb",
        element: (
          <ProtectedRoute canIgnoreAccess={true}>
            {withSuspense(Kyb, { screen: "manageAccount" })}
          </ProtectedRoute>
        ),
      },
      {
        path: "fees",
        element: <ProtectedRoute canIgnoreAccess={true}>{withSuspense(FeeDetails)}</ProtectedRoute>,
      },
      {
        path: "fees/memberships/explore",
        element: <ProtectedRoute canIgnoreAccess={true}>{withSuspense(MembershipsExplore)}</ProtectedRoute>,
      },
      {
        path: "fees/memberships/:membershipId?/:membershipName?/:canUpgrade?",
        element: withSuspense(FeeDetails),
      },
      {
        path: "memberships",
        element: <ProtectedRoute canIgnoreAccess={true}>{withSuspense(Memberships)}</ProtectedRoute>,
        children: [
          {
            index: true,
            element: <ProtectedRoute canIgnoreAccess={true}>{withSuspense(MembershipList)}</ProtectedRoute>,
          },
          {
            path: ":id/:name/:mode?",
            element:<ProtectedRoute canIgnoreAccess={true}>{withSuspense(Member)}</ProtectedRoute>,
          },
          {
            path: ":membershipId/:membershipName/feesetup",
            element: <ProtectedRoute canIgnoreAccess={true}>{withSuspense(SetFees)}</ProtectedRoute>,
          },
        ],
      },
      {
        path: "yourrewards",
        element:<ProtectedRoute canIgnoreAccess={true}>{withSuspense(RewardRules)}</ProtectedRoute>,
      },
    ],
    errorElement: <PageError />,
  },
];

export default RoutesConfig;
