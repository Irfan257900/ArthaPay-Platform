import React, { lazy } from "react";
import ProtectedRoute from "../../core/layout/protected.route";
import PageError from "../../core/layout/pageError";
import withSuspense from "../../core/shared/withSuspense";

// Lazy-loaded components
const Dashboard = lazy(() => import("./layout.jsx"));
const Cards = lazy(() => import("./index.jsx"));
const Overview = lazy(() => import("./overview/index.jsx"));
const CardsdetailView = lazy(() => import("./mycards"));
const ApplyCards = lazy(() => import("./apply/index"));
const ApplyCardInfo = lazy(() => import("./apply/card.details"));
const AllAddresses = lazy(() => import("./apply/allAddresses"));
const AddAddress = lazy(() => import("./apply/addAddress"));
const MySteps = lazy(() => import("./apply/apply.steps"));
const MyCards = lazy(() => import("./mycards/index.jsx"));
const QuickLink = lazy(() => import("./quickLink.component"));
const QuickLinkSteps = lazy(() => import("./quickLink.component/processsteps"));


const RoutesConfig = [
  {
    path: "cards",
    element: (
        <ProtectedRoute>
          <Cards/>
        </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(Dashboard),
      },
      {
        path: "overview",
        element: withSuspense(Overview),
      },
      {
        path: "cardsdetailview/:id/:screenType",
        element: withSuspense(CardsdetailView),
      },
      {
        path: "bindcard",
        element: withSuspense(QuickLink),
      },
      // Duplicate paths below: ensure these are intentional.
      {
        path: "processsteps/:cardId",
        element: withSuspense(MySteps),
      },
      {
        path: "processsteps/:cardId",
        element: withSuspense(QuickLinkSteps),
      },
      {
        path: "mycards",
        element: withSuspense(MyCards),
      },
      {
        path: "mycards/:tabName",
        element: withSuspense(MyCards),
        children:[
          {
            path: ":cardId",
            element: withSuspense(MyCards),
          },
          {
            path: ":cardId/:productId/:action",
            element: withSuspense(MyCards),
          },
        ]
      },
      {
        path: "apply",
        element: withSuspense(ApplyCards),
        children: [
          {
            path: ":cardId",
            element: withSuspense(ApplyCardInfo),
          },
          {
            path: ":cardId/steps",
            element: withSuspense(MySteps),
          },
          {
            path: ":cardId/address",
            element: withSuspense(AllAddresses),
          },
          {
            path: ":cardId/addAddress/:addressId/:mode",
            element: withSuspense(AddAddress),
          },
        ],
      },
    ],
    errorElement: <PageError />,
  },
];

export default RoutesConfig;
