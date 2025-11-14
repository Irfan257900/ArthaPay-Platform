import React, { useCallback, useEffect, useState } from 'react';
import { Card, Steps, Progress } from 'antd';
import {GiftOutlined } from '@ant-design/icons';
import { successToaster } from '../../../core/shared/toasters';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrorMessage, handleStartQuest } from '../../../reducers/quests.reducer';
import AppAlert from '../../../core/shared/appAlert';
import { QuestRewardDisplay } from './service';
import CustomButton from '../../../core/button/button';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const { Step } = Steps;

const QuestDetails = () => {
  const { questId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [quest, setQuest] = useState(location.state?.quest);
  const status = location.state?.status || 'available';
  
  const user = useSelector((state) => state.userConfig?.details);
  const { error } = useSelector((store) => store.quests.startQuest);
  const quests = useSelector((state) => state.quests.quests);
  
  useEffect(() => {
    if (!quest && questId) {
      // Try to find the quest in the existing quests first
      const foundQuest = quests?.find(q => q.id === questId || q._id === questId);
      if (foundQuest) {
        setQuest(foundQuest);
      } else {
        console.log('Fetching quest data...');
      }
    }
  }, [questId, quest, quests, dispatch]);

  const handleJoinQuest = useCallback(() => {
    const questIdToUse = quest?.id || quest?.questId;
    if (!questIdToUse || !user?.id) return;
  
    dispatch(handleStartQuest({ 
      questsid: questIdToUse, 
      userId: user.id, 
      onSuccess: () => {
        successToaster({ 
          content: `Quest "${quest?.name}" started successfully!`, 
          duration: 3 
        });
        navigate('/rewards/quests/inprogress');
      }
    }));
  }, [dispatch, quest, user?.id, navigate]);
  

  const getCurrentStepIndex = () => {
    return quest?.steps?.findIndex(step => !step.isCompleted) || 0;
  };
  
  const clearErrorMsg = useCallback(() => {
    dispatch(clearErrorMessage(['startQuest']));
  }, [dispatch]);
  
  const handleBack = useCallback(() => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/rewards/quests');
    }
  }, [navigate, location.key]);
  
  const handleQuestContinue = useCallback(() => {
    if (!quest?.steps?.length) return;
    
    const triggerEvent = quest.steps[0]?.triggerEvent;
    const event = triggerEvent?.toLowerCase();
    
    switch (event) {
      case 'topup':
        navigate('/cards/mycards');
        break;
      case 'deposit':
        navigate('/wallets/crypto/deposit');
        break;
      case 'upgrade':
        navigate('/profile/fees');
        break;
    case 'withdraw':
      navigate(`/wallets/fiat/withdraw`);
      break;
    case 'cardpurchase':
      navigate(`/cards/apply`);
      break;
    case 'consume':
      navigate(`/cards/mycards`);
      break;
    default:
      navigate(`/rewards`);
  }
}, [quest]);

const getStepStatus = useCallback(
  (step, index) => {
    if (step.isCompleted) return 'finish';
    if (index === getCurrentStepIndex()) return 'process';
    return 'wait';
  },
  [getCurrentStepIndex]
);
  return (
    <div className="max-w-screen-xl mx-auto py-8">
      {error && (
        <AppAlert
          type="error"
          description={error}
          afterClose={clearErrorMsg}
          closable={true}
          showIcon
        />
      )}
      <div className="mb-6 flex items-center gap-4">
        <span className="icon lg btn-arrow-back cursor-pointer" onClick={handleBack}></span>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-xl font-semibold mb-1">{quest.questName || quest.name}</h1>
            <p className="text-paraColor text-sm">{quest.questDescription || quest.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 custom-quest-cards">
        {/* Quest Progress */}
        <div className="lg:col-span-2">
          <Card title="Quest Progress" className="kpicardbg !border !border-StrokeColor !p-0 !rounded-5">
            {status === 'completed' && (
              <div className="bg-questGreenBorder border border-questGreenBg rounded-lg px-4 py-2.5 mb-4">
                <div className="flex items-center gap-2 text-lightWhite font-medium">
                  <GiftOutlined />
                  Quest Completed!
                </div>
                <p className="text-paraColor text-xs mt-1">
                  Congratulations! You've successfully completed this quest.
                </p>
              </div>
            )}

            {/* Steps */}
            <div className='flex justify-between items-center'>
              <h3 className="font-medium text-sm mb-3 text-lightWhite">Quest Steps</h3>
            <div className=''>
              <div className="custom-quest-details-buttons !w-full ml-4">
                {status?.toLowerCase() === 'inprogress' && (
                  <div className="space-y-2">
                    <button
                      type=""
                      size="large"
                      block
                      className="!text-partiallyPaid border border-partiallyPaid rounded-3xl px-2 py-1 !text-xs font-medium"
                      disabled={true}
                    >
                      In Progress
                    </button>
                  </div>
                )}
              </div>
              <div className="custom-quest-details-buttons !w-full ml-4">
                {status?.toLowerCase() === 'completed' && (
                  <button
                    type="primary"
                    size="large"
                    block
                    className="!text-textPending border border-textPending rounded-3xl px-2 py-1 !text-xs font-medium"
                    disabled={true}
                  >
                    Completed
                  </button>
                )}
              </div>
            </div>
            </div>
            <div className='custom-quest-steps'>
              <Steps
                direction="vertical"
                current={getCurrentStepIndex()}
                status={status === 'completed' ? 'finish' : 'process'}
              >
                {quest.steps?.map((step, index) => (
                  <Step
                    key={step.stepId || index}
                    title={step.name || step.description}
                    description={
                      <div className="mt-1 text-sm !text-paraColor">
                        {step.triggerEvent && <div className="mb-1">Trigger: {step.triggerEvent}</div>}
                        <div className='flex justify-between items-center gap-6'>
                          <div>
                              <div>Progress: {step.currentCount}/{step.targetCount}</div>
                            {(step.currentCount < step.targetCount) && (
                              <Progress
                                percent={(step.currentCount / step.targetCount) * 100}
                                size="small"
                                strokeColor="#a78bfa"
                                className="mt-2 progress-bar"
                              />
                            )}
                          </div>
                          {status?.toLowerCase() !== 'available'
                          ?(status?.toLowerCase() === 'inprogress' && (
                            <div
                              className="flex items-center cursor-pointer text-primaryColor text-base"
                              onClick={handleQuestContinue}
                            >
                              <span>Continue</span>
                              <span className="icon btn-arrow shrink-0 ml-2"></span>
                            </div>
                          ))
                          :(<CustomButton
                              type={'primary'}
                              size="small"
                                        className={
                                        "!px-3 !py-2 quest"
                                        }
                              onClick={handleJoinQuest}
                            >
                                        {'Start Quest'}
                           </CustomButton>)}
                        </div>
                      </div>
                    }
                    status={getStepStatus(step, index)}
                  />
                ))}

              </Steps>

            </div>
          </Card>
        </div>

        {/* Rewards & Info */}
        <div className="flex flex-col gap-4">
          {/* Rewards */}
          <Card title="Rewards" className="kpicardbg !border !border-StrokeColor !p-0 !rounded-5">
            <div className="flex flex-col gap-3">
              <div className="">
              <QuestRewardDisplay quest={quest} />
            </div>
            </div>

            {/* Action Button */}
          </Card>

          {/* Quest Info */}
          <Card title="Quest Info" size="small" className="kpicardbg !border !border-StrokeColor !p-2 !rounded-5">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-paraColor">Category:</span>
                <span className="font-medium capitalize">{quest.category || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-paraColor">Difficulty:</span>
                <span className="font-medium capitalize">{quest.difficulty || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-paraColor">Type:</span>
                <span className="font-medium capitalize">{quest.type || '--'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuestDetails;
