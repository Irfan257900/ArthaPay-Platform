import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { NumericFormat } from "react-number-format";
import { Select, Alert, Input, Form as AntForm, Tooltip } from "antd";
import { normalizeFormattedNumber, validations } from "../../../core/shared/validations";
import { useDispatch, useSelector } from "react-redux";
import { getPayoutSummary, ALLOWED_DECIMALS, getCryptoPayees } from "../httpServices";
import { setCryptoDetails } from "../reducers/payout.reducer";
import AppButton from "../../../core/shared/appButton";
import { setSelectedCryptoCoin } from "./payout.accordion.reducer";
import { payoutErrors } from "./payout.constants";
import { useTranslation } from "react-i18next";
import AddPayeeDrawer from "../../../core/shared/addPayee.drawer";
import CriptoFiatLoader from "../../../core/skeleton/cripto.fiat.loader";
import VerificationsHandler from "../../../core/verifications.handler";
import NumericText from "../../../core/shared/numericText";
import AppDefaults from "../../../utils/app.config";
const { requiredValidator } = validations;

const CryptoForm = () => {
  const [form] = AntForm.useForm();
  const { currencyType } = useParams();
  const { Search } = Input;
  const formRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const userProfile = useSelector((info) => info.userConfig.details);
  const selectedMerchant = useSelector((storeInfo) => storeInfo?.payoutAccordianReducer?.selectedCryptoVault);
  const selectedRightFormMerchant = useSelector((storeInfo) => storeInfo?.payoutAccordianReducer?.selectedRightFormCryptoVault);
  const selectedCoin = useSelector((storeInfo) => storeInfo?.payoutAccordianReducer?.selectedCryptoCoin);
  const [loading, setLoading] = useState(false)
  const [currencies, setCurrencies] = useState([]);
  const [networksLu, setNetworksLu] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [payees, setPayees] = useState([]);
  const [selectedPayee, setSelectedPayee] = useState({});
  const [cryptoMinMax, setCryptoMinMax] = useState({});
  const [payeesToDisplay, setPayeesToDisplay] = useState([]);
  const [isDrawer, setIsDrawer] = useState(false);
  const { t } = useTranslation();
  const { setNetworkLu } = useOutletContext();

  useEffect(() => {
    if (selectedMerchant?.details) {
      setCurrencies(selectedMerchant?.details);
    }
    if (selectedCoin?.networks) {
      setNetworksLu(selectedCoin?.networks);
      const firstNetwork = selectedCoin?.networks[0]?.code;
      const networkObj = selectedCoin?.networks?.find((item) => item?.code === firstNetwork);
      setNetworkLu(networkObj)
      setSelectedNetwork(firstNetwork);
      clearErrorMessage();
      form.setFieldsValue({
        currency: selectedCoin?.code,
        network: firstNetwork
      });
      setSelectedPayee(null);
      form.resetFields(['selectedPayee']);
      getPayees();
    }
  }, [selectedMerchant, selectedCoin]);

  useEffect(() => {
    minMaxCrypto();
  }, [selectedNetwork, selectedCoin]);

  useEffect(() => {
    setPayeesToDisplay(payees?.slice(0, 5));
  }, [payees]);



  const handleCurrencyChange = useCallback((currencyCode) => {
    setSelectedCurrency(currencyCode);
    const selectedCurrencyObj = currencies.find((currency) => currency.code === currencyCode);
    dispatch(setSelectedCryptoCoin(selectedCurrencyObj));
    setNetworksLu(selectedCurrencyObj?.networks || []);
    setSelectedNetwork(selectedCurrencyObj?.networks[0]?.code);
    clearErrorMessage();
    form.setFieldsValue({
      network: selectedCurrencyObj?.networks[0]?.code
    });
    setSelectedPayee(null);
    form.resetFields(['selectedPayee']);
  }, [currencies,]);

  const handleNetworkClick = async (networkCode) => {
    setSelectedNetwork(networkCode);
    const selectedNet = networksLu?.find((item) => item?.code === networkCode);
    setNetworkLu(selectedNet);
    form.setFieldsValue({
      network: networkCode
    });
    await getPayees();
    minMaxCrypto();
  };


  const getPayees = async () => {
    const coin = form.getFieldValue('currency');
    const network = form.getFieldValue('network');
    const urlParams = {
      coin: coin,
      network: network
    }
    await getCryptoPayees(urlParams, setPayees, setPayeesToDisplay, setErrorMessage, setLoading)
  }

  const handlePayeeSearch = useCallback((searchTerm) => {
    setSelectedPayee(null);
    const searchValue = searchTerm?.target?.value?.trim().toLowerCase();
    if (!searchValue) {
      setPayeesToDisplay(payees?.slice(0, 5));
    } else {
      const filtered = payees?.filter((item) =>
        item.favoriteName.toLowerCase().includes(searchValue)
      );
      setPayeesToDisplay(filtered);
    }
  }, [payees]);

  const clearErrorMessage = useCallback(() => {
    setErrorMessage(null)
  }, [])
  const navigateToPayees = () => {
    setIsDrawer(true)
  }
  const handlePayeeSelect = (item) => {
    form.setFieldsValue({ selectedPayee: item });
    setSelectedPayee(item)
  };

  const handleAmountChange = (value) => {
    form.setFieldsValue({ requestedAmount: value });
  }

  const handleFormSubmission = useCallback(async () => {
    if (!selectedPayee?.id) {
      setErrorMessage(payoutErrors?.payeeError);
      return;
    }
    const requiredNetwork = networksLu?.find((item) => item?.code === selectedNetwork);
    const customerWalletId = requiredNetwork?.id;
    const { requestedAmount } = form.getFieldsValue(true)
    getPayoutSummary({ userProfile, selectedType: currencyType, fiatCurrency: selectedNetwork, value: requestedAmount, customerWalletId, onSummary, onError: onSummaryError });
  }, [selectedPayee, userProfile, currencyType, form, networksLu])


  const onSummary = (response) => {
    const { finalAmount, quoteId, feeCommission } = response || {}
    const requiredNetwork = networksLu?.find((item) => item?.code === selectedNetwork);
    const customerWalletId = requiredNetwork?.id;
    form.setFieldsValue({ ...form.getFieldsValue(true), finalAmount, quoteId, feeCommission })
    const values = {
      ...form.getFieldsValue(true), summary: response, merchantId: selectedMerchant?.id, customerWalletId: customerWalletId
    };
    dispatch(setCryptoDetails(values));
    navigate(`/payments/payouts/payout/${selectedMerchant?.id}/${selectedMerchant?.merchantName}/summary/${currencyType}`)
  }
  const minMaxCrypto = () => {
    const selectNetworkData = selectedCoin?.networks?.find((network) => network?.code === selectedNetwork);
    if (selectNetworkData) {
      setCryptoMinMax(selectNetworkData);
    }
  }
  const validateAmount = (_, value) => {
    const minAmount = cryptoMinMax?.minLimit;
    const maxAmount = cryptoMinMax?.maxLimit;
    if (value === 0) {
      return Promise.reject('Should be greater than zero');
    }
    if (!value) {
      return Promise.reject('Please Enter Amount');
    }
    if (value && value < minAmount) {
      return Promise.reject(` Should be at least ${minAmount}`);
    }
    if (value && value > selectedNetwork?.balance) {
      return Promise.reject(` Should not exceed ${selectedNetwork?.balance}`);
    }
    if (value && value > maxAmount) {
      return Promise.reject(` Should not exceed ${maxAmount}`);
    }
    return Promise.resolve();
  };
  const onSummaryError = (errorMessage) => {
    setErrorMessage(errorMessage)
  }

  const onSuccessPayee = useCallback(() => {
    setIsDrawer(false);
    getPayees();
  }, [])

  const onCancelPayee = useCallback(() => {
    setIsDrawer(false);
  }, []);

  const normalizedAmount = useCallback((value) => {
    return value ? normalizeFormattedNumber(value) : undefined;
  }, []);

  const handleValueChange = useCallback((data) => {
    const updatedValue = data.floatValue;
    form.setFieldsValue({
      requestedAmount: updatedValue
    });
    handleAmountChange(updatedValue);
  }, [form, networksLu, currencies, selectedPayee]);

  const handleMinAmountClick = useCallback(() => {
    const minAmount = cryptoMinMax?.minLimit;
    form.setFieldsValue({ requestedAmount: minAmount });
    handleAmountChange(minAmount);
  }, [form, cryptoMinMax, networksLu, currencies]);

  const handleMaxAmountClick = useCallback(() => {
    const maxAmount = cryptoMinMax?.maxLimit;
    form.setFieldsValue({ requestedAmount: maxAmount });
    handleAmountChange(maxAmount);
  }, [cryptoMinMax, form, networksLu, currencies]);


  return (
    <div ref={formRef} className="mt-4 custom-payments-field">
      {(errorMessage) && <div className="alert-flex !flex" >
        <Alert
          className="w-100 px-0 py-2"
          type="warning"
          description={errorMessage}
          showIcon
        />
        <button className="icon sm alert-close" onClick={() => clearErrorMessage()}></button>
      </div>}

      <VerificationsHandler
        loader={<CriptoFiatLoader />}
      >
        {((selectedMerchant || selectedRightFormMerchant) && selectedCoin && !loading) && (
          <AntForm onFinish={handleFormSubmission} form={form} className="payout-form">
            <div className=''>
              <div className='lg:w-[465px] mx-auto w-full'>
                {!loading &&
                  <>
                    <div className="">
                      <AntForm.Item className='mt-6 basicinfo-form panel-form-items-bg relative !mb-0'
                        name="currency"
                        rules={[
                          requiredValidator()
                        ]}
                        colon={false}
                      >
                        <Select
                          className="bg-transparent rounded-5"
                          placeholder={t('payments.placeholders.paycoin')}
                          onChange={handleCurrencyChange}
                          value={selectedCurrency}
                          optionLabelProp="children"
                        >
                          {currencies?.map((item) => (
                            <Option value={item?.code} key={item?.code}>
                              <div className="flex items-center gap-2 mb-4">
                                <span>{item?.code}</span>
                                <img
                                  className="rounded-full w-6 h-6"
                                  src={item?.image}
                                // alt={item?.code}
                                />
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </AntForm.Item>
                      <AntForm.Item className='!mb-0 !px-0 basicinfo-form panel-form-items-bg relative mt-4 w-full pt-0.5'
                        name="network"
                        label={t('payments.placeholders.network')}
                        colon={false}
                        rules={[requiredValidator()]}
                      >
                        <div className="flex items-center justify-start flex-wrap gap-2.5 mb-0  w-full  text-lightWhite py-4 px-2 rounded outline-0 min-h-[90px] relative">
                          {networksLu?.map((item) => (
                            <div
                              key={item?.code}
                              className={`rounded-5 py-1.5 px-5 border text-sm font-semibold cursor-pointer ${selectedNetwork === item?.code ? 'bg-primaryColor border-primaryColor text-lightDark' : 'bg-transparent border-primaryColor text-primaryColor'}`}
                              onClick={() => handleNetworkClick(item?.code)}
                            >
                              {item?.name}
                            </div>
                          ))}
                        </div>
                      </AntForm.Item>
                      <div className="mt-1 bg-advcard text-lightWhite p-3.5 rounded-5">
                        <div className='flex items-center gap-1'>
                          <h3 className="text-xs font-normal text-titleColor ">{t('payments.payouts.selectpayee')}</h3>
                          <span className='text-textRed'>*</span>
                        </div>
                        <AntForm.Item
                          className="mb-0 panel-form-items-bg relative"
                          name="selectedPayee"
                          // label={t('payments.payouts.selectpayee')}
                          colon={false}
                          rules={[requiredValidator()]}
                        >
                          <div className="min-h-[42px] relative">
                            <div className="flex items-center gap-2.5">
                              <Search
                                placeholder="Search Payee"
                                onChange={handlePayeeSearch}
                                suffix={<span className="icon md search c-pointer" />}
                                size="middle"
                                className="coin-search-input payout-search"
                              />
                              <div>
                                <Tooltip title={'Add Payee'}>
                                  <span className="icon add cursor-pointer" onClick={navigateToPayees}></span>
                                </Tooltip>
                              </div>
                            </div>
                            <div className="max-h-[250px] overflow-auto mt-3">
                              {payeesToDisplay?.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => handlePayeeSelect(item)}
                                  className={`flex gap-2.5 justify-between border border-StrokeColor p-3 rounded mb-2.5 cursor-pointer bg-StrokeColor hover:bg-leftlistHover ${selectedPayee?.id === item.id ? 'bg-bg-StrokeColor activecheck-show' : 'bg-bg-StrokeColor check-hidden'}`}
                                >
                                  <div className="flex gap-2.5">
                                    <div>
                                      <span className="text-xl font-semibold text-subTextColor bg-BlackBg flex justify-center items-center rounded-full w-7 h-7 leading-none">
                                        {item?.favoriteName[0]}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="text-base text-subTextColor font-semibold">{item?.favoriteName}</h4>
                                      <h5 className="mb-0 text-sm text-textGray2 font-normal">{item?.network}</h5>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="icon md success-arrow "></span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AntForm.Item>
                      </div>
                      <div className="!mt-6 custom-amount-field">
                        <AntForm.Item
                          className="relative !mb-0"
                          name="requestedAmount"
                          label="Amount"
                          required
                          colon={false}
                          rules={[
                            { validator: validateAmount }
                          ]}
                          normalize={normalizedAmount}
                        >
                          <NumericFormat
                            className={'custom-input-field block outline-0 !text-base !shadow-none'}
                            placeholder="Enter Amount"
                            thousandSeparator={true}
                            thousandsGroupStyle="lakh"
                            allowNegative={false}
                            decimalScale={ALLOWED_DECIMALS['requestedAmount']}
                            value={form.getFieldValue('requestedAmount')}
                            onValueChange={handleValueChange}
                            maxLength={15}
                          />
                        </AntForm.Item>
                      </div>
                      <div className="flex justify-between items-center">
                        <AppButton
                          type="link"
                          className="text-sm text-primaryColor font-normal hover:!text-primaryColor !px-0"
                          onClick={handleMinAmountClick}
                        >
                          <span className="">
                            Min -
                          </span>
                          <NumericText
                            value={cryptoMinMax?.minLimit}
                            displayType="text"
                            thousandSeparator={true}
                            decimalScale={AppDefaults?.fiatDecimals}
                          />
                        </AppButton>
                        <AppButton
                          type="link"
                          className="text-sm text-primaryColor font-normal hover:!text-primaryColor !px-0"
                          onClick={handleMaxAmountClick}
                        >
                          <span>
                            Max -
                          </span>
                          <NumericText
                            value={cryptoMinMax?.maxLimit}
                            displayType="text"
                            thousandSeparator={true}
                            decimalScale={AppDefaults?.fiatDecimals}
                          />
                        </AppButton>
                      </div>
                    </div>
                    <div className='mt-7 text-end'>
                      <button className="rounded-5 w-full px-6 py-2 text-sm font-medium text-lightDark uppercase bg-primaryColor border-0">
                        Continue
                      </button>
                    </div>
                  </>}
              </div>
            </div>
          </AntForm>
        )}
      </VerificationsHandler>
      <div>
        <AddPayeeDrawer
          payeeType="crypto"
          isOpen={isDrawer}
          onClose={onCancelPayee}
          onCancel={onCancelPayee}
          onSuccess={onSuccessPayee}
          selectedNetwork={form.getFieldValue('network')}
          selectedCoin={form.getFieldValue('currency')}
        />
      </div>
    </div>
  )
}

export default CryptoForm