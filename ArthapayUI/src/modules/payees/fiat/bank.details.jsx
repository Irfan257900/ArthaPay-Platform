import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Button, Input } from "antd";
import PayeeFormInput from "../formInput";
import { alphaNumRegex, validations } from "../../../core/shared/validations";
import { getIBANAccountDetails } from "../http.services";
import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader";
const { requiredValidator, textValidator,regexValidator } = validations

const BankDetailsForm = ({ FormInstance, setField, setError, form,state, setState }) => {
  const selectedCoin = FormInstance.useWatch('walletCode', form);
  const iban = FormInstance.useWatch('iban', form);

  const handleValidate = useCallback(async (event) => {
    event.preventDefault()
    const urlParams = { ibanNo: iban }
    await getIBANAccountDetails(setState, urlParams, setError);
  },[state,setError,iban]);
  const handleChange = useCallback((e) => {
    setField?.(e.target.id, e.target.value);
}, [setField]);
const handleBlur = useCallback((e) => {
    setField?.(e.target.id, e.target.value?.trim());
}, [setField]);
  return (
    <div className="!w-full">
      <div className="mt-6">
        <h1 className="!text-xl font-semibold !mb-4 !text-titleColor capitalize">
        Payment Information
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedCoin !== 'EUR' && <>
            <PayeeFormInput isRequired={true} label={"Bank Name"}>
              <FormInstance.Item
                name="bankName"
                className="text-left relative mb-0"
                rules={[
                  requiredValidator(),
                  textValidator('bankName', 'alphaNumWithSpaceAndSpecialChars')
                ]}
              >
                <Input
                  className="custom-input-field outline-0"
                  placeholder="Enter Bank Name"
                  type="input"
                  autoComplete="off"
                  maxLength={100}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormInstance.Item>
            </PayeeFormInput>

            <PayeeFormInput isRequired={true} label={"Account Number"}>
              <FormInstance.Item
                name={"walletaddress"}
                className="text-left mb-0"
                rules={[requiredValidator(), regexValidator("walletaddress",alphaNumRegex)]}
              >
                <Input
                  className="custom-input-field outline-0"
                  placeholder="Enter Account Number"
                  type="input"
                  autoComplete="off"
                  maxLength={100}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormInstance.Item>
            </PayeeFormInput>

            <PayeeFormInput isRequired={true} label={"Swift/ BIC/ Route Code "}>
              <FormInstance.Item
                name={"swiftOrBicCode"}
                className="text-left mb-0"
                rules={[requiredValidator(), regexValidator("swiftOrBicCode",alphaNumRegex)]}
              >
                <Input
                  className="custom-input-field outline-0"
                  placeholder="Enter Swift/ BIC/ Route Code"
                  type="input"
                  autoComplete="off"
                  maxLength={100}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormInstance.Item>
            </PayeeFormInput>
            {selectedCoin === 'GBP' &&
              <PayeeFormInput isRequired={true} label={"UK SortCode"}>
                <FormInstance.Item
                  name={"ukShortCode"}
                  className="text-left mb-0"
                  rules={[requiredValidator(), regexValidator("ukShortCode",alphaNumRegex)]}
                >
                  <Input
                  className="custom-input-field outline-0"
                  placeholder="Enter UK SortCode"
                  type="input"
                  autoComplete="off"
                  maxLength={100}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                </FormInstance.Item>
              </PayeeFormInput>
            }
          </>}
          {selectedCoin === 'EUR' &&
            <PayeeFormInput isRequired={true} label={"IBAN"}>
              <FormInstance.Item
                name={"iban"}
                className="text-left mb-0 relative"
                rules={[requiredValidator(), regexValidator("iban",alphaNumRegex)]}
              >
                <Input
                  className="custom-input-field outline-0"
                  placeholder="Enter IBAN Number"
                  type="input"
                  autoComplete="off"
                  maxLength={20}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormInstance.Item>
              <Button type='button' htmlType="primary" className="absolute top-0 right-0 hover:!transform-none hover:!transition-none bg-advcard border border-primaryColor text-primaryColor rounded-l-none rounded-r-5 h-[39px] disabled:cursor-not-allowed"
                onClick={handleValidate}
                loading={false}
                disabled={!iban}
              >
                Validate
              </Button>
            </PayeeFormInput>            
          }
        </div>
        {state.bankDetailsLoader && <ContentLoader />}
            {!state.bankDetailsLoader && state.bankDetails && selectedCoin === 'EUR' && 
              <div className="transaction-details transaction-details mt-2.5">
                <div className="">
                  <div className="summary-list-item">
                    <div className=" summary-label">
                      Bank Name
                    </div>
                    <div className=" summary-text">
                      {state.bankDetails?.bankName || "--"}
                    </div>
                  </div>
                  <div className="summary-list-item">
                    <div className=" summary-label">
                      BIC
                    </div>
                    <div className=" summary-text">{state.bankDetails?.routingNumber || "--"}</div>
                  </div>
                  <div className="summary-list-item">
                    <div className=" summary-label">
                      Branch
                    </div>
                    <div className=" summary-text">{state.bankDetails?.branch || "--"}</div>
                  </div>
                  <div className="summary-list-item">
                    <div className=" summary-label">Country</div>
                    <div className=" summary-text">
                      {state.bankDetails?.country || "--"}
                    </div>
                  </div>
                  <div className="summary-list-item">
                    <div className=" summary-label">State</div>
                    <div className=" summary-text">{state.bankDetails?.state || "--"}</div>
                  </div>
                  <div className="summary-list-item">
                    <div className=" summary-label">City</div>
                    <div className=" summary-text">{state.bankDetails?.city || "--"}</div>
                  </div>
                  <div className="summary-list-item">
                    <div className=" summary-label">Zip</div>
                    <div className='summary-text'>
                      {state.bankDetails?.zipCode || "--"}
                    </div>
                  </div>
                </div>
              </div>}
      </div>
    </div>
  );
};
BankDetailsForm.propTypes = {
  setField: PropTypes.func,
  lookups: PropTypes.object,
};
export default BankDetailsForm;