import { useCallback } from "react";
import PayeeFormInput from "../formInput";
import { Input, Select } from "antd";
import {
  nameRegex,
  phoneNoRegex,
  replaceExtraSpaces,
  validations,
} from "../../../core/shared/validations";
import PhoneCodeDropdown from '../../../core/shared/phCodeDropdown';
import { decryptAES } from "../../../core/shared/encrypt.decrypt";
const { requiredValidator, textValidator, regexValidator } =
  validations;

const RecipientInfo = ({ FormInstance, setField, isDrawer, lookups, form, customerInfo = {}, isFirstParty, props ,isFormEditable}) => {
  const selectedAccountType = form?.getFieldValue('accountTypeDetails') === "personal";
  const handleChange = useCallback((e) => {
    setField?.(e.target.id, e.target.value);
  }, [setField]);
  const handleBlur = useCallback((e) => {
    setField(e.target.id, replaceExtraSpaces(e.target.value));
  }, [setField]);
  const handlePhoneNumberInputChange = useCallback((e) => {
    if (e.target.value.length > 16) {
      e.target.value = e.target.value?.slice(0, 16);
    }
    setField?.(e.target.id, e.target.value);
  }, [setField]);

  const shouldUpdateAccountType = useCallback(
    (prevValues, currValues) => prevValues.accountTypeDetails !== currValues.accountTypeDetails,
    []
  );

  const handleKeyDown = useCallback((e) => {
    if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
      e.preventDefault();
    }
  }, []);
  const handleRelationSelect = useCallback((value) => {
    setField('relation', value);
  }, [setField]);
  const isFieldDisabled = (fieldName) => {
    const encryptedFields = ['email', 'phoneCode', 'phoneNumber', 'reference'];
    const formValue = form.getFieldValue(fieldName);
    let customerInfoValue = customerInfo[fieldName];
    if(fieldName === 'birthDate'){
      customerInfoValue = customerInfo['dob'];
    }
    if (encryptedFields.includes(fieldName) && customerInfoValue) {
      customerInfoValue = decryptAES(customerInfoValue);
    }
    return formValue === customerInfoValue && !!formValue;
  };
  return (
    <div className="">
      <div>
        <h1 className="text-xl text-titleColor font-semibold mb-3 capitalize">
          Recipient
        </h1>
      </div>
      {isFirstParty && 
      <div className="kpicardbg border border-StrokeColor mb-5">
             <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-4 grid-cols-1">
              {!selectedAccountType && (<>
             <div>
              <h5 className="mb-0 text-paraColor text-sm font-medium">Business Name</h5>
              <p className="mb-0 text-subTextColor text-sm font-semibold break-words whitespace-pre-line">
                {form?.getFieldValue('businessName') || '--'}
                </p>
            </div>
            </>)}{selectedAccountType && (<>
              <div>
                <h5 className="mb-0 text-paraColor text-sm font-medium">First Name</h5>
                <p className="mb-0 text-subTextColor text-sm font-semibold break-words whitespace-pre-line">
                  {form?.getFieldValue('firstName') || '--'}
                  </p>
              </div>
              <div>
                <h5 className="mb-0 text-paraColor text-sm font-medium"> Last Name</h5>
                <p className="mb-0 text-subTextColor text-sm font-semibold break-words whitespace-pre-line">
                  {form?.getFieldValue('lastName') || '--'}
                  </p>
              </div>
            </>)}
              <div>
              <h5 className="mb-0 text-paraColor text-sm font-medium">Phone Number</h5>
              <p className="mb-0 text-subTextColor text-sm font-semibold">
                {form?.getFieldValue('phoneCode')}{" "}{form?.getFieldValue('phoneNumber') || '--'}
                </p>
            </div>
            <div>
              <h5 className="mb-0 text-paraColor text-sm font-medium">Email</h5>
              <p className="mb-0 text-subTextColor text-sm font-semibold">
                {form?.getFieldValue('email') || '--'}
                </p>
            </div>
          </div>
      </div>}
      {!isFirstParty && (<> 
      <FormInstance.Item
        shouldUpdate={shouldUpdateAccountType}
      >
        {({ getFieldValue }) => (
          <div
            className={`${props?.IsOnTheGo
                ? "flex-1 space-y-5 basicinfo-form"
                : "grid xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 gap-5 basicinfo-form"
              }`}
          >
            {getFieldValue("accountTypeDetails") === "personal" && (
              <>
                <PayeeFormInput
                  isRequired={true}
                  label={"First Name"}
                >
                  <FormInstance.Item
                    name="firstName"
                    className="text-left relative mb-0"
                    rules={[
                      requiredValidator(),
                      regexValidator("first name", nameRegex),
                    ]}
                    shouldUpdate={shouldUpdateAccountType}
                  >
                    <Input
                      className="custom-input-field outline-0"
                      placeholder="Enter First Name"
                      type="input"
                      autoComplete="off"
                      maxLength={50}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isFieldDisabled("firstName")|| !isFormEditable}
                    />
                  </FormInstance.Item>
                </PayeeFormInput>
                <PayeeFormInput
                  isRequired={true}
                  label={"Last Name"}
                  className="col-start-1"
                >
                  <FormInstance.Item
                    name="lastName"
                    className="text-left mb-0"
                    rules={[
                      requiredValidator(),
                      regexValidator("last name", nameRegex),
                    ]}
                  >
                    <Input
                      className="custom-input-field outline-0"
                      placeholder="Enter Last Name"
                      type="input"
                      autoComplete="off"
                      maxLength={50}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isFieldDisabled("lastName") || !isFormEditable}
                    />
                  </FormInstance.Item>
                </PayeeFormInput>
              </>
            )}
            {getFieldValue("accountTypeDetails") === "business" && !isFirstParty &&(<>
              <PayeeFormInput
                isRequired={true}
                label={"Business Name"}
              >
                <FormInstance.Item
                  name="businessName"
                  className="text-left mb-0"
                  rules={[
                    requiredValidator(),
                    textValidator(
                      "business name",
                      "alphaNumWithSpaceAndSpecialChars"
                    ),
                  ]}
                >
                  <Input
                    className="custom-input-field outline-0"
                    placeholder="Enter Business Name"
                    type="input"
                    autoComplete="off"
                    maxLength={50}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isFieldDisabled("businessName") || !isFormEditable}
                  />
                </FormInstance.Item>
              </PayeeFormInput>
              <div></div>
            </>)}
            {!isFirstParty &&(<>
            <PayeeFormInput isRequired={true} label={"Email"}>
              <FormInstance.Item
                name="email"
                className="text-left mb-0"
                rules={[textValidator("email", "email"), requiredValidator()]}
                isRequired={true}
              >
                <Input
                  className="custom-input-field outline-0"
                  placeholder="Enter Email"
                  type="input"
                  autoComplete="off"
                  maxLength={50}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isFieldDisabled("email") || !isFormEditable}
                />
              </FormInstance.Item>
            </PayeeFormInput>
            <div className={`flex country-form-item relative select-hover ${isDrawer ? 'md:col-span-2' : ''}`}>
              <div className="custom-input-lablel">
                Phone number <span className="text-requiredRed">*</span>
              </div>
              <FormInstance.Item
                name="phoneCode"
                className='mb-0 outline-none'
                colon={false}
                rules={[requiredValidator()]}
                dependencies={['phoneNumber']}
              >
                <PhoneCodeDropdown shouldUsePropsList={true} codes={lookups?.phoneCodes} className={"!w-36"}
                  disabled={isFieldDisabled("phoneCode") || !isFormEditable} />
              </FormInstance.Item>
              <FormInstance.Item
                name="phoneNumber"
                className='mb-0 w-full'
                colon={false}
                rules={[
                  regexValidator("phone number", phoneNoRegex, false),
                  requiredValidator()
                ]}
                dependencies={['phoneCode']}
              >
                <Input placeholder='Enter Number'
                  // type="number"
                  onKeyDown={handleKeyDown}
                  onInput={handlePhoneNumberInputChange}
                  className='bg-inputBg border border-dbkpiStroke text-lightWhite p-2 outline-0 rounded-l-none rounded h-[52px]'
                  disabled={isFieldDisabled("phoneNumber") || !isFormEditable}
                />
              </FormInstance.Item>
            </div>
            </>)}
             {form?.getFieldValue('addressTypeDetails') === "3rd Party" &&
             <PayeeFormInput isRequired={true} label={"Relation"}>
              <FormInstance.Item
                name={"relation"}
                className="mb-0 custom-select-float "
                autoComplete="off"
                rules={[requiredValidator()]}
              >
                <Select
                  showSearch
                  allowClear
                  className=""
                  placeholder="Select Relation"
                  onSelect={handleRelationSelect}
                  fieldNames={{ label: 'name', value: 'name' }}
                  options={selectedAccountType ? lookups?.individualLookup : lookups?.businessLookup || []}
                  disabled={isFirstParty && !!form.getFieldValue("relation") || !isFormEditable}
                />
              </FormInstance.Item>
            </PayeeFormInput>
             }
          </div>
        )}
      </FormInstance.Item>
      </>)}
    </div>
  );
};

export default RecipientInfo;