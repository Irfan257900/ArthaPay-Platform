import React, { useCallback } from "react";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import NumericText from "../../../core/shared/numericText";
import AppDefaults from "../../../utils/app.config";
import ScreenTabs from "../../../core/shared/screenTabs";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import numberFormatter from "../../../utils/numberFormatter";
const ViewHeader = () => {
  const navigate = useNavigate();
  const { loader } = useSelector(
    (store) => store.accountsReducer.accounts
  );
  const selectedCoin = useSelector(
    (store) => store.accountsReducer.selectedCurrency
  );
  const selectedBank = useSelector(
    (store) => store.accountsReducer.selectedBank
  );
  const handleTabChange = useCallback((tab) => {
    if (tab === "Withdraw") {
      navigate("/banks/withdraw");
    }
  }, []);
  if (loader) {
    return <></>
  }
  const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED

  return (
    // <div className="flex justify-between items-start border-b-2 border-cryptoline pb-3">
    <div className={`flex justify-between items-start pb-3 ${selectedCoin?.id ? 'border-b-2 border-cryptoline' : ''}`}>
      {selectedCoin?.id ? (
        <ListDetailLayout.ViewHeader
          logoType="img"
          hasLogo={true}
          logo={selectedCoin?.image}
          title={
            <NumericText
              value={selectedBank?.balance || 0}
              decimalScale={AppDefaults.fiatDecimals}
              isdecimalsmall={Smalldecimals === 'true' ? true : false}
              thoiusandSeparator
              suffixText={selectedCoin?.currency}
            />
          }
          // metaData={
          //   <div>
          //     {/* <span>{selectedCoin?.name}</span> */}
          //     &nbsp;
          //   </div>
          // }
          showActions={false}
        />
      ) : (
        <div></div>
      )}
      {selectedCoin?.id && <div className="flex gap-2">
        <div>
          <div className=" toggle-btn custom-tabs ">
            <ScreenTabs
              activeKey='Deposit'
              className="custom-crypto-tabs"
              onChange={handleTabChange}
            />
          </div>
        </div>
      </div>}
    </div>
  );
};

export default ViewHeader;
