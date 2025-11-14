import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestCard from './questCard';
import { useDispatch, useSelector } from "react-redux";
import AppEmpty from "../../../core/shared/appEmpty";
import AppAlert from "../../../core/shared/appAlert";
import { clearErrorMessage } from "../../../reducers/quests.reducer";
import QuestBoxLoader from '../../../core/skeleton/rewards.loader/questbox.loader';

const InProgressQuests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, data: inProgressQuests, error } = useSelector((store) => store.quests.inProgress);

  const handleQuestSelect = useCallback((quest) => {
    navigate(`${quest.questId}`, { 
      state: { 
        quest,
        status: 'inprogress'
      } 
    });
  }, [navigate]);

  const clearErrorMsg = useCallback(() => {
    dispatch(clearErrorMessage(['inProgress']));
  }, [dispatch]);

  // Clear any errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearErrorMessage(['inProgress']));
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
    {!loading && (inProgressQuests && inProgressQuests.length > 0) && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-4 customr-ewards-cards">
        {inProgressQuests.map(quest => (
          <QuestCard
            key={quest.id}
          quest={quest}
          onSelect={handleQuestSelect}
          status={'inProgress'}
        />
      ))}
    </div>
    )}
    {!loading && (!inProgressQuests || inProgressQuests.length === 0) &&
      <AppEmpty />
    }
  </>);
};

export default InProgressQuests;