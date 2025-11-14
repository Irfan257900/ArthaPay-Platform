import React, { useCallback, useState } from "react";
import ActionController from "../../../core/onboarding/action.controller";
import { useDispatch, useSelector } from "react-redux";
import CreateAccount from ".";
import { getAccounts } from "../../../reducers/accounts.reducer";
import { fetchData, resetCreateAccountState } from "../../../reducers/banks.reducer";
import { useLocation, useNavigate } from "react-router";

const CreateButton = ({isDrawer=false}) => {
  const dispatch = useDispatch();
  const {pathname}=useLocation()
  const navigate=useNavigate()
  const userProfile = useSelector((store) => store.userConfig.details);
  const [drawer, setDrawer] = useState(false);
  const navigateToCreateAccount=useCallback(()=>{
    navigate('/banks/account/create')
  },[])
  const openDrawer = useCallback(() => {
    setDrawer(true)
  }, []);
  const onDrawerClose = useCallback(() => {
    setDrawer(false);
    dispatch(resetCreateAccountState());
    if(pathname.endsWith('/banks')){
      dispatch(fetchData())
    }else{
      dispatch(getAccounts(userProfile?.id));
    }
    
  }, [userProfile?.id]);
  return (
    <>
      <div className="custom-controller">
        <ActionController
        handlerType="button"
        onAction={isDrawer ? openDrawer : navigateToCreateAccount}
        actionFrom={"Banks"}
        buttonType="noraml"
        className={''}
        redirectTo={`/banks`}
      >
        <span className="">Create Account</span>
      </ActionController>
      </div>
      {isDrawer && <CreateAccount
        isDrawerOpen={drawer}
        isDrawer={isDrawer}
        closeDrawer={onDrawerClose}
      />}
    </>
  );
};

export default CreateButton;
