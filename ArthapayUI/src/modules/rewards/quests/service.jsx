import { Badge } from "antd";
import { NumericFormat } from "react-number-format";

const getRewardLabel = (key) => {
  if (key === 'rewardXP') {
    return 'Experience Points';
  } else if (key === 'rewardAmount') {
    return 'Reward Amount';
  }
  return 'Reward';
};

const getRewardBackgroundColor = (key) => {
  if (key === 'rewardXP') {
    return '#08cef1ff';
  } else if (key === 'rewardAmount') {
    return '#a78bfa';
  }
  return '#a78bfa';
};

export const QuestRewardDisplay = ({ quest }) => {
  // Prepare rewards from object keys
  const rewards = [];
  if (quest.rewardXP) {
    rewards.push({
      key: 'rewardXP',
      value: `${quest.rewardXP} XP`
    });
  }
  if (quest.rewardAmount && quest.rewardCurrencyCode) {
    rewards.push({
      key: 'rewardAmount',
      value: `${quest.rewardAmount?.toLocaleString()} ${quest.rewardCurrencyCode}`
    });
  }

  return (
    <>
      {rewards.map((reward) => (
        <div
          key={reward.key}
          className={`flex items-center justify-between p-3 rounded-5 !mb-4 bg-rewardsBtnBg`}
        >
          <span
            className={`font-medium text-lightWhite`}
          >
            {getRewardLabel(reward.key)}
          </span>
          <Badge
            count={reward.value}
            style={{ backgroundColor: getRewardBackgroundColor(reward.key) }}
          />
        </div>
      ))}
      {quest.mysteryBoxRewardName && <div  className={`flex items-center justify-between p-3 rounded-5 !mb-4 bg-rewardsBtnBg`}>
        {"Mystery Box"}
      <p className="px-2 bg-orangeBg rounded-3xl"><span className=' icon rewards-box-icon !mr-1'></span><span className="text-xs">{"Surprise Box"}</span></p>
      </div>}
       {quest?.rewardTierPoints && <div  className={`flex items-center justify-between p-3 rounded-5 !mb-4 bg-rewardsBtnBg`}>
        {"Tier Points"}
      <p className="px-2 bg-questGreenBg rounded-3xl"><span className='!mr-1'></span><span className="text-xs">
          {<NumericFormat
            value={`${(quest?.rewardTierPoints)}`}
            thousandSeparator={true} displayType={"text"} />}{" "}
         TP</span></p>
      </div>}
    </>
  );
};