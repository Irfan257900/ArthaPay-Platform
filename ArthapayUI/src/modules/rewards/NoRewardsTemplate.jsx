import React from "react";
import {
  Gift,
  CreditCard,
  DollarSign,
  Users,
  ChevronRight,
  Coins,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NoRewardsTemplate = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-5 ">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center">
          <Gift className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-primaryColor">
          Welcome to Artha Rewards!
        </h1>
        <p className="mt-2 text-sm md:text-base text-paraColor">
          Your journey to exclusive perks starts now. Here's how to begin earning rewards and climbing the tiers.
        </p>
      </div>

      {/* Tier Card */}
      <div className="kpicardbg border border-StrokeColor rounded-5 p-6 items-center">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-paraColor">Your Current Tier</p>
            <p className="text-base font-medium">Starting your rewards journey</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-sm">Bronze Tier</span>
              <span className="text-sm text-paraColor">Base reward rate: 1.0x</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">0 TP</p>
            <p className="text-sm text-paraColor">Just getting started!</p>
          </div>
        </div>
        <div className="mt-4 bg-tabsBg  text-subTextColor p-3 rounded-lg text-sm">
          <strong>Next Milestone:</strong> Start earning TP to reach <strong>Silver Tier</strong> and unlock a <span className="underline cursor-pointer">1.25x reward multiplier</span>!
        </div>
      </div>

      {/* Earning Options */}
      <div className="kpicardbg border border-StrokeColor rounded-5 p-6 items-center space-y-4">
        <h3 className="text-lg font-semibold text-subTextColor">Start Earning Rewards Today</h3>
        <p className="text-sm text-paraColor">Take these actions to earn your first rewards and TP points</p>

        {/* Card Purchase */}
        <div
          className="flex justify-between items-center border dark:border-green-800 border-green-200 bg-green-50 dark:bg-green-950 p-4 rounded-md cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 transition"
          onClick={() => navigate("/cards/apply")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10  bg-green-200 dark:bg-green-600 text-green-700 dark:text-white rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Make a Card Purchase</p>
              <p className="text-sm text-green-700 dark:text-green-200">
                Earn <span className="font-semibold text-textGreen">1.5% cashback in USDT</span> + <span className="font-semibold text-primaryColor">10 TP</span> on every purchase
              </p>
              <span className="text-xs mt-1 inline-block bg-green-300 dark:bg-green-800 text-green-800 dark:text-green-400 px-2 py-0.5 rounded">Instant Rewards</span>
            </div>
          </div>
          <ChevronRight className="text-gray-400 dark:text-white" />
        </div>

        {/* First Deposit */}
        <div
          className="flex justify-between items-center border dark:border-blue-800 border-blue-200 bg-blue-50 dark:bg-blue-950 p-4 rounded-md cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition"
          onClick={() => navigate("/wallets/crypto/deposit")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-200 dark:bg-blue-600 text-blue-700 dark:text-white rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Make Your First Deposit</p>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Get a special bonus of <span className="font-semibold text-primaryColor">1.00 USDT</span> + <span className="font-semibold text-primaryColor">20 TP</span> on your first deposit
              </p>
              <span className="text-xs mt-1 inline-block bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">One-time Bonus</span>
            </div>
          </div>
          <ChevronRight className="text-gray-400 dark:text-white" />
        </div>

        {/* Refer a Friend */}
        <div
          className="flex justify-between items-center border dark:border-purple-800 border-purple-200 bg-purple-50 dark:bg-purple-950 p-4 rounded-md cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900 transition"
          onClick={() => navigate("/referrals")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-200 dark:bg-purple-600 text-purple-700 dark:text-white rounded-full flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Refer a Friend</p>
              <p className="text-sm text-purple-700 dark:text-purple-200">
                Earn bonuses when your friends make transactions and help them discover great rewards
              </p>
              <span className="text-xs mt-1 inline-block bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">Recurring Rewards</span>
            </div>
          </div>
          <ChevronRight className="text-gray-400 dark:text-white" />
        </div>
      </div>

      {/* Challenge Section */}
      <div className="kpicardbg border border-StrokeColor rounded-5 p-6 items-center text-center">
        <div className="w-10 h-10 mx-auto mb-3 bg-rewardsBtnBg rounded-full flex items-center justify-center">
          <Coins className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-semibold">Ready for a Challenge?</h3>
        <p className="text-sm mt-1 text-paraColor">Quests offer bigger rewards for completing specific tasks. Take on challenges and earn exclusive bonuses!</p>
        <button
          onClick={() => navigate("/rewards/quests/available")}
          className="mt-4 bg-rewardsBtnBg rounded-5 px-4 py-2 transition"
        >
          Explore Available Quests →
        </button>
      </div>
    </div>
  );
};

export default NoRewardsTemplate;
