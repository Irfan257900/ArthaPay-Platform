import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetState, setActiveTab } from "../../reducers/banks.reducer.js";
import ScreenTabs from "../../core/shared/screenTabs.jsx";
import {  useNavigate } from "react-router";
const ViewHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeTab = useSelector((store) => store.banks.activeTab);
  useEffect(()=>{
    return ()=>{
      dispatch(resetState(['activeTab']))
    }
  },[])
  const handleTabChange = useCallback((tab) => {
    dispatch(setActiveTab(tab));
    if (tab === "Deposit") {
      navigate("/banks/deposit");
    } else if (tab === "Withdraw") {
      navigate("/banks/withdraw");
    }
  }, []);

  return (
    <div className="flex justify-between items-start border-b-2 border-cryptoline pb-3">
      <div></div>
      <div className="flex gap-2">
        <div>
          <div className=" toggle-btn custom-tabs ">
            <ScreenTabs
              activeKey={activeTab}
              className="custom-crypto-tabs"
              onChange={handleTabChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHeader;
