import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchDashboard } from "../../reducers/rewards.reducer";
import NoRewardsTemplate from "./NoRewardsTemplate";
import rewardsImg from "../../assets/images/rewards-img.png";
import { Badge } from "antd";
import RewardsDashboardHomeLoader from "../../core/skeleton/rewards.loader/rewards.home.loader";
import usdtCoin from "../../assets/images/usdt.png";
import xpCoin from "../../assets/images/xprewards.png";
import { fetchQuestList } from "../../reducers/quests.reducer";
import RedeemWalletModal from "./redeemwallet.model";
import QuestTransactions from "./quests/quest.transactions";
import AppAlert from "../../core/shared/appAlert";
import AppEmpty from "../../core/shared/appEmpty";
import { NumericFormat } from "react-number-format";

// --- Extracted Quest Card Component ---
const QuestCard = React.memo(({ quest, type, questDetails }) => {
  const rewardTierPoints = quest?.rewardTierPoints;
  const rewardAmount = quest?.rewardAmount;
  const rewardCurrencyCode = quest?.rewardCurrencyCode;
  const daysLeft = quest?.daysLeft;
  const buttonText = quest?.buttonText || "View Details";

  return (
    <div className="kpicardbg border border-StrokeColor rounded-5 p-6 items-center">
      <div>
        <div className="flex justify-between">
          <h4 className="font-medium text-lg text-lightWhite mb-2 w-64 break-words whitespace-pre-line">
            {quest?.questName || quest?.name}
          </h4>
          <div>
            {daysLeft !== undefined && (
              <span className="text-[10px] border border-primaryColor rounded-2xl px-2 py-0.5">
                {daysLeft} days left
              </span>
            )}
          </div>
        </div>
        <div className="text-sm text-paraColor mb-2">
          {quest?.questDescription || quest.description}
        </div>
        {quest && quest.steps && quest.steps[0] && (
          <div className="text-xs text-lightWhite font-medium mb-1">
            <span className="text-lightWhite font-medium">Progress :</span>{" "}
            {quest.steps[0].currentCount}/{quest.steps[0].targetCount}&mdash;{" "}
            {quest.steps[0].description}
          </div>
        )}
      </div>
      <div className="flex gap-3 items-center justify-between mt-4 mb-2">
        <div>
          <div className="lg:!flex xl:!block gap-3">
            <h5 className="text-sm font-semibold text-lightWhite">Rewards:</h5>
            <div className="flex items-center gap-2 custom-quest-badges">
              {rewardTierPoints && (
                <Badge
                  count={
                    <span className="flex items-center gap-1 greenBg">
                      <span className="icon rewards-tp-icon !mr-1"></span>
                      <span>
                        <NumericFormat
                          value={rewardTierPoints}
                          thousandSeparator={true}
                          displayType="text"
                        />{" "}
                        TP
                      </span>
                    </span>
                  }
                />
              )}
              {rewardAmount !== 0 && rewardCurrencyCode && (
                <Badge
                  count={
                    <span className="flex items-center gap-1 purpleBg">
                      <span
                        className={`icon ${
                          rewardCurrencyCode.toLowerCase() === "xp"
                            ? "rewards-xp-icon"
                            : "rewards-usdt-icon"
                        } !mr-1`}
                      ></span>
                      <span>
                        <NumericFormat
                          value={rewardAmount}
                          thousandSeparator={true}
                          displayType="text"
                        />{" "}
                        {rewardCurrencyCode}
                      </span>
                    </span>
                  }
                />
              )}
              {rewardCurrencyCode === "MYSTERY_BOX" && (
                <Badge
                  count={
                    <span className="flex items-center gap-1 orangeBg">
                      <span className="icon rewards-box-icon !mr-1"></span>
                      <span>Surprise Box</span>
                    </span>
                  }
                />
              )}
            </div>
          </div>
        </div>
        <div>
          <button
            className="w-full items-center text-primaryColor !border-none text-base font-medium"
            onClick={() => questDetails(type, quest)}
          >
            {buttonText} <span className="icon btn-arrow shrink-0 ml-1"></span>
          </button>
        </div>
      </div>
    </div>
  );
});

// --- Extracted Quest List Section Component ---
const QuestListSection = React.memo(({ title, quests, type, questDetails, navigate }) => (
  <>
    <div className="font-semibold flex justify-between items-center mt-5 mb-2">
      <span className="!text-2xl text-lightWhite font-semibold">{title}</span>
      <button
        onClick={() => navigate(`/rewards/quests/${type}`)}
        className="text-sm text-primaryColor border border-primaryColor px-3 py-1 rounded-5"
      >
        <span>See All</span>
        <span className="icon btn-arrow shrink-0 ml-2"></span>
      </button>
    </div>
    <div className="grid lg:grid-cols-1 grid-cols-1 gap-5">
      {Array.isArray(quests) && quests.length > 0 ? (
        quests.map((quest, idx) => (
          <QuestCard key={quest.questId || idx} quest={quest} type={type} questDetails={questDetails} />
        ))
      ) : (
        <div className="text-lightWhite text-base kpicardbg">
          <AppEmpty />
        </div>
      )}
    </div>
  </>
));

// --- Extracted Wallet Item Component ---
const WalletItem = React.memo(({ currency, balance }) => {
  let icon = null;
  if (currency === "USDT") {
    icon = <img src={usdtCoin} alt="usdt" className="w-6 h-6" />;
  } else if (currency.toLowerCase() === "xp") {
    icon = <img src={xpCoin} alt="xp" className="w-5 h-7" />;
  }

  const formattedBalance =
    currency.toLowerCase() === "xp"
      ? Number(balance).toLocaleString("en-IN", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : Number(balance).toLocaleString("en-IN", {
          minimumFractionDigits: 4,
          maximumFractionDigits: 4,
        });

  return (
    <div className="flex items-center justify-between dark:!bg-tabsBg !bg-menuhover rounded-5 border border-StrokeColor px-3 py-3 text-lightWhite mb-2">
      <div className="flex gap-2 items-center">
        {icon && <span>{icon}</span>}
        <span className="font-semibold text-base text-lightWhite">
          {currency}
        </span>
      </div>
      <span className="font-semibold text-base text-lightWhite">
        {formattedBalance}
      </span>
    </div>
  );
});

const HomeTab = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, data, error } = useSelector(
    (state) => state.rewards.dashboard
  );
  const user = useSelector((state) => state.userConfig?.details);
  const questList = useSelector((state) => state.quests?.questListData);
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboard());
    if (user?.id) {
      dispatch(fetchQuestList({ id: user.id }));
    }
  }, [dispatch, user?.id]);

  const questDetails = useCallback(
    (type, quest) => {
      navigate(`/rewards/quests/${type}/${quest?.questId || quest?.id}`, {
        state: {
          quest,
          status: type,
        },
      });
    },
    [navigate]
  );

  const handleRedeem = useCallback(() => {
    setRedeemModalVisible(false);
  }, []);

  const closeRedeemModalHandler = useCallback(() => {
    setRedeemModalVisible(false);
  }, []);

  const openRedeemModalHandler = useCallback(() => {
    setRedeemModalVisible(true);
  }, []);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center px-2 md:px-0">
        <RewardsDashboardHomeLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex-1 px-2 md:px-0">
        <div className="error-message-box">
          <AppAlert type="error" description={error} closable={true} showIcon />
        </div>
      </div>
    );
  }

  // Early return for empty data
  if (
    !data ||
    Object.keys(data).length === 0 ||
    (Array.isArray(data.balances) && data.balances.length === 0) &&
    (Array.isArray(data.activeQuests) && data.activeQuests.length === 0)
  ) {
    return <NoRewardsTemplate />;
  }

  const availableQuests = questList?.data.available ?? [];
  const completedQuests = questList?.data.completed ?? [];
  const activeQuests = questList?.data.inProgress ?? [];
  const balances = data.balances ?? [];
  const unopenedMysteryBoxes = data.unopenedMysteryBoxes ?? 0;

  const wallet = balances.reduce((acc, curr) => {
    acc[curr.currencyCode] = curr.balance;
    return acc;
  }, {});

  return (
    <div className="w-full flex flex-col items-center px-2 md:px-0">
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="col-span-1 md:col-span-2 ">
          <QuestListSection
            title="Active Quests"
            quests={activeQuests}
            type="inprogress"
            questDetails={questDetails}
            navigate={navigate}
          />

          <QuestListSection
            title="Available Quests"
            quests={availableQuests}
            type="available"
            questDetails={questDetails}
            navigate={navigate}
          />

          <QuestListSection
            title="Completed Quests"
            quests={completedQuests}
            type="completed"
            questDetails={questDetails}
            navigate={navigate}
          />
        </div>
        <div className="col-span-1">
          <div className="flex justify-between items-center mb-5">
            {Object.entries(wallet) && (
              <div className="!text-2xl text-lightWhite font-semibold">
                Rewards Wallet
              </div>
            )}
            <button
              className="text-sm text-primaryColor border border-primaryColor px-3 py-1 rounded-5"
              onClick={openRedeemModalHandler}
            >
              <span>Redeem</span>
            </button>
          </div>
          <div className="kpicardbg rounded-5 border border-StrokeColor p-6 flex flex-col gap-3">
            {Object.entries(wallet).map(([currency, balance]) => (
              <WalletItem key={currency} currency={currency} balance={balance} />
            ))}
          </div>

          {/* Mystery Boxes */}
          {Number(unopenedMysteryBoxes) > 0 && (
            <div className="mt-5  kpicardbg rounded-5 border border-StrokeColor p-6 gap-3">
              <div className="flex items-center justify-center">
                <div className="py-6">
                  <div className="gap-2 mb-4">
                    <img src={rewardsImg} alt="" className="mx-auto mb-4" />
                    <span className="font-semibold text-lightWhite text-lg">
                      Mystery Boxes Awaiting!
                    </span>
                  </div>
                  <div className="text-sm text-paraColor mb-2 text-center">
                    You have {unopenedMysteryBoxes} unopened boxes
                  </div>
                  <div className="text-center w-full py-4">
                    <button
                      className="w-full text-primaryColor font-semibold"
                      onClick={() => navigate("/rewards/mysteryboxes")}
                    >
                      <span>Tap to Open</span>
                      <span className="icon btn-arrow shrink-0 ml-2"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <RedeemWalletModal
          visible={redeemModalVisible}
          onClose={closeRedeemModalHandler}
          wallet={wallet}
          onRedeem={handleRedeem}
          userId={user?.id}
        />
      </div>
      <div className="mt-4 !w-full flex-1 kpicardbg">
        <QuestTransactions className="" screenName={"Rule"} />
      </div>
    </div>
  );
};

export default HomeTab;