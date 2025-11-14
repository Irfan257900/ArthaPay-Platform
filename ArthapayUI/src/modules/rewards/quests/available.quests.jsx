import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppAlert from "../../../core/shared/appAlert";
import AppEmpty from "../../../core/shared/appEmpty";
import { clearErrorMessage } from "../../../reducers/quests.reducer";
import QuestCard from './questCard';
import { useDispatch, useSelector } from 'react-redux';
import QuestBoxLoader from '../../../core/skeleton/rewards.loader/questbox.loader';

const AvailableQuests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, data: availableQuests, error } = useSelector((store) => store.quests.allQuests);

  const handleQuestSelect = useCallback((quest) => {
    navigate(`${quest.id}`, { 
      state: { 
        quest,
        status: 'available'
      } 
    });
  }, [navigate]);

  const clearErrorMsg = useCallback(() => {
    dispatch(clearErrorMessage(['allQuests']));
  }, [dispatch]);

  // Clear any errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearErrorMessage(['allQuests']));
    };
  }, [dispatch]);

  return (<>
    {loading && <QuestBoxLoader />}
    {!loading && error && (
      <div className='error-message-box !w-full'>
        <AppAlert
        type="error"
        description={error}
        afterClose={clearErrorMsg}
        closable={true}
        showIcon
      />
      </div>
    )}
    {!loading && (availableQuests && availableQuests.length > 0) && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-4">
        {availableQuests.map(quest => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onSelect={handleQuestSelect}
            status={'available'}
          />
        ))}
      </div>
      
    )}
    {!loading && (!availableQuests || availableQuests.length === 0) &&
      <AppEmpty />
    }
  </>);
};
export default AvailableQuests;