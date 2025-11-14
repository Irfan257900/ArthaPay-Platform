import { Alert, Form, Input } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CustomButton from "../../button/button";
import { saveMembership, fetchMembershipScreenDetails } from "../http.services";
import {
  normalizeFormattedNumber,
  numberValidationHelper,
  replaceExtraSpaces,
  validations,
} from "../../shared/validations";
import AppDefaults from "../../../utils/app.config";
import { useNavigate, useParams } from "react-router";
import AppSelect from "../../shared/appSelect";
import NumericText from "../../shared/numericText";
import { TwoColFormLoader } from "../../skeleton/form.loaders";
import NumericInput from "../../shared/numericInput";
const {
  requiredValidator,
  textLengthValidator,
  textValidator,
  whitespaceValidator,
  numberValidator,
} = validations;
const MemberShip = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const userProfile = useSelector((state) => state.userConfig.details);
  const [state, setState] = useState({
    loading: "data",
    data: null,
    lookups: { accountTypes: [] },
    error: { message: "", type: "error" },
  });
  const { id, mode } = useParams();
  useEffect(() => {
    fetchMembershipScreenDetails(setState, form.setFieldsValue, {
      membershipId: id,
    });
  }, []);
  const setFieldValue = useCallback(
    (value, field) => {
      form.setFieldValue(field, value);
    },
    [form]
  );
  const onInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "name" && state.data?.isFeeSetupCompleted === true) {
      return;
    }
    setFieldValue(value, name);
  }, []);
  const onInputBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (
        name === "name" &&
        state.data?.isFeeSetupCompleted === true
      ) {
        return;
      }
      const valueToSet = replaceExtraSpaces(value);
      setFieldValue(valueToSet, name);
    },
    [state.data]
  );
  const onAccountTypeChange = useCallback(
    (value) => {
      if (state.data?.isFeeSetupCompleted !== true) {
        setFieldValue(value,"accountType");
      }
    },
    [state.data]
  );
  const handleBack = useCallback(() => {
    form?.resetFields();
    navigate(`/profile/memberships`);
  }, []);
  const saveMember = useCallback(() => {
    const values = { ...form.getFieldsValue(true) };
    saveMembership(setState, handleBack, { values, userProfile, mode ,id});
  }, [form, userProfile]);
  const handleErrorClose = useCallback(() => {
    setState((prev) => ({ ...prev, error: { message: "", type: "error" } }));
  }, []);
  const normalizeNumericInput = useCallback(
    (value) =>
      (value || value == 0) ? normalizeFormattedNumber(value) : undefined,
    []
  );
  return (
      <div className=" kpicardbg h-full">
        {state.loading === "data" && <TwoColFormLoader itemCount={4} />}
        {state.loading !== "data" && (
          <Form
            form={form}
            className="pay-inform basicinfo-form "
            scrollToFirstError
            onFinish={saveMember}
          >
            <div className="">
              {state.error.message && (
                <div className="alert-flex mb-24">
                  <Alert
                    className=" !px-0 security-error"
                    type={state.error.type}
                    description={state.error.message}
                    onClose={handleErrorClose}
                    showIcon
                    closable
                  />
                </div>
              )}

              {mode !== "View" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    className="mb-0"
                    name="name"
                    label="Name"
                    rules={[
                      requiredValidator(),
                      whitespaceValidator("membership name"),
                      textValidator(
                        "membership name",
                        "alphaNumWithSpaceAndHyphen"
                      ),
                      textLengthValidator("membership name"),
                    ]}
                    colon={false}
                  >
                    <Input
                      className="custom-input-field outline-0"
                      placeholder="Enter Name"
                      name="name"
                      type="input"
                      disabled={state.data?.isFeeSetupCompleted === true}
                      maxLength={100}
                      onChange={onInputChange}
                      onBlur={onInputBlur}
                    />
                  </Form.Item>
                  <Form.Item
                    className="mb-0"
                    name="accountType"
                    label="Account Type"
                    rules={[requiredValidator()]}
                    colon={false}
                  >
                    <AppSelect
                      className="w-full"
                      placeholder="Select Account type"
                      name="accountType"
                      allowClear
                      onChange={onAccountTypeChange}
                      options={state.lookups.accountTypes}
                      fieldNames={{ label: "name", value: "code" }}
                      disabled={state.data?.isFeeSetupCompleted === true}
                    />
                  </Form.Item>
                  <Form.Item
                    className="mb-0"
                    name="price"
                    label="Price ($)"
                    rules={[
                      requiredValidator(),
                      numberValidator("membership price"),
                    ]}
                    colon={false}
                    normalize={normalizeNumericInput}
                  >
                    <NumericInput
                      className="custom-input-field outline-0 required-border"
                      placeholder="Enter Price"
                      decimalScale={AppDefaults.fiatDecimals}
                      thousandSeparator={true}
                      onChange={setFieldValue}
                      onChangeParams={['price']}
                      allowNegative={false}
                    />
                  </Form.Item>
                  <Form.Item
                    className="mb-0"
                    name="referralBonus"
                    label="Refferal Bonus (%)"
                    rules={[
                      requiredValidator(),
                      numberValidator("referral bonus", {
                        ...numberValidationHelper,
                        maxLimit: 100,
                        maxLimitString: "100",
                      }),
                    ]}
                    colon={false}
                    normalize={normalizeNumericInput}
                  >
                    <NumericInput
                      className="custom-input-field outline-0 required-border"
                      placeholder="Enter Refferal Bonus"
                      decimalScale={AppDefaults.fiatDecimals}
                      onChange={setFieldValue}
                      onChangeParams={['referralBonus']}
                      allowNegative={false}
                    />
                  </Form.Item>
                </div>
              )}
              {mode === "View" && (
                <div className="bg-card w-full rounded-md bg-inputDarkBorder border border-StrokeColor md:p-4 p-2 mb-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="">
                        <p className="mb-0 profile-label">Name</p>
                        <p className="mb-0 profile-value">
                          {" "}
                          {state.data?.name}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="">
                        <p className="mb-0 profile-label">Account Type</p>
                        <p className="mb-0 profile-value">
                          {" "}
                          {state.data?.accountType}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="">
                        <p className="mb-0 profile-label">Price</p>
                        <p className="mb-0 profile-value">
                          <NumericText
                            value={state.data?.price}
                            prefixText="$ "
                            decimalScale={AppDefaults.fiatDecimals}
                          />
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="">
                        <p className="mb-0 profile-label">Refferal Bonus (%)</p>
                        <p className="mb-0 profile-value status-color">
                          {" "}
                          <NumericText
                            value={state.data?.referralBonus}
                            decimalScale={AppDefaults.percentageDecimals}
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="md:flex items-center gap-2 justify-end mt-4">
                <CustomButton
                  className=""
                  htmlType="reset"
                  onClick={handleBack}
                >
                  Cancel
                </CustomButton>
                {mode !== "View" && (
                  <CustomButton
                    type="primary"
                    className=""
                    htmlType="submit"
                    loading={state.loading === "save"}
                    disabled={state.loading === "save"}
                  >
                    Save
                  </CustomButton>
                )}
              </div>
            </div>
          </Form>
        )}
      </div>
  );
};

export default MemberShip;
