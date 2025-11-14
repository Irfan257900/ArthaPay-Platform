import React, { useCallback, useEffect, useState } from "react";
import FeeTable from "./feeTable";
import { getFeeDetails } from "../http.services";
import AppAlert from "../../shared/appAlert";
import AppEmpty from "../../shared/appEmpty";
const CommonFeesView = ({ module, data, Loader }) => {
  const [dataState, setDataState] = useState(null);
  const [loader, setLoader] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const handleData = useCallback(
    (data) => {
      setDataState(data);
    },
    []
  );
  useEffect(() => {
    getFeeDetails({
      setLoader,
      setErrorMessage,
      setFees: handleData,
      membershipId: data?.id,
      module,
    });
  }, [data?.id]);

  const closeErrorMessage = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return (
    <div>
      {loader && <Loader />}
      {!loader && (
        <>
          {errorMessage && (
            <div className="alert-flex withdraw-alert fiat-alert">
              <AppAlert
                type={"error"}
                description={errorMessage}
                showIcon
                closable
                afterClose={closeErrorMessage}
              />
            </div>
          )}
          {dataState?.length ? (
            <FeeTable
              module={module}
              fees={dataState}
              mode={"view"}
              hasPrFees={true}
              dataKey="actionDetails"
            />
          ) : (
            <AppEmpty />
          )}
        </>
      )}
    </div>
  );
};
export default CommonFeesView;
