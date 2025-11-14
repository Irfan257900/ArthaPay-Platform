import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router";
import rewardsrule from "../../../assets/images/mysteryboxes.png";
import { getRewardRules } from "../http.services";
import { useSelector } from "react-redux";
import RewardsDashboardHomeLoader from "../../skeleton/rewards.loader/rewards.home.loader";
import AppAlert from "../../shared/appAlert";

const formatEarnText = (rule) =>
  rule.FixedReward !== null
    ? `Earn ${rule.FixedReward} ${rule.RewardCurrencyCode}`
    : `Earn ${rule.RewardPercentage}% ${rule.RewardCurrencyCode}`;

  const getIcon = (type) => {
      const iconMap = {
        cardpurchase: "icon cardpurchase",
        upgrade: "icon upgrade",
        consume: "icon consume",
        topup: "icon topup",
        deposit: "icon rewardsdeposist",
        rewardsdeposit: "icon rewardsdeposit",
        withdraw: "icon withdraw"
      };
    
      const iconClass = iconMap[type?.toLowerCase()] || "icon default-icon";
    
      return (
        <div className="w-12 h-12 rounded-lg flex justify-center items-center bg-rewardsBtnBg">
          <span className={iconClass} />
        </div>
      );
    };

const RewardRulesDetails = () => {
  const navigate = useNavigate();

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userDetails = useSelector((state) => state.userConfig?.details);
  const customerId = userDetails?.id;

  const { baseBreadCrumb, setBreadCrumb } = useOutletContext();

  const getRouteForType = (type) => {
    const triggerEvent = type?.toLowerCase();
    switch (triggerEvent) {
      case "topup":
        return "/cards/mycards";
      case "deposit":
        return "/wallets/crypto/deposit";
      case "upgrade":
        return "/profile/fees";
      case "withdraw":
        return "/wallets/fiat/withdraw";
      case "cardpurchase":
        return "/cards/apply";
      case "consume":
        return "/cards/mycards";
      default:
        return "/profile/rewardRules";
    }
  };

  const fetchCardTransactions = useCallback(async () => {
    try {
      await getRewardRules(customerId, setLoading, setRules, setError);
    } catch (err) {
      setError(err);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCardTransactions();
  }, [fetchCardTransactions]);

  useEffect(() => {
    setBreadCrumb([...baseBreadCrumb, { id: "5", title: "Your Rewards" }]);
  }, [baseBreadCrumb, setBreadCrumb]);

  const viewModel = useMemo(
    () =>
      rules.map((rule) => ({
        id: rule.Id,
        route: getRouteForType(rule.FinanceTxType),
        icon: getIcon(rule.FinanceTxType),
        financeType: rule.FinanceTxType,
        isActive: rule.IsActive,
        tierPoints: rule.AwardedTierPoints,
        earnText: formatEarnText(rule),
        description: rule.Description,
        updatedBy: rule.ModifiedBy,
        updatedAt: new Date(rule.ModifiedDate).toLocaleDateString(),
      })),
    [rules]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <RewardsDashboardHomeLoader/>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="w-full flex-1   px-2 md:px-0">
        {!loading && error && (
          <div className='error-message-box'>
            <AppAlert
              type="error"
              description={error}
              closable={true}
              showIcon
            />
          </div>
        )}
      </div>
      {/* Header */}
      <div className="text-center mb-5 kpicardbg">
        <div className="mb-2">
          <img src={rewardsrule} alt="" className="w-20 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2 text-lightWhite">
          Rewards Rules
        </h1>
        <p className="text-paraColor mt-2">
          Learn how to earn XP, progress through tiers, and claim exciting
          rewards.
        </p>

        {/* meta pills */}
        <div className="flex flex-wrap gap-4 justify-center items-center p-6 rounded-lg">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rewardsBtnBg text-subTextColor text-sm">
            <span className="icon active-rewards" />
            <span>{viewModel?.length} Active Rewards</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rewardsBtnBg text-subTextColor text-sm">
            <span className="icon tier-points" />
            <span>
              Up to{" "}
              {viewModel.reduce(
                (sum, r) => sum + Number(r.tierPoints || 0),
                0
              )}{" "}
              Tier Points
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rewardsBtnBg text-subTextColor text-sm">
            <span className="icon usdt-rewards" />
            <span>USDT Rewards</span>
          </div>
        </div>
      </div>

      {/* section header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-subTextColor font-semibold text-lg">
            Available Rewards
          </h2>
          <p className="text-sm text-paraColor">
            Start earning rewards with every transaction
          </p>
        </div>
        <div className="px-3 py-1 text-sm text-subTextColor bg-rewardsBtnBg border border-StrokeColor rounded-full">
          {viewModel?.length} Active Rules
        </div>
      </div>

      {/* grid of clickable cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {viewModel.map((rule) => (
          <div
            key={rule.id}
            onClick={() => navigate(rule.route)}
            className="kpicardbg rounded-xl shadow-md p-6 transition duration-200 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
          >
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
              {rule.icon}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p>
                    <span>{rule.financeType}</span>
                    <span className="!block">
                      {rule.isActive && (
                        <span className="text-[10px] text-subTextColor px-1.5 py-0.5 bg-rewardsBtnBg rounded-3xl">
                          ⭐ Active
                        </span>
                      )}
                    </span>
                  </p>
                  <span className="text-right">
                    <span className="text-paraColor text-xs !block">
                      Tier Points
                    </span>
                    <span className="text-textSubmit text-xl font-semibold">
                      {rule.tierPoints}
                    </span>
                  </span>
                </div>
              </div>
            </h2>

            <h3 className="text-textGreen text-lg font-medium">
              {rule.earnText}
            </h3>

            <div className="flex justify-between items-center text-xs text-paraColor mt-5">
              <p>Last updated by {rule.updatedBy}</p>
              <p>{rule.updatedAt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardRulesDetails;
