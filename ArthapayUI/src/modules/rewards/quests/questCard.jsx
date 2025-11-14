import { Card, Badge } from 'antd';
import CustomButton from '../../../core/button/button';
import { NumericFormat } from 'react-number-format';
import { useCallback } from 'react';

const QuestCard = ({ quest, onSelect, status }) => {
  const path = window.location.pathname.split('/')[3];
  // Show first step progress if available
  const firstStep = quest?.steps && quest?.steps.length > 0 ? quest.steps[0] : null;
  const cardSelectHandler=useCallback(()=>{
    onSelect(quest)
  },[quest,onSelect])
  return (
    <Card
      className="kpicardbg !border !border-StrokeColor !p-0 !rounded-5"
      onClick={cardSelectHandler}
      bodyStyle={{ padding: 24 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-2">
           
            <h3 className="text-lg font-semibold text-lightWhite">{quest?.name || quest?.questName}</h3>
             {path === 'completed' && <div className='border border-primaryColor text-primaryColor rounded-2xl px-3 py-0.5 text-sx'>
              Completed
            </div>}
          </div>
          <p className="text-sm text-paraColor font-medium">{quest.questDescription || quest.description}</p>
          {firstStep && (
            <div className="text-xs text-paraColor font-normal mb-1 mt-4">
              <span className='text-lightWhite font-medium'>Progress :</span> {firstStep.currentCount}/{firstStep.targetCount} &mdash; {firstStep.description}
            </div>
          )}
        </div>
      </div>
      <div className="custom-quest-footer grid md:grid-cols-3 grid-cols-1 gap-2 lg:space-y-3 space-y-3 md:space-y-0">
        <div className="xl:col-span-2 lg:col-span-3 gap-4">
          <div className="">
            <h5 className='text-sm font-semibold text-lightWhite mb-2'>Rewards:</h5>
             <div className='flex  items-center gap-2 custom-quest-badges'>
               <Badge count={<span className='flex items-center gap-1 greenBg'><span className=' icon rewards-tp-icon !mr-1'></span>
               <span>{
                <NumericFormat
                  value={`${(quest?.rewardTierPoints)}`}
                  thousandSeparator={true} displayType={"text"} />
                  }{" "}TP</span>
                  </span>} />
              {(quest?.rewardAmount !== 0) &&<Badge count={<span className='flex items-center gap-1 purpleBg'><span className={` icon ${quest?.rewardCurrencyCode?.toLowerCase() === 'xp'  ? "rewards-xp-icon" : "rewards-usdt-icon"} !mr-1`}></span><span>
                {<NumericFormat
                  value={`${(quest?.rewardAmount)}`}
                  thousandSeparator={true} displayType={"text"} />}{" "}
                 {quest?.rewardCurrencyCode}</span></span>} />}
              {quest?.rewardCurrencyCode === "MYSTERY_BOX" && <Badge count={<span className='flex items-center gap-1 orangeBg'><span className=' icon rewards-box-icon !mr-1'></span><span>Surprise Box</span></span>} />}    
             </div>
          </div>
        </div>
       <div className='xl:col-span-1 lg:col-span-3 xl:text-end lg:text-start'>
          {( path !== 'available'&& path !== 'completed') ? (
            <div className="">
              <button
                className="w-full rounded-5 px-4 py-2 items-center text-primaryColor !border-none"
                onClick={() => navigate("/rewards/quests/inprogress")}
              >
                {quest.buttonText || "View Details"}{" "}
                <span className="icon btn-arrow shrink-0 ml-2"></span>
              </button>
            </div>
          ) : (
            (status !== 'completed' && <CustomButton
              type={status === 'completed' ? 'default' : 'primary'}
              size="small"
              disabled={status === 'completed'}
              className={
                status === 'completed'
                  ? "!bg-primaryColor !px-3 !py-2"
                  : "!px-3 !py-2 quest"
              }
            >
              {'Start Quest'}
            </CustomButton>)
          )}
       </div>
      </div>
    </Card>
  );
};

export default QuestCard;