import React, { useCallback } from "react";
import NumericText from "../shared/numericText";
import { useNavigate } from "react-router";
import NoAccounts from "../../modules/banks/noAccounts";
import CustomButton from "../button/button";
import AppDefaults, { fiatCurrencySymbols } from "../../utils/app.config";
import { decryptAES } from "../shared/encrypt.decrypt";
import { NumericFormat } from "react-number-format";
const AccountSection = ({ accountsKips }) => {
  const clientName = window.runtimeConfig.VITE_CLIENT;
  const bankAccounts = accountsKips || [];
  const accountsToShow = bankAccounts.slice(0, 2);
  const navigate = useNavigate();
  const handleRedirect = useCallback(() => {
    navigate(`/banks/deposit`);
  }, []);
  const handleNavigate = useCallback((_, code) => {
    navigate(`/banks/withdraw/${code}`);
  }, []);
 const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED
  return (
    <>
      <div className="flex items-center justify-between mb-4 mt-7">
        <h4 className="bashboard-titles">Accounts</h4>
        {accountsToShow?.length > 0 && <div>
          <CustomButton
            type="normal"
            className="secondary-outline"
            onClick={handleRedirect}
          >
            All Accounts <span className="icon btn-arrow shrink-0 ml-2"></span>
          </CustomButton>
        </div>}
      </div>
      {bankAccounts.length === 0 && (
        <div className="flex flex-col kpicardbg">
          <NoAccounts title={'View Your Balances'} message={'Create an account to see your total balance and manage your funds in one place.'} />
        </div>
      )}
      {accountsToShow?.length > 0 && (
        <div className="grid xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-7">
          {accountsToShow.map((accounts) => (
            <div
              key={accounts.currency}
              className="kpicardbg grid lg:grid-cols-1 md:grid-cols-1 space-y-3"
            >
              {/* <div className="flex items-center justify-between md:col-span-2 self-start">
                <h4 className="text-base font-semibold text-titleColor">
                  {accounts?.currency}
                </h4>
              </div> */}
              <div className="items-center flex justify-between">
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <img
                      className="inline-block h-7 w-7 rounded-full"
                      src={accounts?.image}
                      alt="Bitcoin"
                    />
                    <h5 className="text-lg font-semibold text-subTextColor">
                      {accounts.currency} {decryptAES(accounts.accountNumber)}
                    </h5>
                  </div>
                  <h5 className="text-sm font-semibold text-paraColor">
                  </h5>
                </div>
              </div>
              <div className="flex items-center gap-1 justify-between md:col-span-2 self-end mt-9 md:mt-0">
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-2">
                  </div>
                  <h3 className="text-md font-semibold text-dbkpiText">
                    <NumericText
                      value={accounts?.amount}
                      prefixText={fiatCurrencySymbols[accounts.currency]}
                      decimalScale={AppDefaults?.fiatDecimals}
                      fixedDecimalScale={true}
                      displayType="text"
                      thousandSeparator
                      isdecimalsmall={Smalldecimals === 'true' ? true : false}
                    />
                  </h3>
                </div>
                <div className="">
                  <span className="icon withdraw-link mr-1"></span>
                  <CustomButton
                    type="normal"
                    className="text-primaryColor text-xs font-normal"
                    onClick={handleNavigate}
                    onClickParams={[accounts.currency]}
                  >
                    Withdraw
                  </CustomButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AccountSection;
