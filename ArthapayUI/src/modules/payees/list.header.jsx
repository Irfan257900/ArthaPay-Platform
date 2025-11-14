import React, { useCallback } from "react";
import ScreenTabs from "../../core/shared/screenTabs";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "../../reducers/payees.reducer";
import { useNavigate } from "react-router";

const ListHeader = () => {
  const activeTab = useSelector((store) => store.payeeStore.activeTab);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleTabChange = useCallback((tab) => {
    dispatch(setActiveTab(tab));
    switch (tab) {
      case "Crypto":
        navigate("/payees/crypto");
        return;
      case "Fiat":
        navigate("/payees/fiat");
        return;
      default:
        return;
    }
  }, []);
  return (
    <div className="flex justify-between !p-3 mt-2">
      <div className="toggle-btn custom-tabs">
        <ScreenTabs
          onChange={handleTabChange}
          activeKey={activeTab}
          className="custom-crypto-tabs"
        />
      </div>
      <div></div>
    </div>
  );
};

export default ListHeader;
