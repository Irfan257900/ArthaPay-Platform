import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Alert, Spin } from "antd";
import AppEmpty from "../../core/shared/appEmpty";
import { loyaltyAppClientMethods } from "../../core/http.clients";
import CustomButton from "../../core/button/button";
import rewardsImg from '../../../src/assets/images/rewardsbox.png';
import rewardsopenBox from '../../../src/assets/images/mysterybox.png';
import MysteryBoxLoader from "../../core/skeleton/rewards.loader/mystreyBox.loader";
import QuestTransactions from "./quests/quest.transactions";
import { NumericFormat } from "react-number-format";

const MysteryBox = ({rewardData,isLocked,onOpen}) => {
  const mystaryBoxOpenHandler=useCallback(()=>{
    if(!isLocked){
      onOpen(rewardData?.id)
    }
  },[onOpen,rewardData,isLocked])
  return(
  <div className="kpicardbg shadow-lg p-6 flex flex-col items-center relative">
    <div className="mb-4 !relative">
     <div  className="">
       <img src={rewardsImg} alt="" />
     </div>
    </div>
    <div className="text-lg font-semibold text-subTextColor">{rewardData?.mysteryBoxRewardName}</div>
    <div className="text-sm text-paraColor font-medium mb-4">{rewardData?.status}</div>
    {rewardData?.rewardEarned && (() => {
      const [amountStr, currencyCode] = rewardData.rewardEarned.split(" ");
      const amount = parseFloat(amountStr);

      return (
        <div className="text-sm text-paraColor font-medium mb-4">
          You have earned{" "}
          <span className="text-sm text-paraColor font-medium mb-4">
            <NumericFormat
              value={amount}
              thousandSeparator={true}
              displayType="text"
            />{" "}
            {currencyCode}
          </span>
        </div>
      );
    })()}

    <div className="my-4 w-full text-center">
      <CustomButton
      type="primary"
      className="w-auto"
      disabled={isLocked}
      onClick={mystaryBoxOpenHandler}
    >
      {isLocked ? "Locked" : "Tap To Open Box"}
    </CustomButton>
    </div>
  </div>
)};

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-96">
    <Spin size="large" tip="Opening your box..." />
    <div className="mt-4 text-paraColor">Please wait while we open your box...</div>
  </div>
);

const RewardScreen = ({ xp, rarity, onClose }) => (
  <div className="flex flex-col items-center justify-center h-96 w-96 mx-auto border border-StrokeColor rounded-5 kpicardbg">
    <div className="text-6xl mb-4" role="img" aria-label="Reward">
      <img src={rewardsopenBox} alt="" />
    </div>
    <div className="text-2xl font-bold text-paraColor mb-2">Congratulations!</div>
    <div className="text-lg text-subTextColor mb-2">
      You have earned <span className="font-bold text-textPending">
        <NumericFormat
            value={xp}
            thousandSeparator={true}
            displayType="text"
          />{" "}
        {rarity} </span>
    </div>
    <CustomButton type="primary" onClick={onClose}>
      Collect Prize
    </CustomButton>
  </div>
);

const boxTypes = [
  { type: "Common", rarity: "Common" },
  { type: "Rare", rarity: "Rare" },
  { type: "Epic", rarity: "Epic" },
  { type: "Legendary", rarity: "Legendary" },
];

const RewardsBox = () => {
  const [screen, setScreen] = useState("main");
  const [reward, setReward] = useState();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const customerId = useSelector((state) => state.userConfig?.details?.id); // <-- fix here

  useEffect(() => {
    fetchBoxes();
  }, []);
  const fetchBoxes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await loyaltyAppClientMethods.get(`loyalty/mystery-boxes/${customerId}`, "");

      const data = res || []
      setBoxes(data);

    } catch (err) {
      setError(err.message || "Failed to fetch mystery boxes.");
    } finally {
      setLoading(false);
    }
  };
  const handleOpen = async (boxId) => {
    setScreen("loading");
    try {
      const res = await loyaltyAppClientMethods.post(`loyalty/mystery-boxes/${boxId}/open/${customerId}`,{},'');  
      if (res) {
        const rewardData = {
          xp: res?.amount || 0,
          rarity: res?.currencyCode || "Unknown",
          ...res
        };
        
        setReward(rewardData);
        setScreen("reward");
        fetchBoxes();
      } else {
        setError(res?.errors || "Failed to open mystery box");
      }
    } catch (err) {
      setError(err.message || "Failed to open mystery box.");
      setScreen("main");
    }
  };

  const handleCloseReward = useCallback(() => {
    setScreen("main");
  },[])

  const clearErrorMsg = useCallback(() => {
    setError("");
  },[])
  
  if (loading) {
    return (
      <div className="flex-1">
        <MysteryBoxLoader />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="alert-flex mb-24">
          <Alert
            type="error"
            description={error}
            onClose={clearErrorMsg}
            showIcon
          />
          <span
            className="icon sm alert-close c-pointer"
          onClick={clearErrorMsg }
          ></span>
        </div>
        <div className="flex flex-col items-center justify-center h-96">
          <AppEmpty description="No Data" />
        </div>
      </>

    );
  }
  if (!boxes || boxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AppEmpty description="No Data" />
      </div>
    );
  }
  if (screen === "loading") return <LoadingScreen />;
  if (screen === "reward")
    return (
      <RewardScreen
        xp={reward.amount}
        rarity={reward.rarity}
        onClose={handleCloseReward}
      />
    );

  // Map API data to box props (assumes order matches boxTypes)
  // If your API provides more info, update this mapping accordingly
  const boxProps = boxes.map((box) => {
    const apiBox = box || {};
    return {
      ...box,
      isLocked: apiBox.status?.toLowerCase() === "opened",
      notification: apiBox.rewardEarned ? "1" : undefined,
      onOpen: handleOpen,
    };
  });

  return (
    <div className="w-full">
      <div className="text-start mb-8">
        <h1 className="text-2xl font-bold text-subTextColor">Mystery Boxes</h1>
        <p className="text-paraColor text-sm">
          Choose a box to reveal your prize
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {boxProps.map((props) => (
          <MysteryBox key={props?.id} rewardData={props} isLocked={props?.isLocked} notification={props?.notification} onOpen={props?.onOpen} />
        ))}
      </div>
      <div className="mt-4 kpicardbg">
         <QuestTransactions screenName={'MysteryBox'} />
    </div>
    </div>
  );
};

export default RewardsBox;