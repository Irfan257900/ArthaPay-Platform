import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestCard from './questCard';
import AppEmpty from "../../../core/shared/appEmpty";
import AppAlert from "../../../core/shared/appAlert";
import { useDispatch, useSelector } from "react-redux";
import { clearErrorMessage } from "../../../reducers/quests.reducer";
import QuestBoxLoader from '../../../core/skeleton/rewards.loader/questbox.loader';

const CompletedQuests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, data: completedQuests, error } = useSelector((store) => store.quests.completed);

  const handleQuestSelect = useCallback((quest) => {
    navigate(`${quest.questId}`, { 
      state: { 
        quest,
        status: 'completed'
      } 
    });
  }, [navigate]);

  const clearErrorMsg = useCallback(() => {
    dispatch(clearErrorMessage(['completed']));
  }, [dispatch]);

  // Clear any errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearErrorMessage(['completed']));
    };
  }, [dispatch]);

  return (<>
    {loading && <QuestBoxLoader />}
    {!loading && error && (
      <AppAlert
        type="error"
        description={error}
        afterClose={clearErrorMsg}
        closable={true}
        showIcon
      />
    )}
    {!loading && (completedQuests && completedQuests.length > 0) && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-4">
        {completedQuests.map(quest => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onSelect={handleQuestSelect}
            status={'completed'}
          />
        ))}
      </div>
    )}
    {!loading && (!completedQuests || completedQuests.length === 0) &&
      <AppEmpty />
    }
  </>);
};

export default CompletedQuests;