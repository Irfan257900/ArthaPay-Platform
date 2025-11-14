import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { NumericFormat } from "react-number-format";
import {
  Select,
  Alert,
  Input,
  message,
  Form as AntForm,
  Tooltip,
} from "antd";
import {
  normalizeFormattedNumber,
  validations,
} from "../../../core/shared/validations";
import { useDispatch, useSelector } from "react-redux";
import { processorReducer, processorState } from "./reducer";
import FormInput from "../../../core/shared/formInput";
import {
  getPayoutSummary,
  debouncedSummary,
  ALLOWED_DECIMALS,
  getFiatPayees,
  fiatCurrencies,
} from "../httpServices";
import { setFormData } from "../reducers/payout.reducer";
import AppButton from "../../../core/shared/appButton";
import FileUpload from "../../../core/shared/file.upload";
import { payoutErrors } from "./payout.constants";
import { useTranslation } from "react-i18next";
import AddPayeeDrawer from "../../../core/shared/addPayee.drawer";
import CriptoFiatLoader from "../../../core/skeleton/cripto.fiat.loader";
import VerificationsHandler from "../../../core/verifications.handler";
import ResourceFormFields from "./purpose.and.source";
import CustomButton from "../../../core/button/button";
import NumericText from "../../../core/shared/numericText";
import AppDefaults from "../../../utils/app.config";
import ComingSoon from "../../../core/shared/commingsoon";
import { setSelectedResourceData } from "./payout.accordion.reducer";
const { requiredValidator } = validations;
const showFileUpload = false;
const FiatForm = () => {
  const { Search } = Input;
  const [form] = AntForm.useForm();
  const formRef = useRef(null);
  const dispatch = useDispatch();
  const [payee, setPayee] = useState(null);
  const [requestAmount, setRequestAmount] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [networkDetails, setNetworkDetails] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const userProfile = useSelector((info) => info.userConfig.details);
  const vaults = useSelector((state) => state.payoutAccordianReducer.vaults);
  const selectedMerchant = useSelector(
    (storeInfo) => storeInfo?.payoutAccordianReducer?.selectedFiatVault
  );
  const selectedCoin = useSelector(
    (storeInfo) => storeInfo?.payoutAccordianReducer?.selectedFiatCoin
  );

  const [state, setState] = useReducer(processorReducer, processorState);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDrawer, setIsDrawer] = useState(false);
  const { setNetworkLu } = useOutletContext();
  const { t } = useTranslation();
  const { loading, error, lookups, minMaxCrypto } = state;
  const { currencyType } = useParams();
  const navigate = useNavigate();
  const [fileLists, setFileLists] = useState({
    uploaddocuments: [],
  });
  const [pdfPreview, setPdfPreview] = useState({
    uploaddocuments: "",
  });
  const [previewImages, setPreviewImages] = useState({
    uploaddocuments: "",
  });

  useEffect(() => {
    if (currencyType === "fiat") {
      selectedCoin?.productId && fetchFaitCurrencies(selectedCoin?.productId);
    }
  }, [currencyType, selectedCoin?.productId]);

  useEffect(() => {
    setState({ type: "resetState" });
  }, [currencyType]);

  useEffect(() => {
    if (selectedMerchant !== null && selectedCoin !== null) {
      setField("merchantId", selectedMerchant?.name);
      setField("currency", selectedCoin?.code);
      setState({ type: "setNetworksLu", payload: selectedCoin?.networks });
    }
  }, [currencyType, selectedMerchant, selectedCoin]);
  useEffect(() => {
    setState({ type: "setError", payload: "" });
  }, [currencyType]);

  useEffect(() => {
    if (selectedMerchant) {
      setState({ type: "setError", payload: "" });
      removeImage('uploaddocuments');
      setRequestAmount(null);
      setState({ type: "setFilteredPayee", payload: [] });
      form.resetFields(['fiatCurrency', 'selectedPayee', 'uploaddocuments']);
      removeImage('uploaddocuments');
      setPayee(null);
    }
  }, [selectedMerchant]);
  useEffect(() => {
    if (
      state?.networksLu?.length > 0 &&
      form.getFieldValue("currency") &&
      selectedCoin
    ) {
      const firstNetwork = state?.networksLu[0];
      setSelectedNetwork(firstNetwork?.code);
      setField("network", firstNetwork?.code);
    }
  }, [
    lookups?.networks,
    currencyType,
    selectedCoin,
    selectedMerchant,
    state?.networksLu,
  ]);

  const setField = (field, value) => {
    const resetFields = (fieldsToReset) => form.resetFields(fieldsToReset);
    if (field === 'fiatCurrency') {
      removeImage('uploaddocuments');
      resetFields([
        "availableBalance",
        "finalAmount",
        // "uploaddocuments"
      ]);
    }

    const setFormFields = (otherValues) =>
      otherValues
        ? form.setFieldsValue({
          ...form.getFieldsValue(true),
          ...otherValues,
          [field]: value,
        })
        : form.setFieldsValue({ ...form.getFieldsValue(true), [field]: value });
    switch (field) {
      case "merchantId": {
        resetFields([
          "currency",
          "network",
          "availableBalance",
          "finalAmount",
          "quoteId",
          "feeCommission",
          "customerWalletId",
          "payeeId",
        ]);
        setState({
          type: "setStates",
          payload: {
            lookups: {
              ...lookups,
              currencies: selectedMerchant?.details,
              networks: [],
            },
            expiresIn: "",
            feeInfo: null,
            currencies: selectedMerchant?.details,
            networksLu: [],
          },
        });
        setFormFields({ merchantName: selectedMerchant?.name });
        break;
      }
      case "currency": {
        const fieldsToReset = [
          "network",
          "availableBalance",
          "finalAmount",
          "quoteId",
          "feeCommission",
          "customerWalletId",
        ];
        resetFields(fieldsToReset);
        const selectedCurrency = state?.currencies?.find(
          (item) => item?.code === value
        );
        setState({ type: "setSelectedCoin", payload: selectedCurrency });
        const selectedCurrencyLogo = selectedCurrency?.logo;
        const selectedCurrencyName = selectedCurrency?.code;
        setFormFields({ selectedCurrencyLogo, selectedCurrencyName });
        setState({
          type: "setStates",
          payload: {
            lookups: {
              ...lookups,
              networks: selectedCurrency?.networks,
              payees: lookups.payees,

            },
            expiresIn: "",
            networksLu: selectedCurrency?.networks,
            feeInfo: null,
          },
        });
        break;
      }
      case "network": {
        const selectedNetwork = state?.networksLu?.find(
          (network) => network.code === value
        );
        setNetworkLu(selectedNetwork);
        setNetworkDetails(selectedNetwork);
        const customerWalletId = selectedNetwork.id;
        const availableBalance = selectedNetwork.balance;
        const { requestedAmount, fiatCurrency } = form.getFieldsValue(true);
        setFormFields({ customerWalletId, availableBalance });
        if (requestedAmount && fiatCurrency) {
          // getSummary(requestedAmount, customerWalletId, fiatCurrency);
          console.log("Error")
        } else {
          setState({
            type: "setStates",
            payload: { expiresIn: "", feeInfo: null },
          });
        }
        break;
      }
      case "fiatCurrency": {
        removeImage('uploaddocuments');
        resetFields([
          "availableBalance",
          "finalAmount",
          // "uploaddocuments",
          "selectedPayee"
        ]);
        setPayee(null);
        const { requestedAmount, customerWalletId, selectedPayee } = form.getFieldsValue(true);
        setState({ type: "setLookups", payload: { payees: [] } });
        if (requestedAmount && customerWalletId && selectedPayee) {
          // getSummary(requestedAmount, customerWalletId, value);
          console.log("Error")
        } else {
          resetFields([
            "finalAmount",
            "quoteId",
            "feeCommission",
          ]);
          setState({
            type: "setStates",
            payload: { expiresIn: "", feeInfo: null },
          });
        }
        setFormFields();
        if (currencyType === "fiat") {
          getPayees();
        }
        break;
      }
      default:
        setFormFields();
        break;
    }
  };
  const handleUploadChange = useCallback((type, { fileList }) => {
    setErrorMessage(null);
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    const allowedExtensions = ["png", "jpg", "jpeg", "pdf"];
    if (fileList[0]?.size > MAX_FILE_SIZE) {
      window.scrollTo(0, 0);
      setErrorMessage(payoutErrors?.fileSizeErr);
      return;
    }
    const fileName = fileList[0]?.name;
    const fileNameParts = fileName?.split(".");
    if (fileNameParts?.length > 2) {
      window.scrollTo(0, 0);
      setErrorMessage(payoutErrors?.doubleExtention);
      return;
    }
    const fileExtension = fileName.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      window.scrollTo(0, 0);
      setErrorMessage(payoutErrors?.fileextentions);
      return;
    }
    const updatedFileList = fileList.map((file) => ({
      ...file,
      recordStatus:
        file.status === "done" ? "Added" : file.recordStatus || "Pending",
      url: file.status === "done" && file.response[0],
    }));
    setFileLists((prevFileLists) => ({
      ...prevFileLists,
      [type]: updatedFileList,
    }));
    const latestFile = fileList[fileList.length - 1];
    if (latestFile && latestFile.status === "done" && latestFile.type !== "application/pdf") {
      const imageUrl =
        latestFile.response[0] || URL.createObjectURL(latestFile.originFileObj);
      form.setFieldsValue({ [type]: imageUrl });
      setPreviewImages((prevImages) => ({ ...prevImages, [type]: imageUrl }));
    } else if (
      latestFile &&
      latestFile.status === "done" &&
      latestFile.type === "application/pdf"
    ) {
      const pdfUrl =
        latestFile.response[0] || URL.createObjectURL(latestFile.originFileObj);
      setPdfPreview((prev) => ({
        ...prev,
        [type]: pdfUrl,
      }));
    } else if (latestFile.status === "error") {
      message.error(payoutErrors?.uploadErr);
    }
  }, [payoutErrors, pdfPreview, fileLists]);
  const removeImage = useCallback((type) => {
    setFileLists((prevFileLists) => ({
      ...prevFileLists,
      [type]: [],
    }));

    form.setFieldsValue({ [type]: null });
    setPreviewImages((prevImages) => ({ ...prevImages, [type]: "" }));
    setPdfPreview((prev) => ({ ...prev, [type]: null }));
  }, [form, previewImages, pdfPreview, fileLists]);
  const onSummary = (response) => {
    const { finalAmount, quoteId, feeCommission, expiresIn, feeInfo } =
      response || {};
    form.setFieldsValue({
      ...form.getFieldsValue(true),
      finalAmount,
      quoteId,
      feeCommission,
    });
    setState({
      type: "setStates",
      payload: { expiresIn, feeInfo, loading: "" },
    });
    const values = {
      ...form.getFieldsValue(true),
      summary: response,
      merchantId: selectedMerchant?.id,
      previewFile: state?.responseFile,
    };
    dispatch(setFormData(values));
    setSummaryLoading(false);
    navigate(
      `/payments/payouts/payout/${selectedMerchant?.id}/${selectedMerchant?.merchantName}/summary/${currencyType}`
    );
  };
  const onSummaryError = (errorMessage) => {
    setState({
      type: "setStates",
      payload: { error: errorMessage, loading: "" },
    });
    setSummaryLoading(false);
  };
  const getSummary = (value, customerWalletId, fiatCurrency) => {
    form.resetFields(["quoteId", "finalAmount", "feeCommission"]);
    const availableBalance = form.getFieldValue("availableBalance");
    if (!value || Number(value) >= Number(availableBalance)) {
      return;
    }
    setState({
      type: "setStates",
      payload: { loading: "summary", feeInfo: null, expiresIn: "" },
    });
    debouncedSummary({
      userProfile,
      selectedType: currencyType,
      value,
      customerWalletId,
      fiatCurrency,
      onSummary,
      onError: onSummaryError,
    });
  };
  const handleAmountChange = (value) => {
    if (requestAmount <= 10000)
      removeImage('uploaddocuments');
    form.setFieldsValue({ requestedAmount: value });
  };

  const handleFormSubmission = useCallback(async () => {
    if (!payee?.id) {
      setErrorMessage(payoutErrors?.payeeError);
      return;
    }
    const { fiatCurrency, customerWalletId, requestedAmount } =
      form.getFieldsValue(true);
    if (requestedAmount < networkDetails?.minLimit) {
      setErrorMessage(`Minimum value must be ${networkDetails?.minLimit?.toLocaleString("en-US", { maximumFractionDigits: 0 })}.`)
      return
    }
    if (requestedAmount > networkDetails?.maxLimit) {
      setErrorMessage(`Amount cannot exceed ${networkDetails?.maxLimit?.toLocaleString("en-US", { maximumFractionDigits: 0 })}.`);
      return
    }
    setSummaryLoading(true);
    await getPayoutSummary({
      userProfile,
      selectedType: currencyType,
      value: requestedAmount,
      customerWalletId,
      fiatCurrency,
      payee,
      onSummary,
      onError: onSummaryError,
    });
  }, [payee, currencyType, form, onSummary, onSummaryError, networkDetails]);

  const getPayees = async () => {
    const currencyValue = form.getFieldValue("fiatCurrency");
    const coin = form.getFieldValue("currency");
    const network = form.getFieldValue("network");
    const urlParams = {
      currency: currencyValue,
      coin: coin,
      network: network,
    };
    await getFiatPayees(setState, urlParams, currencyType);
  };

  const handlePayeeSearch = (searchTerm) => {
    setPayee(null);
    if (!searchTerm) {
      setState({
        type: "setFilteredPayee",
        payload: state?.payees.slice(0, 5),
      });
    } else {
      const filtered = state?.payees?.filter((item) =>
        item.favoriteName.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );
      setState({ type: "setFilteredPayee", payload: filtered.slice(0, 5) });
    }
  };

  const navigateToPayees = () => {
    if (currencyType === "fiat") {
      setIsDrawer(true);
    }
  };

  const fetchFaitCurrencies = async (productId) => {
    await fiatCurrencies(setState, currencyType, productId);
  }

  const handlePayeeSelect = (item) => {
    form.setFieldsValue({ selectedPayee: item });
    setPayee(item);
  };
  const clearErrorMessage = useCallback(() => {
    setState({ type: "setError", payload: "" });
    setErrorMessage(null);
  });
  const validateAmount = (_, value) => {
    const minAmount = state?.minMaxfiat?.minLimit;
    const maxAmount = state?.minMaxfiat?.maxLimit;
    if (value === 0) {
      return Promise.reject("Should be greater than zero");
    }
    if (!value) {
      return Promise.reject("Please Enter Amount");
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

  const onSuccessPayee = useCallback(() => {
    setIsDrawer(false);
    getPayees();
  }, [getPayees]);

  const onCancelPayee = useCallback(() => {
    setIsDrawer(false);
  }, []);

  const handleCurrencyChange = useCallback((e) => {
    setField("currency", e)
  }, [setField, selectedMerchant, selectedCoin]);

  const handleFiatCurrencyChange = useCallback((e) => {
    setField("fiatCurrency", e);
    const selectedFiatCurrency = state?.fiatCurrency?.find(
      (item) => item.name === e
    );

    if (selectedFiatCurrency && selectedFiatCurrency.transactionAdditionalFields) {
      try {
        const parsedFields = JSON.parse(selectedFiatCurrency.transactionAdditionalFields);
        dispatch(setSelectedResourceData(parsedFields));
      } catch (error) {
        console.error("Failed to parse transactionAdditionalFields:", error);
        dispatch(setSelectedResourceData(null));
      }
    } else {
      // If no fields or currency selected, reset resource data in store
      dispatch(setSelectedResourceData(null));
    }

  }, [setField, selectedMerchant, selectedCoin, state, requestAmount, dispatch]); // Added dispatch to dependency array
  const handleFilteredPayees = useCallback((e) => {
    handlePayeeSearch(e.target.value);
  }, [payee, state]);

  const normalizedAmount = useCallback((value) => {
    return value ? normalizeFormattedNumber(value) : undefined;
  }, []);

  const handleValueChange = useCallback((data) => {
    if (
      (currencyType === "fiat" &&
        (!form.getFieldValue("network"))) || !form.getFieldValue("network")
    ) {
      return;
    }
    setRequestAmount(data?.floatValue);
    const updatedValue = data.floatValue;
    form.setFieldsValue({
      requestedAmount: updatedValue,
    });
    handleAmountChange(updatedValue);
  }, [currencyType, state]);

  const handleMinAmountClick = useCallback(() => {
    const minAmount =
      currencyType === "fiat"
        ? networkDetails?.minLimit
        : minMaxCrypto?.minLimit;
    form.setFieldsValue({ requestedAmount: minAmount });
    handleAmountChange(minAmount);
  }, [state, minMaxCrypto, form]);

  const handleMaxAmountClick = useCallback(() => {
    const maxAmount =
      currencyType === "fiat"
        ? networkDetails?.maxLimit
        : minMaxCrypto?.maxLimit;
    form.setFieldsValue({ requestedAmount: maxAmount });
    handleAmountChange(maxAmount);
  }, [state, minMaxCrypto, form]);

  return (
    <div ref={formRef} className="mt-4 custom-payments-field">
      {vaults?.loader && <CriptoFiatLoader />}
      {(!selectedCoin?.isPayoutFiatAvailable && !vaults?.loader)&& <ComingSoon />}
      {(error || errorMessage) && (
        <div className="alert-flex">
          <Alert
            className="w-100 px-0 py-2"
            type="warning"
            description={error || errorMessage}
            showIcon
          />
          <button
            type="button"
            className="icon sm alert-close"
            onClick={() => clearErrorMessage()}
          ></button>
        </div>
      )}
      {(!vaults?.loader && selectedCoin?.isPayoutFiatAvailable) && <VerificationsHandler
        loader={<CriptoFiatLoader />}>
        <AntForm
          onFinish={handleFormSubmission}
          form={form}
          className="payout-form"
        >
          <div className="">
            <div className="lg:w-[465px] mx-auto w-full">
              {loading !== "details" && (
                <>
                  <div className="mt-6">
                    <div className="bg-inputBg rounded-5 w-full !mb-6">
                      {/* <div className="flex py-1.5 px-2 items-start justify-between gap-2"> */}
                      <FormInput label={'From Currency'}>
                        <AntForm.Item
                          className="mb-0 panel-form-items-bg relative payement-currency"
                          name="currency"
                          rules={[requiredValidator()]}
                          colon={false}
                        >
                          <Select
                            className="bg-inputBg rounded-sm"
                            placeholder={t("payments.placeholders.paycoin")}
                            onChange={handleCurrencyChange}
                            optionLabelProp="children"
                          >
                            {state?.currencies?.map((item) => (
                              <Option value={item?.code} key={item?.code}>
                                <div className="flex items-center gap-2"
                                >
                                  <img
                                    className="rounded-full w-4 h-4"
                                    src={item?.image}
                                    alt={item?.code}
                                  />
                                  <span>{item?.code}</span>

                                </div>
                              </Option>
                            ))}
                          </Select>
                        </AntForm.Item>
                      </FormInput>
                    </div>
                    <div className="!mt-6 custom-amount-field">
                      <AntForm.Item
                        className="relative !mb-0"
                        name="requestedAmount"
                        label="Amount"
                        required
                        colon={false}
                        rules={[{ validator: validateAmount }]}
                        normalize={normalizedAmount}
                      >
                        <NumericFormat
                          className={
                            "custom-input-field block outline-0 !text-base !shadow-none"
                          }
                          placeholder={t("payments.placeholders.enteramount")}
                          thousandSeparator={true}
                          thousandsGroupStyle="lakh"
                          allowNegative={false}
                          decimalScale={ALLOWED_DECIMALS["Fiat"]}
                          value={form.getFieldValue("requestedAmount")}
                          onValueChange={handleValueChange}
                          maxLength={15}
                        />
                      </AntForm.Item>
                    </div>
                    <div className="flex justify-between items-center !mb-4">
                      <AppButton
                        type="link"
                        className="text-sm !text-primaryColor font-normal hover:!text-primaryColor !px-0"
                        onClick={handleMinAmountClick}
                      >
                        <span className="">{t("payments.payouts.min")} -</span>
                        <NumericText
                          value={
                            currencyType === "fiat"
                              ? networkDetails?.minLimit
                              : minMaxCrypto?.minLimit
                          }
                          displayType="text"
                          thousandSeparator={true}
                          decimalScale={AppDefaults?.fiatDecimals}
                          suffixText={" " + selectedCoin?.code}
                        />
                      </AppButton>
                      <AppButton
                        type="link"
                        className="text-sm text-primaryColor font-normal hover:!text-primaryColor !px-0"
                        onClick={handleMaxAmountClick}
                      >
                        <span>{t("payments.payouts.max")} -</span>
                        <NumericText
                          value={
                            currencyType === "fiat"
                              ? networkDetails?.maxLimit
                              : minMaxCrypto?.maxLimit
                          }
                          displayType="text"
                          thousandSeparator={true}
                          decimalScale={AppDefaults?.fiatDecimals}
                          suffixText={" " + selectedCoin?.code}
                        />
                      </AppButton>
                    </div>
                    <FormInput label={'To Currency'} >
                      <AntForm.Item
                        className="mb-0 basicinfo-form panel-form-items-bg relative"
                        name="fiatCurrency"
                        rules={[requiredValidator()]}
                      >
                        <Select
                          className=" "
                          placeholder={t("payments.payouts.seleccurrency")}
                          showSearch={true}
                          type="input"
                          maxLength={100}
                          onChange={handleFiatCurrencyChange}
                        // Remove the options prop and fieldNames when using <Option> children
                        >
                          {state?.fiatCurrency?.map((item) => {
                            // Construct the display label: "CODE (Note)" if note exists, otherwise just "CODE"
                            const displayLabel = item?.note
                              ? `${item?.code} (${item.note})`
                              : item?.code;

                            return (
                              <Option value={item?.name} key={item?.name}>
                                {displayLabel}
                              </Option>
                            );
                          })}
                        </Select>
                      </AntForm.Item>
                    </FormInput>
                    <div className="mt-6 bg-menuhover text-lightWhite p-3.5 rounded-5">
                      <div className='flex items-center gap-1'>
                        <h3 className="text-m font-normal text-textcolor ">{t('payments.payouts.selectpayee')}</h3>
                        <span className='text-textRed'>*</span>
                      </div>
                      <AntForm.Item
                        className="mb-0 panel-form-items-bg relative"
                        name="selectedPayee"
                        // label={t("payments.payouts.selectpayee")}
                        colon={false}
                        rules={[requiredValidator()]}
                      >
                        <div className="">
                          <div className="flex items-center gap-2.5">
                            <Search
                              maxLength={50}
                              placeholder={t("payments.placeholders.searchpayee")}
                              onChange={handleFilteredPayees}
                              suffix={
                                <span className="icon md search c-pointer" />
                              }
                              size="middle"
                              className="coin-search-input payout-search"
                            />
                            {/* <div>
                              <Tooltip title={t("payments.tooltips.addpayee")}>
                                <div className="w-8 h-8 flex justify-center items-center border border-primaryColor rounded-full cursor-pointer">
                                  <span
                                    className="icon btn-add cursor-pointer"
                                    onClick={navigateToPayees}
                                  ></span>
                                </div>
                              </Tooltip>
                            </div> */}
                          </div>
                          <div className="max-h-[250px] overflow-auto mt-3">
                            {state?.filteredPayees?.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => handlePayeeSelect(item)}
                                className={`flex gap-2.5 justify-between border border-StrokeColor border-block p-3 rounded-5 mb-2.5 cursor-pointer bg-inputBg dark:bg-menuhover hover:bg-cardbackground ${payee?.id === item.id
                                  ? "!bg-cardbackground dark:!bg-profileBr activecheck-show"
                                  : "!bg-cardbackground dark:!bg-profileBr check-hidden"
                                  }`}
                              >
                                <div className="flex gap-2.5">
                                  <div>
                                    <span className="text-base font-semibold text-subTextColor w-7 h-7 bg-bgblack rounded-full flex justify-center items-center leading-none">
                                      {item?.favoriteName[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="text-base text-subTextColor font-semibold">
                                      {item?.favoriteName}
                                    </h4>
                                    <p className="text-sm font-normal text-titleColor">
                                      {item?.name} - {item?.accountNoOrAddress}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <span className="icon md success-arrow scale-150"></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AntForm.Item>
                    </div>
                    <ResourceFormFields form={form} formInstance={AntForm} payee={payee} selectedCoin={selectedCoin} />
                  </div>
                  {(requestAmount >= 10000 && showFileUpload) &&
                    <div className="mt-4 text-center">
                      <AntForm.Item
                        className="mb-0 basicinfo-form panel-form-items-bg relative mt-6"
                        name="uploaddocuments"
                        colon={false}
                        rules={[
                          {
                            required: true,
                            message: "Is required",
                          },
                        ]}
                      >
                        <h4 className="text-subTextColor text-base font-semibold">
                          {t("payments.payouts.uploaddocument")}
                        </h4>
                        <p className="text-paraColor text-xs font-normal">File can be JPG, JPEG,PNG , PDF File are allowed </p>
                        <div className="!mt-3.5">
                          <FileUpload
                            name="uploaddocuments"
                            uploadEndpoint="payoutfiatuploadfile"
                            fileList={fileLists.uploaddocuments}
                            previewImage={previewImages.uploaddocuments || pdfPreview.uploaddocuments}
                            handleUploadChange={handleUploadChange}
                            handleRemoveImage={removeImage}
                          />
                        </div>
                      </AntForm.Item>
                    </div>
                  }
                  <div className="mt-7 text-end">
                    <CustomButton htmlType='submit' type="primary" className='w-full' loading={summaryLoading}>{t("common.continue")}</CustomButton>
                  </div>
                </>
              )}
            </div>
          </div>
          <div>
            <AddPayeeDrawer
              payeeType="fiat"
              isOpen={isDrawer}
              onClose={onCancelPayee}
              onCancel={onCancelPayee}
              onSuccess={onSuccessPayee}
              selectedCoin={form.getFieldValue("fiatCurrency")}
              isBaas={true}
            />
          </div>
        </AntForm>
      </VerificationsHandler>}
    </div>
  );
};

export default FiatForm;