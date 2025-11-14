import React, { useCallback, useEffect, useState } from "react";
import { Form } from "antd";
import CustomButton from "../../button/button";
import FeeTable from "../fees/feeTable";
import { getFeeSetupDetails, saveFeesDetails } from "../http.services";
import AppAlert from "../../shared/appAlert";
import AppEmpty from "../../shared/appEmpty";
import { successToaster } from "../../shared/toasters";
const FeeSetup = ({ module, data, mode, Loader }) => {
  const [form] = Form.useForm();
  const actions = Form.useWatch(["actions"], form);
  const [dataState, setDataState] = useState(null);
  const [btnLoader, setBtnLoader] = useState(false);
  const [loader, setLoader] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const handleData = useCallback(
    (data) => {
      setDataState(data);
      form.setFieldsValue(data?.[0] || {});
    },
    [form]
  );
  useEffect(() => {
    getFeeSetupDetails({
      setLoader,
      setErrorMessage,
      setFees: handleData,
      mode,
      membershipId: data?.id,
      module,
    });
  }, [data?.id, mode]);

  const onFeeUpdate = useCallback(
    (list) => {
      const currentData = { ...dataState?.[0] };
      currentData.actions = list || [];
      form.setFieldsValue(currentData);
    },
    [dataState]
  );

  const onSubmit = useCallback(() => {
    const formValues = form.getFieldsValue(true);
    saveFeesDetails(
      {
        setLoader:setBtnLoader,
        setError:setErrorMessage,
        onSuccess:()=>successToaster({ content: `${module} charges saved successfully.`, className: "custom-msg", duration: 3 }),        membershipId:data?.id,
        formValues,
        moduleName:module
      }
    );
  }, [form, setBtnLoader, setErrorMessage]);

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
            <Form
              name={module}
              form={form}
              onFinish={onSubmit}
              scrollToFirstError={{
                behavior: "instant",
                block: "end",
                focus: true,
              }}
            >
              <Form.List name="actions">
                {() => (
                  <FeeTable
                    FormInstance={Form}
                    module={module}
                    fees={actions}
                    mode={mode}
                    onFieldChange={onFeeUpdate}
                    hasPrFees={true}
                    form={form}
                  />
                )}
              </Form.List>
              {mode !== "view" && (
                <div className="flex justify-end mx-5 my-5">
                  <CustomButton
                    type="primary"
                    onClick={form.submit}
                    loading={btnLoader}
                  >
                    Save
                  </CustomButton>
                </div>
              )}
            </Form>
          ) : (
            <AppEmpty />
          )}
        </>
      )}
    </div>
  );
};
export default FeeSetup;
