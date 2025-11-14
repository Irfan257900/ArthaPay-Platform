import { useCallback } from "react";
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
    (store) => store.transferReducer.accounts
  );
  const selectedCoin = useSelector(
    (store) => store.transferReducer.selectedCurrency
  );
  const selectedBank = useSelector(
    (store) => store.transferReducer.selectedBank
  );
  const handleTabChange = useCallback((tab) => {
    if (tab === "Deposit") {
      navigate("/banks/deposit");
    }
  }, []);
  if (loader) {
    return <></>
  }
  const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED
  return (
    <div className="flex justify-between items-start border-b-2 border-cryptoline pb-3">
      {selectedCoin?.id ? (
        <ListDetailLayout.ViewHeader
          logoType="img"
          hasLogo={true}
          logo={selectedCoin?.image}
         title={
            <NumericText
              suffixText={` ${selectedCoin?.currency}`}
              value={selectedBank?.balance || 0}
              isdecimalsmall={Smalldecimals === 'true' ? true : false}
              decimalScale={AppDefaults.fiatDecimals}
              thousandSeparator
            /> }
          showActions={false}
        />
      ) : (
        <div></div>
      )}
      <div className="flex gap-2">
        <div>
          <div className=" toggle-btn custom-tabs ">
            <ScreenTabs
              activeKey='Withdraw'
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
