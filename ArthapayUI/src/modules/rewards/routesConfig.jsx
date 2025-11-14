import React, { lazy, Suspense } from "react";
import { Outlet } from "react-router";
import PageError from "../../core/layout/pageError.jsx";
import withSuspense from "../../core/shared/withSuspense.jsx";

const Rewards = lazy(() => import("./index.jsx"));
const HomeTab = lazy(() => import("./home.jsx"));
const QuestsTab = lazy(() => import("./quests/quests.jsx"));
const TrophiesTab = lazy(() => import("./trophies.jsx"));
const RewardsTab = lazy(() => import("./rewards.box.jsx"));


const AvailableQuests = lazy(() => import("./quests/available.quests.jsx"));
const InProgressQuests = lazy(() => import("./quests/inprogress.quests.jsx"));
const CompletedQuests = lazy(() => import("./quests/completed.quests.jsx"));
const QuestDetail = lazy(() => import("./quests/questDetailScreen.jsx"));

const RoutesConfig = [
  {
    path: "rewards",
    element: (
      <Suspense fallback={PageError}>
        <Outlet />
      </Suspense>
    ),
    errorElement: <PageError />,
    children: [
      {
        path: "",
        element: withSuspense(Rewards),
        errorElement: <PageError />,
        children: [
          {
            index: true,
            element: withSuspense(HomeTab),
          },
          {
            path: "quests",
            element: withSuspense(QuestsTab),
            children: [
              {
                path: "available",
                element: withSuspense(AvailableQuests),
              },
              {
                path: "inprogress",
                element: withSuspense(InProgressQuests),
              },
              {
                path: "completed",
                element: withSuspense(CompletedQuests),
              },
              {
                path: "inprogress/:questId",
                element: withSuspense(QuestDetail),
              },
              {
                path: "available/:questId",
                element: withSuspense(QuestDetail),
              },
              {
                path: "completed/:questId",
                element: withSuspense(QuestDetail),
              },
            ],
          },
          {
            path: "trophies",
            element: withSuspense(TrophiesTab),
          },
          {
            path: "mysteryboxes",
            element: withSuspense(RewardsTab),
          },
        ],
      },
    ],
  },
];

export default RoutesConfig;