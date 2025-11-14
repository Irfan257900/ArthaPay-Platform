import React from "react";
import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader";
import { useSelector } from "react-redux";
import NoAccounts from "../noAccounts";

const WithdrawFallback = () => {
  const { loader, data } = useSelector(
    (store) => store?.transferReducer?.accounts
  );
  return (
    <>
      {loader && <ContentLoader />}
      {!loader && !data?.length &&
        <div className="my-10">
          <NoAccounts showIcon={true} showButton={true} description='Add an account to start making deposits and withdrawals.'/>
        </div>}
    </>
  );
};

export default WithdrawFallback;
