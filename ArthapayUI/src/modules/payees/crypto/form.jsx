import React, { useCallback, useEffect, useReducer } from "react"
import { connect, useSelector } from "react-redux";
import { v4 as uuidv4 } from 'uuid';
import AppAlert from "../../../core/shared/appAlert";
import { Form as AntForm, Input, message, Radio, Select } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { fetchKpis, fetchRecentActivityGraphData, setCryptoPayeeDetails } from "../../../reducers/payees.reducer";
import { validateAddressType, getaddressFormat, favNameRegex, validations, nameRegex, replaceExtraSpaces, VALIDATION_ERROR_MESSAGES } from "../../../core/shared/validations";
import { cryptoFormReducer, cryptoFormState } from "../reducer";
import { walletAddressTypes } from "../service";
import AppDefaults from "../../../utils/app.config";
import { useNavigate, useOutletContext, useParams, useSearchParams } from "react-router";
import PayeeFormInput from "../formInput";
import CustomButton from '../../../core/button/button';
import { fetchPayeeInfo, getSatoshiDetails, handleCryptoPayeeSave, getFiatCurrencies } from "../http.services";
import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader";
const { requiredValidator, regexValidator, emojiRejectValidator,textLengthValidator } = validations
const icon = <WarningOutlined />;

const Form = (props) => {
  const [state, setState] = useReducer(cryptoFormReducer, cryptoFormState)
  const trackAuditLogData = useSelector(
    (store) => store.userConfig.trackAuditLogData
  );
  const [form] = AntForm.useForm();
  const [urlParams] = useSearchParams()
  const navigate = useNavigate();
  const { id, mode, name } = useParams();
  const payeeDivRef = React.useRef(null);
  const outletContext = useOutletContext();
  const fetchPayees = outletContext?.fetchPayees;
  const IsOnTheGo = props && props.IsOnTheGo ? props.IsOnTheGo : false;
  useEffect(() => {
    form.resetFields()
    getDetails();
  }, [mode]); //eslint-disable-line react-hooks/exhaustive-deps
  const setError = (error, type = "error") => {
    payeeDivRef.current?.scrollIntoView({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    setState({ type: "setError", payload: { message: error, type: type }, });
  };
  const setLoading = (payload) => {
    setState({ type: 'setLoading', payload: payload });
  };
  const setLookups = (key, data) => {
    setState({ type: "setLookups", payload: { [key]: data } });
  };


  const getDetails = async () => {
    setLoading('data')
    try {
      const formData = mode === 'edit' ? await fetchPayeeInfo({ type: "crypto", id, mode: mode }) : { addressType: walletAddressTypes[0].value, currency: urlParams.get('coin') || props.selectedCoin || undefined, network: urlParams.get('network') || props.selectedNetwork || undefined }
      const [lookups] = await Promise.all([getFiatCurrencies()]);
      setState({ type: "setLookupsData", payload: lookups });
      const cryptoCoins = lookups?.cryptoCurrency;
      const selfHosted = lookups?.ProofTypes;
      let walletSources = null;
      walletSources = formData?.addressType === 'FirstParty-WalletSource'
        ? lookups?.['FirstParty-WalletSources']
        : lookups?.['WalletSources'];
      if (mode === 'edit' && formData.walletType) {
        formData.selfHosted = formData.walletType;
      }
      form.setFieldsValue(formData)
      formData?.currency && handleWalletCode(formData?.currency, cryptoCoins)
      setState({ type: "setLookups", payload: { cryptoCoins, walletSources, selfHosted } });
      setState({ type: 'setShowProofType', payload: formData?.walletSource === "Self Hosted" });
      props.dispatch(setCryptoPayeeDetails(null));
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading('')
    }
  };

  const saveCryptoPayee = async (values) => {
    const { satoshiDetails, ...saveObj } = values
    const response = await handleCryptoPayeeSave(saveObj, satoshiDetails, props?.userConfig, mode, trackAuditLogData, IsOnTheGo);
    if (response) {
      setError('');
      if (fetchPayees && mode !=='edit') fetchPayees(1);
      props.dispatch(setCryptoPayeeDetails({ formData: { ...saveObj }, satoshiDetails: satoshiDetails, saveResponse: { ...response } }));
      props.dispatch(fetchKpis({ showLoading: false }))
      props.dispatch(fetchRecentActivityGraphData({ showLoading: false }));
      switch (values?.selfHosted) {
        case 'Sathoshi Test':
          navigate(`/payees/crypto/${id}/${name}/${mode}/satoshitest`);
          break;
        case 'Self':
          navigate(`/payees/crypto/${id}/${name}/${mode}/selfsign`);
          break;
        default:
          message.success({
            content: mode === "add" || props.mode === "add" ? "Payee saved successfully." : "Payee updated successfully.",
            className: "custom-msg",
            duration: 3,
          });
          if (props.isDrawer) {
            props?.onSuccess?.()
          }
          else {
            navigate(`/payees/crypto/${id}/${name}/${mode}/success`);
          }
          break;
      }
    }
  }

  const submit = useCallback(async () => {
    const rawValues = { ...form.getFieldsValue(true) };
    const values = Object.keys(rawValues).reduce((acc, key) => {
      acc[key] = typeof rawValues[key] === 'string' ? rawValues[key]?.trim() : rawValues[key];
      return acc;
    }, {});
    setLoading('save');
    setError('');
    try {
      const newIframeId = uuidv4();
      const addressFormatForUrl = getaddressFormat(values.network, values.walletaddress);
      let fromValues = { ...values, iframId: newIframeId, addressFormatForUrl };

      if (values?.selfHosted === 'Sathoshi Test') {
        const satoshiDetails = await getSatoshiDetails(values?.network, values?.walletaddress);
        fromValues = { ...fromValues, satoshiDetails };
      }

      await saveCryptoPayee(fromValues);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading('');
    }
  }, [form, props]);

  const navigateToView = useCallback(() => {
    if (props?.isDrawer) {
      props?.onCancel?.()
    }
    else if (id !== AppDefaults.GUID_ID) {
      payeeDivRef.current.scrollIntoView(0, 0);
      navigate(
        `/payees/crypto/${id}/${name}/view`
      );
    }
    else {
      payeeDivRef.current.scrollIntoView(0, 0);
      navigate(`/payees/crypto`);
    }
  }, [props, id, AppDefaults, name, payeeDivRef]);

  const validateFields = useCallback(async () => {
    try {
      await form.validateFields()
      form.submit()
    } catch (errors) {
      setError(errors.message);
    }
  }, [form]);

  const setField = async (field, value) => {
    setError('');
    form.setFieldsValue({ ...form.getFieldsValue(true), [field]: value });
    if (field === 'addressType') {
      setLookups('walletSources', value === 'FirstParty-WalletSource' ? state?.lookupsData?.['FirstParty-WalletSources'] || [] : state?.lookupsData?.WalletSources || [])
    }
    if (field === 'currency') {
      form?.resetFields(["network", 'walletaddress', 'walletSource', 'otherWallet', 'selfHosted']);
      form.setFieldsValue({ walletSource: null, otherWallet: null });
      setState({ type: 'setShowProofType', payload: false });
    }
    if (field === 'network') {
      form?.resetFields(['walletaddress',]);
      setState({ type: 'setShowProofType', payload: false });
    }
    if (field === 'walletaddress' && !value) {
      form?.resetFields(['walletSource', 'selfHosted']);
      form.setFieldsValue({ walletSource: null });
      setState({ type: 'setShowProofType', payload: false });
    }
    if (field === 'walletSource') {
      form?.resetFields(['selfHosted']);
    }
  };
  const handleWalletCode = (value, cryptoCoins = state.lookups?.cryptoCoins) => {
    const _networks = cryptoCoins?.find((item) => item?.code === value);
    setLookups('networks', _networks?.details)
  }
  const clearErrorMsg = useCallback(() => {
    setError('');
  }, []);
  const handleChange = useCallback((e) => {
    setField(e.target.id, e.target.value);
  }, [setField]);
  const handleNetworkChange = useCallback((value) => {
    setField("network", value)
  }, [setField]);
  const handleWalletSourceChange = useCallback((value) => {
    setField("walletSource", value)
    if (value === 'Self Hosted') {
      setState({ type: 'setShowProofType', payload: true });
    } else {
      setState({ type: 'setShowProofType', payload: false });
    }
  }, [setField]);

  const handleAddressTypeChange = useCallback((e) => {
    setField(e.target.name, e.target.value);
    form?.resetFields(['walletSource', "network", 'walletaddress', 'currency', 'otherWallet']);
    setState({ type: 'setShowProofType', payload: false });
  }, [setField]);
  const handleWalletCodeChange = useCallback((value) => {
    const _networks = state.lookups?.cryptoCoins?.find((item) => item?.code === value);
    setLookups('networks', _networks?.details)
    form?.resetFields(["network", 'walletaddress', 'walletSource', 'otherWallet']);
    setState({ type: 'setShowProofType', payload: false });
  }, [state]);
  const shouldUpdateWalletSource = useCallback((prev, curr) => {
    return prev.walletSource !== curr.walletSource;
  }, []);
  return (
    <div className="panel-card buy-card card-paddingrm">
      <div ref={payeeDivRef}></div>
      {state.error.message && (
        <div className="alert-flex">
          <AppAlert
            type="error"
            description={state.error.message}
            onClose={clearErrorMsg}
            icon={icon}
            showIcon
          />
          <span
            className="icon sm alert-close c-pointer"
            onClick={clearErrorMsg}
          ></span>
        </div>
      )}
      {state.loading === 'data' &&<ContentLoader/>}
      <AntForm
        className="payees-form payees-rightpanel custom-label  mb-0 fw-400"
        form={form}
        onFinish={submit}
        scrollToFirstError
      >
        {state.loading !== 'data' &&
          <div className="payee-inblock !w-full">
            <div className="">
              <h1
                className="text-xl font-semibold text-titleColor mb-7 capitalize"
              >
                Recipient's Details
              </h1>
              <div className={
                IsOnTheGo 
                ? 'grid grid-cols-1 md:gap-y-6 mt-2' 
                : "grid grid-cols-1 lg:grid-cols-2 gap-6" }
                >

                <PayeeFormInput isRequired={true} label={"Favorite Name"}>
                  <AntForm.Item
                    name="favouriteName"
                    rules={[ requiredValidator(),
                      regexValidator("favorite name", nameRegex),
                      textLengthValidator("favorite name"),
                    ]}
                  >
                    <Input
                      className="custom-input-field outline-0"
                      placeholder="Enter Favorite Name"
                      type="input"
                      maxLength={100}
                      autoComplete="off"
                      onChange={handleChange}
                    />
                  </AntForm.Item>
                </PayeeFormInput>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-titleColor m-0 mb-4 capitalize">Transfer <span  class="text-requiredRed">*</span></h1>
                <div className="accounttype-radio">
                  <AntForm.Item
                    name="addressType"
                    className="text-left mb-0"
                    rules={[requiredValidator()]}
                  >
                    <Radio.Group
                      onChange={handleAddressTypeChange}
                      name="addressType"
                      disabled={mode === "edit"}
                      className="new-custom-radiobtn mb-6 newcustome-radiocheck"
                    >
                      {walletAddressTypes?.map(addType => (
                        <Radio key={addType.title} value={addType.value} className="">
                          {addType.title === "self" ? "1st Party" : addType.title}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </AntForm.Item>
                </div>
              </div>
              <div className={IsOnTheGo ? 
                'grid grid-cols-1 md:gap-y-6 mt-2' 
                : "grid grid-cols-1 lg:grid-cols-2 md:gap-6 mb-6"}
              >
                <div>
                  <PayeeFormInput isRequired={true} label={"Token"}>
                    <AntForm.Item
                      name="currency"
                      rules={[requiredValidator()]}
                      className="custom-select-float relative mb-0"
                    >
                      <Select
                        className="p-0 rounded outline-0 w-full text-lightWhite"
                        placeholder="Select Token"
                        onSelect={handleWalletCodeChange}
                        fieldNames={{ label: 'code', value: 'code' }}
                        options={state.lookups?.cryptoCoins || []}
                      />
                    </AntForm.Item>
                  </PayeeFormInput>
                </div>
                <div>
                  <PayeeFormInput isRequired={true} label={"Network"}>
                    <AntForm.Item
                      name="network"
                      rules={[requiredValidator()]}
                      className="custom-select-float relative mb-0"
                    >
                      <Select
                        className="p-0 rounded outline-0 w-full text-lightWhite"
                        placeholder="Select Network"
                        onSelect={handleNetworkChange}
                        fieldNames={{ label: 'name', value: 'name' }}
                        options={state.lookups?.networks || []}
                      />
                    </AntForm.Item>
                  </PayeeFormInput>
                </div>
              </div>
              <div className="grid grid-cols-1 md:gap-y-6 mt-2">
                <div className="">
                  <PayeeFormInput isRequired={true} label={"Wallet Address"}>
                    <AntForm.Item
                      name="walletaddress"
                      className="mb-0"
                      rules={[
                        requiredValidator(),
                        {
                          validator: (_, value) => {
                            const coin = form.getFieldValue('currency');
                            if (coin === 'XSGD' || coin === 'MYRC') {
                              return validateAddressType(value, 'erc-20')
                            }
                            const network = form.getFieldValue('network');
                            return validateAddressType(value, network)
                          }
                        },
                      ]}
                    >
                      <Input
                        className="custom-input-field outline-0"
                        placeholder="Enter Wallet Address"
                        type="input"
                        maxLength={150}
                        autoComplete="off"
                        onChange={handleChange}
                        onBlur={(e) =>
                          setField("walletaddress", replaceExtraSpaces(e.target.value))
                        }
                      />
                    </AntForm.Item>
                  </PayeeFormInput>
                </div>
                <div className="">
                  <PayeeFormInput isRequired={true} label={"Source"}>
                    <AntForm.Item
                      className="text-left mb-0 custom-select-float"
                      name="walletSource"
                      rules={[requiredValidator()]}
                    >
                      <Select
                        className="p-0 rounded outline-0 w-full text-lightWhite"
                        placeholder="Select Source"
                        onSelect={handleWalletSourceChange}
                        fieldNames={{ label: 'name', value: 'code' }}
                        options={state.lookups?.walletSources || []}
                      />
                    </AntForm.Item>
                  </PayeeFormInput>
                </div>
                <div>
                  {/* <AntForm.Item shouldUpdate={shouldUpdateWalletSource} className="mb-0 mt-3">
                    {({ getFieldValue }) => {
                      return <>
                        {getFieldValue('walletSource') === 'Others' && <div className={`text-left payee-field p-relative`}>
                          <div className="payee-token p-absolute ">
                            <div className="payee-coinselect">
                              <div className="mbl-ellipse">
                                <span className="payee-label text-labelGrey">
                                  Please specify other wallet <span className="text-requiredRed">*</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <AntForm.Item
                              className="text-left mb-4"
                              name="otherWallet"
                              rules={[requiredValidator(), regexValidator('source name', nameRegex)]}
                            >
                              <input
                                className="custom-input-field"
                                placeholder="Enter source"
                                type="input"
                                maxLength={150}
                                autoComplete="off"
                                onChange={(e) =>
                                  setField("otherWallet", e.target.value)
                                }
                                onBlur={(e) =>
                                  setField("otherWallet", replaceExtraSpaces(e.target.value))
                                }
                              />
                            </AntForm.Item>
                          </div>
                        </div>}
                      </>
                    }}
                  </AntForm.Item> */}
                  {state.showProofType && <AntForm.Item shouldUpdate={shouldUpdateWalletSource} className="mt-0">
                    {({ getFieldValue }) => {
                      return <>
                        {getFieldValue('walletSource') === 'Self Hosted' && <div className={`text-left payee-field p-relative`}>
                          <div className="text-left">
                            <PayeeFormInput isRequired={true} label={"Proof Type"}>
                              <AntForm.Item
                                className="text-left mb-0 custom-select-float"
                                name="selfHosted"
                                rules={[requiredValidator()]}
                              >
                                <Select
                                  className="p-0 rounded outline-0 w-full text-lightWhite"
                                  placeholder="Select Proof Type"
                                  fieldNames={{ label: 'name', value: 'code' }}
                                  options={state.lookups?.selfHosted || []}
                                />
                              </AntForm.Item>
                            </PayeeFormInput>
                          </div>
                        </div>}
                      </>
                    }}
                  </AntForm.Item>}
                  <PayeeFormInput isRequired={true} label={"Remarks"}>
                    <AntForm.Item
                      name="otherWallet"
                      rules={[requiredValidator(), emojiRejectValidator('Remarks')]}
                    >
                      <Input
                        className="custom-input-field outline-0"
                        placeholder="Enter Remarks"
                        type="input"
                        maxLength={100}
                        autoComplete="off"
                        onChange={(e) =>
                          setField("otherWallet", e.target.value)
                        }
                        onBlur={(e) =>
                          setField("otherWallet", replaceExtraSpaces(e.target.value))
                        }
                      />
                    </AntForm.Item>
                    {IsOnTheGo &&<div className='mt-2 mb-6 !text-left border border-StrokeColor p-3 rounded-5'>
                      <p className="font-medium mb-1">Note </p>
                      <p>Your payee will be available after 10 minutes for transactions.</p>
                    </div>}
                  </PayeeFormInput>
                </div>
              </div>
            </div>
            <div className="md:flex justify-end items-center md:space-x-4">
              <CustomButton htmlType="reset" onClick={navigateToView} disabled = {state.loading === 'save'}>Cancel</CustomButton>
              {form.getFieldValue('whiteListState') !== "Approved" && (
                <CustomButton
                  type="primary"
                  loading={state.loading === 'save'}
                  onClick={validateFields}
                >
                  <span>Save</span>
                </CustomButton>
              )}
            </div>
          </div>
        }

      </AntForm>
    </div>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return { userConfig: userConfig.details };
};
const connectDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(
  connectStateToProps,
  connectDispatchToProps
)(Form);