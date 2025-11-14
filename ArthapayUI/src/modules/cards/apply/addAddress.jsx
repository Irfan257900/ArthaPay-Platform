import { Alert, Button, Form, Input, Select, Switch } from "antd";
import { Option } from "antd/lib/mentions";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { connect, useSelector } from "react-redux";
import CountriesCode from "../../../utils/countries.json";
import { NumericFormat } from "react-number-format";
import { editAddressSave, getCountryTownLu, saveNewAddressDetails } from "../httpServices";
import { deriveErrorMessage } from "../../../core/shared/deriveErrorMessage";
import { phoneNoRegex, streetAddressRegex, validations } from "../../../core/shared/validations";

const AddAddress = (props) => {
    const [form] = Form.useForm();
    const navigate = useNavigate()
    const params = useParams()
    const [errorMessage, setErrorMessage] = useState()
    const [countryLookUp, setCountryLookUp] = useState()
    const [townLookUp, setTownLookUp] = useState(null)
    const [buttonLoader, setButtonLoader] = useState()
    const addressRef = useRef(null)
    const [filteredCodeCountries, setFilteredCodeCountries] = useState([...CountriesCode]);
    const ipRegisteryValues = useSelector((store) => store.userConfig?.trackAuditLogData?.Location);
    let createdDate = new Date().toISOString()
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        country: "",
        state: "",
        city: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        phoneNumber: "",
        phoneCode: `+${ipRegisteryValues?.calling_code}`,
        email: ""
    });

    useEffect(() => {
        getCountryLU()
    }, [])
    useEffect(() => {
        phonecodeOptions()
    }, [])
    useEffect(() => {
        if (props?.selectedAddress) {
            form.setFieldsValue({ ...props?.selectedAddress })
            setFormData({ ...props?.selectedAddress })
        }
    }, [props?.selectedAddress])
    const phonecodeOptions = () => {
        let optionsphone = [];
        for (let i in CountriesCode) {
            optionsphone.push({
                label: `${CountriesCode[i].name}(${CountriesCode[i].dial_code})`,
                value: CountriesCode[i].dial_code,
                key: CountriesCode[i].name
            });

        }
        setFilteredCodeCountries([...optionsphone]);
    }
    const setFieldValue = (field, value) => {
        form.setFieldsValue({ [field]: value });
        setFormData(prevData => ({
            ...prevData,
            [field]: value
        }));
        if (field === "country") {
            getStates(value)
        }
    }
    const backtoView = () => {
        navigate(`/cards/apply/${params?.cardId}/address`);
    }
    const countryLU = (response) => {
        if (props?.selectedAddress?.country !== null) {
            let _towns = response?.find((item) => item?.name === props?.selectedAddress?.country);
            setTownLookUp(_towns?.towns);
            setCountryLookUp();
        }
    }
    const getCountryLU = async () => {
        await getCountryTownLu(countryLU, setErrorMessage);
    }
    const getStates = (country) => {
        let cuntriesObj = countryLookUp.filter(item => item.Name == country)[0];
        setTownLookUp(cuntriesObj?.States)
    }
    const setSaveAddressDetails = (response) => {
        try {
            if (response) {
                setButtonLoader(false)
                addressRef.current?.scrollIntoView(0, 0);
                navigate(`/cards/apply/${params?.cardId}/address`)
            }
            else {
                setButtonLoader(false)
                setErrorMessage(response)
                addressRef.current?.scrollIntoView(0, 0);
            }
        } catch (error) {
            setErrorMessage(deriveErrorMessage(error))
        }
    }
    const saveNewAddress = async () => {
        try {
            setButtonLoader(true)
            let saveObj = {
                ...formData,
                id: params.cardId,
                customerId: props?.userConfig?.id,
                createdBy: props?.userConfig?.name,
                createdDate: createdDate,
            }
            const urlParams = { id: props?.userConfig?.id, obj: saveObj }
            await saveNewAddressDetails(setButtonLoader, setSaveAddressDetails, setErrorMessage, urlParams);
        } catch (error) {
            setErrorMessage(deriveErrorMessage(error))
        }
    }

    const editSaveAddress = async () => {
        try {
            setButtonLoader(true)
            let saveObj = {
                ...form.getFieldsValue(),
                id: params?.addressId,
                customerId: props?.userConfig?.id,
                modifiedBy: props?.userConfig?.name,
                modifiedDate: createdDate,
                phoneCode: formData?.phoneCode

            }
            const urlParams = { id: props?.userConfig?.id, obj: saveObj }
            await editAddressSave(setButtonLoader, setSaveAddressDetails, setErrorMessage, urlParams);
        } catch (error) {
            setErrorMessage(deriveErrorMessage(error))
        }
    }

    const saveAddress = useCallback(() => {
        if (params?.mode === "add") {
            saveNewAddress()
        }
        else {
            editSaveAddress()
        }
    },[params])
    const handleCountry =  useCallback((e) => {
        setFieldValue("country", e);
        setFieldValue("town", null);
        setFieldValue('state', '');
        let _country = countryLookUp?.find((item) => item?.name === e);
        setTownLookUp(_country?.towns);
    },[form,countryLookUp,townLookUp])
    const handleChange = useCallback((e) => { 
        setFieldValue(e.target.id, e.target.value);
    }, [form,setFieldValue]);
    const handlePhoneCodeChange = useCallback((e) => {
        setFieldValue("phoneCode", e);
    }, [form,setFieldValue]);
    const filterPhoneCodeOptions = useCallback((input, option) => {
        return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
    }, []);
    const handleSwitchChange = useCallback((checked) => {
        setFieldValue("isDefault", checked);
    }, [form,setFieldValue]);
    const handleTown = useCallback((e) => { 
        setFieldValue("town", e);
    }, [form,setFieldValue]);
    const clearErrorMsg = useCallback(()=>{
        setErrorMessage(null);
    },[])
    return (
        <div className="addpayee-star">

            <div ref={addressRef}></div>

            <div className="panel-card buy-card payees-screen">
                <h3 className="bal-title m-0 text-white mb-60 pl-16">
                    <span className="icon lg btn-arrow-back cursor-pointer" onClick={() => backtoView()}></span>
                    {params?.mode === "add" ? "Add Address" : "Edit Address"}
                </h3>
                <Form
                    form={form}
                    className="payees-form custom-label mb-0 fw-400 summary-width"
                    scrollToFirstError
                    onFinish={saveAddress}
                >
                    <div className="mt-4">
                        {errorMessage && (
                            <div className="alert-flex mb-24">
                                <Alert
                                    type="error"
                                    description={errorMessage}
                                    onClose={clearErrorMsg}
                                    showIcon
                                />
                                <span className="icon sm alert-close c-pointer" onClick={clearErrorMsg}></span>
                            </div>
                        )}
                        <Form.Item
                            className="payees-input mt-4 mb-4 required-reverse"
                            name="firstname"
                            label="First Name"
                            rules={[{ required: true, message: 'Is required' },
                            { whitespace: true, message: 'Invalid First Name' },
                            validations.textValidator('First Name', 'alphaNumWithSpaceAndSpecialChars')
                            ]}
                            colon={false}
                        >
                            <input
                                className="custom-input-field"
                                placeholder="Enter First Name"
                                type="input"
                                maxLength={100}
                                defaultValue={form.getFieldValue("firstname")}
                                onChange={handleChange}

                            />
                        </Form.Item>
                        <Form.Item
                            className="payees-input mt-4 mb-4 required-reverse"
                            name="lastname"
                            label="Last Name"
                            rules={[{ required: true, message: 'Is required' },
                            { whitespace: true, message: 'Invalid Last Name' },
                            validations.textValidator('Last Name', 'alphaNumWithSpaceAndSpecialChars')]}
                            colon={false}
                        >
                            <input
                                className="custom-input-field"
                                placeholder="Enter Last Name"
                                type="input"
                                maxLength={100}
                                onChange={handleChange}
                            />
                        </Form.Item>

                        <div className={`text-left payee-field p-relative`}>
                            <div className="payee-token p-absolute ">
                                <div className="payee-coinselect">
                                    <div className="mbl-ellipse">
                                        <span className="payee-label">
                                            Country <span className="text-requiredRed">*</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-left ">
                                <Form.Item
                                    name="country"
                                    rules={[{ required: true, message: "Is required" }]}
                                    className="mb-4"
                                    colon={false}
                                >
                                    <Select
                                        name="country"
                                        showSearch
                                        onChange={handleCountry}
                                        placeholder="Select Country"
                                        className="payee-input input-bordered"
                                        maxLength={30}
                                        type="input"
                                    >
                                        {countryLookUp?.map((item) => (
                                            <Option key={item.name} value={item.name}>
                                                {item.name}
                                            </Option>
                                        ))}

                                    </Select>
                                </Form.Item>
                            </div>
                        </div>

                        <div className={`text-left payee-field p-relative`}>
                            <Form.Item
                                className="payees-input mt-4 mb-4 required-reverse"
                                name="state"
                                label="State"
                                rules={[{ required: true, message: 'Is required' },
                                { whitespace: true, message: 'Invalid State' },
                                validations.textValidator('state', 'alphaNumWithSpaceAndSpecialChars')]}
                                colon={false}
                            >
                                <input
                                    className="custom-input-field"
                                    placeholder="Enter State"
                                    type="input"
                                    maxLength={100}
                                    onChange={handleChange}
                                />
                            </Form.Item>
                        </div>
                        <div className={`text-left payee-field p-relative`}>
                            <div className="payee-token p-absolute ">
                                <div className="payee-coinselect">
                                    <div className="mbl-ellipse">
                                        <span className="payee-label">
                                            Town <span className="text-requiredRed">*</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-left">
                                <Form.Item
                                    className="mb-4"
                                    name="town"
                                    rules={[
                                        { required: true, message: "Is required" },
                                        { whitespace: true, message: 'Invalid  Town' },
                                    ]}
                                >
                                    <Select
                                        showSearch
                                        className=" payee-input input-bordered"
                                        placeholder="Select Town"
                                        type="input"
                                        maxLength={100}
                                        onChange={handleTown}
                                    >
                                        {townLookUp?.map((item) => (
                                            <Option key={item.name} value={item.name}>
                                                {item.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </div>
                        </div>
                        <Form.Item
                            className="payees-input mt-4 mb-4 required-reverse"
                            name="city"
                            label="City"
                            rules={[{ required: true, message: 'Is required' },
                            { whitespace: true, message: 'Invalid City' },
                            validations.textValidator('city', 'alphaNumWithSpaceAndSpecialChars')]}
                            colon={false}
                        >
                            <input
                                className="custom-input-field"
                                placeholder="Enter City"
                                type="input"
                                maxLength={100}
                                onChange={handleChange}
                            />
                        </Form.Item>

                        <Form.Item
                            className="payees-input mt-4 mb-4 required-reverse"
                            name="addressLine1"
                            label="Address Line 1"
                            rules={[
                                validations.requiredValidator(),
                                validations.regexValidator('address line 1', streetAddressRegex),
                                { whitespace: true, message: 'Invalid address line 1' },
                            ]}
                            colon={false}
                        >
                            <input
                                className="custom-input-field"
                                placeholder="Enter Address Line 1"
                                type="input"
                                maxLength={100}
                                onChange={handleChange}
                            />
                        </Form.Item>

                        <Form.Item
                            className="payees-input mt-4 mb-4 required-reverse"
                            name="addressLine2"
                            label="Address Line 2"
                            rules={[
                                validations.regexValidator('address line 2', streetAddressRegex),
                                { whitespace: true, message: 'Invalid address line 2' },
                            ]}
                            colon={false}
                        >
                            <input
                                className="custom-input-field"
                                placeholder="Enter Address Line 2"
                                type="input"
                                maxLength={100}
                                onChange={handleChange}
                            />
                        </Form.Item>

                        <Form.Item
                            className="payees-input mt-4 mb-4 required-reverse"
                            name="postalCode"
                            label="Postal Code"
                            rules={[validations.requiredValidator(),
                            validations.postalCodeValidator("postal code"),
                            { whitespace: true, message: 'Invalid postal code' }]}
                            colon={false}
                        >
                            <NumericFormat
                                className="custom-input-field is-error-br"
                                placeholder="Enter Postal Code"
                                maxLength={6}
                                onChange={handleChange}
                            />
                        </Form.Item>

                        <Form.Item
                            className=" mb-8 px-4 text-white-50 custom-forminput p-relative custom-label pt-8 sc-error form-arrowicon auth0-cust-form"
                            name="phoneNumber"
                            label="Phone"
                            required
                            rules={[
                                validations.requiredValidator(),
                                validations.regexValidator("phone number", phoneNoRegex, false),
                            ]}>
                            <Input
                                addonBefore={
                                    <Form.Item
                                        name="phoneCode"
                                        className="mb-0"
                                    >
                                        <Select
                                            style={{ width: '150px' }}
                                            className="Approved field-width"
                                            showSearch
                                            name="phoneCode"
                                            defaultValue={formData?.phoneCode}
                                            placeholder="Phone Code"
                                            optionFilterProp="children"
                                            onChange={handlePhoneCodeChange}
                                            value={formData?.phoneCode}
                                            filterOption={filterPhoneCodeOptions}
                                            options={filteredCodeCountries}

                                        />
                                    </Form.Item>}
                                className="cust-input form-disable phone-he c-pointer cust-phone"
                                minLength={4}
                                maxLength={12}
                                placeholder='Enter Phone'
                                onChange={handleChange} />
                        </Form.Item>

                        <Form.Item
                            className="payees-input mt-4 mb-4 required-reverse"
                            name="email"
                            label="Email"
                            rules={[{ required: true, message: 'Is required' },
                            { whitespace: true, message: 'Invalid Email' },
                            validations.textValidator('email', 'email')]}
                            colon={false}
                        >
                            <input
                                className="custom-input-field"
                                placeholder="Enter Email"
                                type="input"
                                maxLength={100}
                                onChange={handleChange}
                            />
                        </Form.Item>
                        <div className={`text-left payee-field p-relative`}>
                            <div className="payee-token p-absolute ">
                                <div className="payee-coinselect">
                                    <div className="mbl-ellipse">
                                        <span className="payee-label">
                                            Set as Default
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-left ">
                                <Form.Item
                                    name="isDefault"
                                    className="mb-4"
                                    colon={false}
                                >
                                    <Switch className="ml-12 mt-16" checked={form.getFieldValue("isDefault")} onChange={handleSwitchChange} />
                                </Form.Item>
                            </div>
                        </div>

                        <Form.Item className="my-30">
                            <Button block className="btn-style" htmlType="submit" loading={buttonLoader} style={{ marginTop: '36px' }}>
                                SAVE
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
            </div>
        </div>




    )
}
const connectStateToProps = ({ userConfig, applyCard }) => {
    return {
        userConfig: userConfig.details,
        selectedAddress: applyCard?.selectedAddress?.data
    };
};

export default connect(connectStateToProps)(AddAddress);