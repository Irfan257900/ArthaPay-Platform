import { Dropdown, Menu } from "antd"
import React, { memo, useCallback, useEffect, useRef } from "react"
import { applyCardsTab, myCardsTab } from "./service"
import SingleBarLoader from "../../core/skeleton/bar.loader";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import ScreenTabs from "../../core/shared/screenTabs";
import CustomButton from "../../core/button/button";
import NumericText from "../../core/shared/numericText";
import AppDefaults from "../../utils/app.config";
import { getMyCradsAvailableBalance, resetState, setDropdownVisible, setSelectedAvailableBalance, setSelectedCoin } from "../../reducers/cards.reducer";
const CardsScreenTabs = ({ screenName }) => {
  const { loading, data } = useSelector((store) => store.cardsStore.availableBalance);
  const selectedAvailableBalance = useSelector((store) => store.cardsStore.selectedAvailableBalance);
  const dropdownVisible = useSelector((store) => store.cardsStore.dropdownVisible);
  const selectedCoin = useSelector((store) => store.cardsStore.selectedCoin);
  const coins = useSelector((store) => store.cardsStore.coins);
  const { t } = useTranslation();
  const navigate = useNavigate()
  const hasFetched = useRef(false);
  const dispatch = useDispatch();
  const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED
  useEffect(() => {
    if (!hasFetched.current) {
      getAvailableBalance()
      hasFetched.current = true;
    }
  }, []);
  const getAvailableBalance = async () => {
    dispatch(getMyCradsAvailableBalance());
    dispatch(setSelectedCoin("USD"));
  };
  const getSelectedCoin = useCallback((e, item) => {
    e?.preventDefault?.()
    const currency = item.name;
    const usd = item.usd;
    const eur = item.eur;
    if (currency === "USD") {
      dispatch(setSelectedAvailableBalance(usd));
    } else if (currency === "EUR") {
      dispatch(setSelectedAvailableBalance(eur));
    }
    dispatch(setSelectedCoin(currency));
    dispatch(setDropdownVisible(false));
  }, [data]);
  const menuitems = useCallback(() => (
    <Menu>
      <ul className="dropdown-list">
        {coins && coins?.map((item) =>
          <li className='cursor-pointer w-full text-center' key={item.code}>
            <CustomButton type="normal" className='w-full text-center' onClick={getSelectedCoin} onClickParams={[item]}>
              <span>{item?.name}</span>
            </CustomButton>
          </li>
        )}
      </ul>
    </Menu>
  ), [coins])
  const handleVisibleChange = useCallback((flag, e) => {
    dispatch(setDropdownVisible(flag));
  }, []);
  const handleTabNavigation = useCallback((tab) => {
    if (tab === 'My Cards' && screenName !== 'MyCards') {
      navigate(`/cards/mycards`)
    } else if (tab === 'Apply Cards' && screenName !== 'ApplyCards') {
      navigate(`/cards/apply`)
    }
    dispatch(resetState(["selectedAvailableBalance", "coins", "dropdownVisible", "selectedCoin"]));
  }, [screenName]);
  return (
    <div className=''>
      <div className="flex justify-between items-center p-3 ">
        <div className=" toggle-btn custom-tabs ">
          <ScreenTabs onChange={handleTabNavigation} className="custom-crypto-tabs" activeKey={screenName === 'MyCards' ? myCardsTab : applyCardsTab} />
        </div>
      </div>
      <div className="px-3">
        {loading ? <SingleBarLoader /> :
          <>
            <p className="text-base font-semibold text-titleColor">{t('cards.myCards.Total_Amount')}</p>
            <div className="flex items-center gap-1.5 !ml-0">
              <div className="flex items-center gap-2">
              <CustomButton type="normal" className='!cursor-default'>
              <NumericText className="font-semibold text-subTextColor text-3xl" value={selectedAvailableBalance} suffixText={selectedCoin} decimalScale={AppDefaults.fiatDecimals}
                  isdecimalsmall={Smalldecimals === 'true' ? true : false} />
              </CustomButton>
              <Dropdown menu={{ items: [] }} dropdownRender={menuitems} overlayClassName="depwith-drpdown"
                onOpenChange={handleVisibleChange}
                open={dropdownVisible}
                trigger={['click']}
              >
                <span className="icon sm downarrow"></span>
              </Dropdown>
            </div>
            <div>
              <button onClick={getAvailableBalance}>
              <span className="icon refresh cursor-pointer"></span>
            </button>
            </div>
            </div>
          </>}
      </div>
    </div>
  )
}
export default memo(CardsScreenTabs)