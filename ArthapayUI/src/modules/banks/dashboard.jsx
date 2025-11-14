import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../core/shared/page.header";
import PaymentsDashboardLoader from "../../core/skeleton/payments.loader/payments.dashboard.loader";
import { useNavigate } from "react-router";
import RecentTransactions from "./reacent.transactions";
import { clearErrorMessage, fetchData } from "../../reducers/banks.reducer";
import NumericText from "../../core/shared/numericText";
import AppDefaults from "../../utils/app.config";
import AppAlert from "../../core/shared/appAlert";
import NoAccounts from "./noAccounts";

const BanksDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    data: { accounts, breadCrumbList },
    loading,
    error,
  } = useSelector((store) => store.banks);
  useEffect(() => {
    dispatch(fetchData());
  }, []);
  const depositFiat = useCallback(() => {
    navigate("/banks/deposit");
  }, []);
  const withdrawFiat = useCallback(() => {
    navigate("/banks/withdraw");
  }, []);
  return (
    <div>
      {loading && <PaymentsDashboardLoader />}
      {error && (
        <div className="alert-flex">
          <AppAlert
            className="w-100 "
            type="warning"
            description={error}
            showIcon
            closable
            onClose={clearErrorMessage}
          />
        </div>
      )}
      {!loading && (
        <>
          <PageHeader breadcrumbList={breadCrumbList} />
          <div>
            <h1 className="text-2xl text-titleColor font-semibold mb-2">
              Accounts
            </h1>
            <div className="grid md:grid-cols-3 gap-4 mb-7">
              <div className="p-3.5 border border-dbkpiStroke rounded-5">
                <div className="overflow-y-scroll">
                  {accounts?.bankAccounts?.map((account) => (
                    <div
                      className="flex justify-between mb-2"
                      key={account.id || account.currency}
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          className="!w-9 !h-9 rounded-full"
                          src={account.logo}
                          alt={"Account"}
                        />
                        <h4 className="text-lightWhite text-sm font-semibold">
                          {account.currency}
                        </h4>
                      </div>
                      <h4 className="text-subTextColor text-md font-semibold">
                        <NumericText
                          value={account.availableBalance}
                          decimalScale={AppDefaults.fiatDecimals}
                        />
                      </h4>
                    </div>
                  ))}
                </div>
                {(accounts?.bankAccounts?.length === 0 ||
                  accounts?.bankAccounts === null) && (
                 <NoAccounts/>
                )}
              </div>              
                <div className="p-3.5 border border-dbkpiStroke hover:border-primaryColor active-hyperlink hover:bg-primaryColor hoveranim rounded-5 ">
                  <button
                    className="text-left"
                    onClick={depositFiat}
                  >
                    <div className="space-y-1 active-hyperlink">
                      <span className="icon db-deposit-icon"></span>
                      <h4 className="text-dbkpiText text-base font-semibold">
                        Deposit
                      </h4>
                      <p className="text-labelGrey text-sm font-light">
                        Deposit fiat currency quickly and securely.
                      </p>
                    </div>                    
                  </button>
                  </div>
                  <div className="p-3.5 border border-dbkpiStroke hover:border-primaryColor active-hyperlink hover:bg-primaryColor hoveranim rounded-5 ">
                  <button
                    className="text-left"
                    onClick={withdrawFiat}
                  >
                    <div className="space-y-1 active-hyperlink">
                      <span className="icon db-withdraw-icon"></span>
                      <h4 className="text-dbkpiText text-base font-semibold">
                        Withdraw
                      </h4>
                      <p className="text-labelGrey text-sm font-light">
                        Seamlessly transfer funds from your wallet.
                      </p>
                    </div>
                  </button>
                  {/* <div className='p-3.5 flex justify-between cursor-pointer'>
                                        <div className='space-y-1 active-hyperlink'>
                                            <span className="icon db-exchange-icon db-swap-icon"></span>
                                            <h4 className="text-dbkpiText text-base font-semibold">Exchange wallet Transfer</h4>
                                            <p className="text-labelGrey text-sm font-light">Exchange wallet Transfer crypto efficiently using trusted platforms.</p>
                                        </div>
                                    </div> */}
                </div>
              </div>
            </div>
          <div className="mt-7">
            <RecentTransactions />
          </div>
          {/* <BanksPortfolio/> */}
        </>
      )}
    </div>
  );
};
export default BanksDashboard;
