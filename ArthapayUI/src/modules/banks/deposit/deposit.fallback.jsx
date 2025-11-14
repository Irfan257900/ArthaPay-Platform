import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader";
import { useSelector } from "react-redux";
import NoAccounts from "../noAccounts";
import AppEmpty from "../../../core/shared/appEmpty";
import CreateButton from "../create/create.button";

const DepositFallback = () => {
  const { loader, data } = useSelector(
    (store) => store?.accountsReducer?.accounts
  );
  return (
    <>
      {loader && <ContentLoader />}
      {!loader && !data?.length &&
        <div className="custom-noAccunt flex justify-center items-center w-full h-[60vh]">
          <NoAccounts/>
          {/* <AppEmpty description="Add an account to start making deposits and withdrawals."  />
          <div className="text-center mt-4"><CreateButton>Account Create</CreateButton></div> */}
        </div>}    </>
  );
};

export default DepositFallback;
