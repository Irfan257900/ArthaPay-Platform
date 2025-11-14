import React, { useCallback, useEffect, useReducer } from "react";
import { Form, Input } from "antd";
import CustomButton from "../../core/button/button";
import {
  emailRegex,
  nameRegex,
  replaceExtraSpaces,
  validations,
} from "../../utils/validations";
import { useSelector } from "react-redux";
import { inviteMemReducer, inviteMemState } from "./reducers";
import { sendInvitation } from "./httpServices";
import AppAlert from "../../core/shared/appAlert";
import PhoneCodeDropdown from "../../core/shared/phCodeDropdown";
import { getCountryTownLu, VALIDATION_MESSAGES } from "./services";
import SuccessComponent from "../../core/shared/success.component";
import { genderLookup } from "../../utils/app.config";
import AppSelect from "../../core/shared/appSelect";
const { requiredValidator, regexValidator, textLengthValidator } = validations;

const Invite = ({ handleDrawerClose,handleSaveDrawerClose }) => {
  const [form] = Form.useForm();
  const [state, setState] = useReducer(inviteMemReducer, inviteMemState);
  const userProfile = useSelector((store) => store.userConfig.details);
   useEffect(() => {
     getCountryTownLu(setGetCountryLU, onError);
  }, []);
   const setGetCountryLU = (response) => {
    if (response) {
      const Country = response?.Country || [];
      setState({
        type: "setCountryLookUp",
        payload: Country
      });
      setState({
        type: "setPhoneCodeLookup",
        payload: response?.phoneCodes || response?.PhoneCodes || []
      });
    } else {
      onError(response);
    }
  };
  const setField = useCallback((field)=>(e) => {
    let value=e?.type=="blur" ? replaceExtraSpaces(e.target.value) : e
    form.setFieldValue(field, value);
  }, []);
  const onSuccess = () => {
    setState({
      type: "setStates",
      payload: {
        loading: "",
        showSuccess: true,
      },
    });
  };
  const onError = (message) => {
    setState({
      type: "setStates",
      payload: {
        error: { message, type: "error" },
        loading: "",
      },
    });
  };
  const handleInvite = useCallback(async () => {
    const values = form.getFieldsValue(true);
    if (!values.phoneCode) {
      setState({
        type: "setStates",
        payload: {
          loading: "",
          error: { message: VALIDATION_MESSAGES.PHONE_CODE, type: "warning" },
        },
      });
      return;
    }
    await sendInvitation(onSuccess, onError, { values, userProfile });
  }, [form]);
  const handleValidate = useCallback(async (e) => {
    e.preventDefault();
    setState({
      type: "setStates",
      payload: { loading: "save", error: { message: "" } },
    });
    try {
      await form.validateFields();
      form.submit();
    } catch (error) {
      setState({ type: "setLoading", payload: "" });
    }
  },[])
  const closeError = useCallback(() => {
    setState({ type: "setError", payload: { message: "" } })
  }, [])
  return (
    <>
      {!state.showSuccess && (
        <>
          {state.error.message && (
            <div className="alert-flex withdraw-alert fiat-alert">
              <AppAlert
                type={state.error.type}
                description={state.error.message}
                showIcon
                closable
                afterClose={closeError}
              />
            </div>
          )}
          <Form form={form}
            enableReinitialize
            scrollToFirstError={{
              behavior: 'smooth',
              block: 'center',
              inline: 'center',
            }}
           onFinish={handleInvite} className="add-member">
            <div className="grid grid-cols-1 gap-6 basicinfo-form mt-5 mb-10">
              <Form.Item
                label="User Name "
                required
                name="userName"
                rules={[
                  requiredValidator(),
                  regexValidator("user name", nameRegex),
                  textLengthValidator('user name')
                ]}
                className="relative mb-0"
              >
                <Input
                  className="bg-transparent border border-dbkpiStroke text-lightWhite p-2 rounded outline-0 w-full "
                  placeholder="Enter User Name"
                  type="text"
                  maxLength={50}
                  onBlur={setField("userName")}
                />
              </Form.Item>
              <Form.Item
                label="First Name "
                required
                name="firstName"
                rules={[
                  requiredValidator(),
                  regexValidator("first name", nameRegex),
                  textLengthValidator('first name')
                ]}
                className="relative mb-0"
              >
                <Input
                  className="bg-transparent border border-dbkpiStroke text-lightWhite p-2 rounded outline-0 w-full "
                  placeholder="Enter First Name"
                  type="text"
                  maxLength={50}
                  onBlur={setField("firstName")}
                />
              </Form.Item>
              <Form.Item
                label="Last Name"
                required
                name="lastName"
                className="relative mb-0"
                rules={[
                  requiredValidator(),
                  regexValidator("last name", nameRegex),
                  textLengthValidator('last name')
                ]}
              >
                <Input
                  className="bg-transparent border border-dbkpiStroke text-lightWhite p-2 rounded outline-0 w-full"
                  placeholder="Enter Last Name"
                  type="text"
                  maxLength={50}
                  onBlur={setField("lastName")
                  }
                />
              </Form.Item>
              <Form.Item
                className="mb-0"
                name="gender"
                label="Gender"
                required
                colon={false}
                rules={[requiredValidator()]}
              >
                <AppSelect
                  className={""}
                  allowClear
                  placeholder="Select Gender"
                  options={genderLookup}
                  fieldNames={{ label: "name", value: "code" }}
                  onChange={setField("gender")}
                />
              </Form.Item>
              <Form.Item
                className="mb-0 w-full country-select"
                name="country"
                label="Country Of Residence"
                colon={false}
                rules={[requiredValidator()]}
              >
                <AppSelect
                  className={""}
                  showSearch
                  allowClear
                  placeholder="Select Country"
                  options={state.countryLookUp}
                  fieldNames={{ label: "name", value: "name" }}
                  onChange={setField("country")}
                />
              </Form.Item>
              <Form.Item
                className="phoneno-select phone-field-error mb-0"
                name="phoneNo"
                label="Phone Number"
                required
                colon={false}
                rules={[
                  { required: true, message: "Is required" },
                  {
                    validator(_, value) {
                      if (value && !/^\d{6,12}$/.test(value)) {
                        return Promise.reject(
                          new Error("Invalid phone number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                //  type="number"
                 onKeyDown={(e) => {
                  if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
                    e.preventDefault();
                  }
                }}
                  addonBefore={
                    <Form.Item rules={[validations.requiredValidator()]} name="phoneCode" className="mb-0 w-28 md:w-32 lg:w-36 xl:w-48 phone-select-error">
                      <PhoneCodeDropdown
                        onChange={setField("phoneCode")}
                        shouldUsePropsList={true}
                        codes={state.phoneCodeLookup}
                      />
                    </Form.Item>
                  }
                  className="mb-0 border border-dbkpiStroke rounded-5"
                  maxLength={12}
                  placeholder="Enter Phone Number"
                  onBlur={setField("phoneNo")
                  }
                />
              </Form.Item>
               <Form.Item
                label="Email"
                name="email"
                required
                rules={[
                  requiredValidator(),
                  regexValidator("email", emailRegex),
                ]}
                className="relative mb-0"
              >
                <Input
                  className="bg-transparent border border-dbkpiStroke text-lightWhite p-2 rounded outline-0 w-full"
                  placeholder="Enter Email"
                  type="text"
                  maxLength={50}
                  onBlur={setField("email")
                  }
                />
              </Form.Item>
              
            </div>
          </Form>
          <div className="mt-6 text-right">
            <CustomButton
              onClick={handleDrawerClose}
              disabled={state.loading === "save"}
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="primary"
              className={"md:ml-2"}
              onClick={handleValidate}
              loading={state.loading === "save"}
              disabled={state.loading === "save"}
            >
              Invite
            </CustomButton>
          </div>
        </>
      )}
      {state.showSuccess && (
        <div className="mx-auto">
          <SuccessComponent onOk={handleSaveDrawerClose} message={"Invite Sent Successfully"} />
        </div>
      )}
    </>
  );
};

export default Invite;