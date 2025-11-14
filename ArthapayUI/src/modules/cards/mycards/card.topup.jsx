import { Form, Input, Select } from "antd";
import AppAlert from "../../../core/shared/appAlert";
import { NumericFormat } from "react-number-format";
import { connect, useDispatch } from "react-redux";
import { useCallback, useEffect, useReducer, useRef } from "react";
import debounce from "../../../utils/debounce";
import { Option } from "antd/lib/mentions";
import {
  fetchDepositDetails,
  getAssetInCards,
  getNetworkLuCrads,
  getTopUpCommissions,
  saveTopupDetails,
} from "../httpServices";
import CustomButton from "../../../core/button/button";
import { useOutletContext } from "react-router";
import SideDrawerLoader from "../../../core/skeleton/drawer.loaders/sidedrawer.loader";
import HeaderNotificationsLoader from "../../../core/skeleton/header.notification.loader";
import { topUpCardreducer, topUpCardState } from "./card.reducer";
import { useTranslation } from "react-i18next";
import { normalizeFormattedNumber } from "../../../core/shared/validations";
import NumericText from "../../../core/shared/numericText";
import AppDefaults from "../../../utils/app.config";
import { successToaster } from "../../../core/shared/toasters";
import { getMyCradsAvailableBalance } from "../../../reducers/cards.reducer";

const TopUp = ({
  cardDetails,
  handleTopUpModal,
  selectedCurdID,
  user,
  trackauditlogs,
  handleShowTransactions,
  handleTopUpChange,
}) => {
  const [topupForm] = Form.useForm();
  const topupFormRef = useRef(null);
  const getData = useOutletContext();
  const [localState, localDispatch] = useReducer(
    topUpCardreducer,
    topUpCardState
  );
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED
  const minValue = localState?.depositDetails?.minLimit || 0;
  const maxValue = localState?.depositDetails?.maxLimit || 10000;
  const transactionFlags = cardDetails && cardDetails.transactionAdditionalFields
    ? JSON.parse(cardDetails.transactionAdditionalFields)
    : {};
  const decimalScaleValue = transactionFlags.IsAllowDecimalValue ? 2 : 0;
  useEffect(() => {
    getAssetData(user?.id);
    getDepositDetails(user?.id, selectedCurdID);
  }, []);
  useEffect(() => {
    if (localState?.confirmAsset) {
      getNetworks(localState?.confirmAsset, user?.id);
    }
  }, [localState?.confirmAsset]);
  const setGetAssetData = (response) => {
    if (response) {
      localDispatch({ type: "setAssets", payload: response });
      topupForm.setFieldsValue({
        setConfirmAsset: response?.[0]?.currencyCode,
      });
      localDispatch({
        type: "setConfirmAsset",
        payload: response?.[0]?.currencyCode,
      });
    } else {
      localDispatch({ type: "setLoader", payload: false });
      localDispatch({ type: "setErrorMsg", payload: response });
    }
  };
  const getAssetData = async (id) => {
    const urlParams = { id: id, cardId: cardDetails?.programId };
    await getAssetInCards(localDispatch, setGetAssetData, urlParams);
  };
  const setGetNetworks = (response) => {
    if (response) {
      const trc20Record = response?.find((coin) => coin.network === "TRC-20");
      localDispatch({ type: "setSelectNetwork", payload: trc20Record?.network });
      localDispatch({ type: "setSelectedNetwork", payload: trc20Record });
      localDispatch({ type: "setNetworks", payload: response });
      topupForm.setFieldsValue({ selectedNetwork: trc20Record?.network });
    } else {
      localDispatch({ type: "setErrorMsg", payload: response });
    }
  };
  const getNetworks = async (walletCode, id) => {
    const urlParams = {
      id: id,
      walletCode: walletCode,
      cardId: cardDetails?.programId,
    };
    await getNetworkLuCrads(localDispatch, setGetNetworks, urlParams);
  };
  const handleNetworkChange = useCallback(
    (value) => {
      getSelectedNetwork(
        localState?.networks?.find((item) => item?.network === value)
      );
    },
    [localState?.networks]
  );
  const getSelectedNetwork = (item) => {
    localDispatch({ type: "setSelectedNetwork", payload: item });
    localDispatch({ type: "setSelectNetwork", payload: item?.network });
  };
  const handlePaidCurrencyOnChange = useCallback(
    (value) => {
      getSelectedPaidCurrency(
        localState?.assets?.find((item) => item?.currencyCode === value)
      );
    },
    [localState?.assets]
  );
  const getSelectedPaidCurrency = (item) => {
    topupForm.setFieldsValue({ setConfirmAsset: item.currencyCode });
    localDispatch({ type: "setConfirmAsset", payload: item?.currencyCode });
    localDispatch({ type: "setTopUpButtonDisable", payload: true });
    topupForm.setFieldsValue({ amount: null });
    topupForm?.resetFields(["amount"]);
    localDispatch({ type: "setIsTopUpCommissionShow", payload: false });
    localDispatch({ type: "setErrorMsg", payload: null });
  };
  const setGetDepositDetails = (response) => {
    if (response) {
      localDispatch({ type: "setDepositDetails", payload: response });
      localDispatch({ type: "setErrorMsg", payload: null });
    } else {
      localDispatch({ type: "setDepositDetails", payload: null });
      localDispatch({ type: "setErrorMsg", payload: response });
    }
  };
  const getDepositDetails = async (customerId, cardId) => {
    const urlParams = { id: customerId, cardId: cardId };
    await fetchDepositDetails(localDispatch, setGetDepositDetails, urlParams);
  };
  const setGetTopUpCommionsDetails = (response) => {
    if (response) {
      localDispatch({ type: "setErrorMsg", payload: null });
      localDispatch({ type: "setTopUpButtonDisable", payload: false });
      localDispatch({ type: "setIsTopUpCommissionShow", payload: true });
      localDispatch({ type: "setTopUpCommissionDetails", payload: response });
    } else {
      localDispatch({ type: "setTopUpCommissionLoader", payload: false });
      localDispatch({ type: "setIsTopUpCommissionShow", payload: false });
      localDispatch({ type: "setTopUpButtonDisable", payload: true });
      topupFormRef.current?.scrollIntoView(0, 0);
      localDispatch({ type: "setErrorMsg", payload: response });
    }
  };
  const getTopUpCommionsDetails = async (amount, asset) => {
    if (amount && localState?.confirmAsset && localState?.selectNetwork) {
      const urlParams = {
        id: user.id,
        cardid: selectedCurdID,
        amount: amount,
        coin: asset || localState?.confirmAsset,
      };
      await getTopUpCommissions(
        localDispatch,
        setGetTopUpCommionsDetails,
        urlParams
      );
    } else {
      localDispatch({ type: "setErrorMsg", payload: null });
      localDispatch({ type: "setIsTopUpCommissionShow", payload: false });
      localDispatch({ type: "setTopUpCommissionLoader", payload: false });
      localDispatch({ type: "setTopUpCommissionDetails", payload: null });
      localDispatch({ type: "setTopUpButtonDisable", payload: true });
    }
  };
  const handleChangeTopUp = (e) => {
    const rawValue = e.value !== undefined ? e.value : e.target.value;
    const amount = rawValue === "" ? "" : normalizeFormattedNumber(rawValue);
    localDispatch({ type: "setInputAmount", payload: amount });
    localDispatch({ type: "setIsTopUpCommissionShow", payload: false });
    localDispatch({ type: "setTopUpButtonDisable", payload: false });
    localDispatch({ type: "setErrorMsg", payload: null });
    if (amount === "") {
      localDispatch({ type: "setErrorMsg", payload: null });
      return;
    }
    if (isNaN(amount) || amount < minValue) {
      return;
    } else if (amount > maxValue) {
      return;
    } else {
      getTopUpCommionsDetails(amount, localState?.confirmAsset);
    }
  };
  const debouncedhandleChangeTopUp = debounce(handleChangeTopUp, 500);

  const setsaveTopup = useCallback(
    (response) => {
      if (response) {
        successToaster({ content: t('cards.Messages.TOPUP_SUCCESS'), className: "custom-msg", duration: 3 })
        handleTopUpChange(true);
        localDispatch({ type: "setIsTopUpCommissionShow", payload: false });
        localDispatch({ type: "setTopUpButtonDisable", payload: true });
        handleShowTransactions(true);
        handleTopUpModal("save");
        topupForm.resetFields();
        setTimeout(() => {
          handleTopUpChange(false);
        }, 3000);
        getData && getData();
        dispatch(getMyCradsAvailableBalance());
        localDispatch({ type: "setInputAmount", payload: null });
      } else {
        localDispatch({ type: "setTopupLoader", payload: false });
        localDispatch({ type: "setErrorMsg", payload: response });
        topupFormRef.current.scrollIntoView(0, 0);
      }
    },
    [topupForm]
  );

  const validateFormData = (values) => {
    if (cardDetails?.amount == null || !localState?.selectedNetwork?.amount || values.amount > localState?.selectedNetwork?.amount) {
      return { message: t("cards.Messages.INSUFFICIENT_FUNDS") };
    } else if (
      (values?.amount === "" || values?.amount === "." || values?.amount === undefined || values?.amount === null)
    ) {
      return { message: t("cards.Messages.ENTER_AMOUNT") };
    } else if (!values?.amount || values?.amount == 0) {
      return { message: t("cards.Messages.AMOUNT_GREATER_THAN_ZERO") };
    } else if (
      !localState?.confirmAsset
    ) {
      return { message: t("cards.Messages.SELECT_CURRENCY") };
    } else if (
      !localState?.selectedNetwork
    ) {
      return { message: t("cards.Messages.SELECT_NETWORK") };
    }
    if (isNaN(values?.amount) || values?.amount < minValue) {
      return { message: t("cards.Messages.MINLIMIT") };
    } else if (values?.amount > maxValue) {
      return { message: t("cards.Messages.MAXLIMIT") };
    }
    return null;
  };
  const saveTopup = useCallback(
    async (values) => {
      try {
        localDispatch({ type: "setErrorMsg", payload: null });
        const formValues = { ...values, amount: localState?.inputAmount, }
        const validationError = validateFormData(formValues);
        if (validationError) {
          localDispatch({
            type: "setErrorMsg",
            payload: validationError.message,
          });
          topupFormRef.current?.scrollIntoView(0, 0);
          return;
        }
        // else if (localState?.isTopUpCommissionShow) {
        localDispatch({ type: "setTopupLoader", payload: true });
        localDispatch({ type: "setErrorMsg", payload: null });
        let saveObj = {
          programId: selectedCurdID,
          cryptoWalletId: localState?.selectedNetwork?.id,
          amount: localState?.inputAmount,
          concurrencyStamp: localState?.depositDetails?.concurrencyStamp,
          metadata: JSON.stringify(trackauditlogs),

        };
        const urlParams = { obj: saveObj };
        await saveTopupDetails(localDispatch, setsaveTopup, urlParams);
        // }
      } catch (error) {
        localDispatch({ type: "setErrorMsg", payload: error });
      }
    },
    [localState, cardDetails, selectedCurdID]
  );

  const setAmount = useCallback(
    (amount) => {
      if (!amount) return;
      topupForm.setFieldValue("amount", amount);
      localDispatch({ type: "setTopUpAmount", payload: amount });
      handleChangeTopUp({ value: amount });
    },
    [localState, topupForm]
  );

  const handleMinValue = useCallback(() => {
    const minAmount = localState?.depositDetails?.minLimit;
    setAmount(minAmount);
  }, [setAmount, localState]);

  const handleMaxValue = useCallback(() => {
    const maxAmount = localState?.depositDetails?.maxLimit;
    setAmount(maxAmount);
  }, [setAmount, localState]);

  return (
    <>
      {localState?.loader && <SideDrawerLoader />}
      {!localState?.loader && (
        <>
          <div ref={topupFormRef}></div>
          {localState?.errorMsg !== undefined &&
            localState?.errorMsg !== null && (
              <div className="alert-flex withdraw-alert fiat-alert">
                <AppAlert
                  type="error"
                  description={localState?.errorMsg}
                  showIcon
                />
                <span
                  className="icon sm alert-close"
                  onClick={() =>
                    localDispatch({ type: "setErrorMsg", payload: null })
                  }
                ></span>
              </div>
            )}
          <Form form={topupForm} onFinish={saveTopup}>
            <div className="modal-wcontent">
              <div className="text-center mb-2">
                <h2 className="text-breadcrum text-base font-semibold">
                  {t("cards.topUp.Available_Balance")}
                </h2>
                <h1 className="text-md text-lightWhite font-semibold">
                  <NumericText
                    value={localState?.selectedNetwork?.amount || 0}
                    decimalScale={AppDefaults.cryptoDecimals}
                    suffixText=' '
                    isdecimalsmall={Smalldecimals === 'true' ? true : false} />
                  {localState?.confirmAsset}{" "}
                  {localState?.selectedNetwork?.network &&
                    `(${localState?.selectedNetwork.network})`}
                </h1>
              </div>
              <div className="grid grid-cols-1">
                <div className={`withdraw-network relative mb-5`}>
                  <Form.Item
                    className="mb-0 custom-select-float relative"
                    name="setConfirmAsset"
                    label={t("cards.topUp.Currency")}
                    colon={false}
                  >
                    <Select
                      className="p-0 rounded outline-0 w-full text-lightWhite"
                      maxLength={15}
                      placeholder={t("cards.topUp.Select_Currency")}
                      // defaultValue={localState?.confirmAsset}
                      value={localState?.confirmAsset}
                      onChange={handlePaidCurrencyOnChange}
                    >
                      {Array.isArray(localState?.assets) &&
                        localState?.assets.map((item) => (
                          <Option key={item?.id} value={item?.currencyCode}>
                            {item?.currencyCode}
                            <img
                              className={`crypto coin sm rounded-[50%] ml-2`}
                              src={item?.logo}
                              alt=""
                            />
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </div>
                <div className={`withdraw-network relative mb-5`}>
                  <Form.Item
                    className="mb-0 custom-select-float relative"
                    name="selectedNetwork"
                    label={t("cards.topUp.Network")}
                    colon={false}
                    rules={[
                      { required: true, message: t("cards.Is_required") },
                    ]}
                  >
                    <Select
                      className="p-0 rounded outline-0 w-full text-lightWhite"
                      maxLength={15}
                      placeholder={t("cards.topUp.Select_Network")}
                      value={localState?.selectNetwork}
                      // defaultValue={localState?.selectNetwork}
                      onChange={handleNetworkChange}
                    >
                      {localState?.networks?.map((item) => (
                        <Option key={item?.id} value={item?.network}>
                          {item?.network}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>
              <div className={`my-4`}>
                {/* <Form.Item
                  label={t("cards.topUp.Amount_to_Top_Up")}
                  name="amount"
                  className="mb-0 custom-select-float relative"
                  type="number"
                  colon={false}
                  normalize={normalizeFormattedNumber}
                  rules={[
                    {
                      required: true,
                      message: t("cards.Is_required"),
                    },
                  ]}
                >
                  <div className="p-relative">
                    <NumericFormat
                      className="custom-input-field"
                      customInput={Input}
                      maxLength={10}
                      decimalScale={0}
                      thousandSeparator={true}
                      placeholder={t("cards.topUp.Enter_Amount_to_Top_Up")}
                      displayType={"input"}
                      allowNegative={false}
                      onChange={debouncedhandleChangeTopUp}
                      value={topupForm.getFieldValue("amount")}
                    />
                    <div className=" flex justify-between items-center mb-2 mt-1">
                      <CustomButton
                        type="normal"
                        className="text-primaryColor space-x-1 text-sm cursor-pointer"
                        onClick={handleMinValue}
                      >
                        <span>Min -</span>
                        <span>
                          {localState?.depositDetails?.minLimit?.toLocaleString(
                            undefined,
                            { maximumFractionDigits: 2 }
                          ) || "0.00"}{" "}
                        </span>
                        <span>{localState?.depositDetails?.currency}</span>
                      </CustomButton>
                      <CustomButton
                        type="normal"
                        className="text-primaryColor space-x-1 text-sm cursor-pointer"
                        onClick={handleMaxValue}
                      >
                        <span>Max -</span>
                        <span>
                          {localState?.depositDetails?.maxLimit?.toLocaleString(
                            undefined,
                            { maximumFractionDigits: 2 }
                          ) || "0.00"}{" "}
                        </span>
                        <span>{localState?.depositDetails?.currency}</span>
                      </CustomButton>
                    </div>
                    <p
                      className="mb-0 absolute top-[5px] right-4 text-base font-normal text-numerBadge"
                      style={{ transform: "translateY(9px)" }}
                    >
                      {localState?.depositDetails?.currency}
                    </p>
                  </div>
                </Form.Item> */}
                <Form.Item
                  // label={t("cards.topUp.Amount_to_Top_Up")}
                  name="amount"
                  className="mb-0 custom-select-float relative"
                  type="number"
                  colon={false}
                  normalize={normalizeFormattedNumber}
                  rules={[
                    {
                      required: true,
                      message: t("cards.Is_required"),
                    },
                  ]}
                >
                  <div className="p-relative topup-field">
                    {/* <span className='absolute bg-cardbackground top-[-12px] right-0 text-sm text-paraColor font-normal text-end'>{t('wallets.inWallet')} : <NumericFormat value={selectedNetwork?.amount} displayType="text" thousandSeparator={true} /> {' '}{selectedCurrency}</span> */}
                    <p
                      className="absolute bg-cardbackground top-[-16px] right-0 text-sm font-normal text-end text-numerBadge"
                      style={{ transform: "translateY(9px)" }}
                    >
                      {localState?.depositDetails?.currency}
                    </p>
                    <div className="absolute bg-cardbackground top-[-12px] left-[9px] text-labelGrey text-sm font-normal z-[1]">
                      {t("cards.topUp.Amount_to_Top_Up")} <span className="text-requiredRed">*</span>
                    </div>
                    <NumericFormat
                      className="!bg-sidedrawerBg custom-numeric-formate border pb-1 border-t-0 border-l-0 border-r-0 w-full border-b-inputDarkBorder text-lg md:text-3xl text-lightWhite rounded-none outline-0 text-center mt-2 !shadow-none"
                      customInput={Input}
                      maxLength={10}
                      decimalScale={decimalScaleValue}
                      thousandSeparator={true}
                      placeholder={t("cards.topUp.Enter_Amount_to_Top_Up")}
                      displayType={"input"}
                      allowNegative={false}
                      onChange={debouncedhandleChangeTopUp}
                      value={topupForm.getFieldValue("amount") <= 0 ? undefined : topupForm.getFieldValue("amount")}
                      disabled={localState?.topupLoader}
                    />
                    <div className=" flex justify-between items-center mb-2 mt-1.5">
                      <CustomButton
                        type="normal"
                        className="text-primaryColor space-x-1 text-sm cursor-pointer"
                        onClick={handleMinValue}
                      >
                        <span>Min -</span>
                        <span>
                          <NumericText
                            value={localState?.depositDetails?.minLimit || "0.00"}
                            displayType="text"
                            thousandSeparator={true}
                            decimalScale={2}
                          />

                        </span>
                        <span>{localState?.depositDetails?.currency}</span>
                      </CustomButton>
                      <CustomButton
                        type="normal"
                        className="text-primaryColor space-x-1 text-sm cursor-pointer"
                        onClick={handleMaxValue}
                      >
                        <span>Max -</span>
                        <span>
                          {/* {localState?.depositDetails?.maxLimit?.toLocaleString(
                            undefined,
                            { maximumFractionDigits: 2 }
                          ) || "0.00"}{" "} */}

                          <NumericText
                            value={localState?.depositDetails?.maxLimit || "0.00"}
                            displayType="text"
                            thousandSeparator={true}
                            decimalScale={2}
                          />
                        </span>
                        <span>{localState?.depositDetails?.currency}</span>
                      </CustomButton>
                    </div>

                  </div>
                </Form.Item>
                {localState?.topUpCommissionLoader && (
                  <HeaderNotificationsLoader itemCount={4} />
                )}
                {localState?.topUpCommissionDetails &&
                  localState?.isTopUpCommissionShow && (
                    <div
                      className="panel-card summary-list summary-panel modal-summary  mt-5 mb-2"
                      style={{ width: "auto" }}
                    >
                      <div className="summary-list-item">
                        <p className="summary-label">
                          {t("cards.topUp.Fees")} :{" "}
                        </p>
                        <p className="summary-text !m-0 text-wordbreak">
                          <NumericText
                            value={localState?.topUpCommissionDetails?.fee || 0}
                            decimalScale={AppDefaults.cryptoDecimals}
                            suffixText={localState?.confirmAsset}
                            thousandSeparator={true}

                          />
                        </p>
                      </div>
                      <div className="summary-list-item">
                        <p className="summary-label">
                          {t("cards.myCards.Total_Amount")} :{" "}
                        </p>
                        <p className="summary-text !m-0 text-wordbreak">
                          <NumericText
                            value={localState?.topUpCommissionDetails?.toTalAmount || 0}
                            decimalScale={AppDefaults.cryptoDecimals}
                            suffixText={localState?.confirmAsset}
                            thousandSeparator={true}
                          />
                        </p>
                      </div>
                    </div>
                  )}
                <p className="text-sm text-labelGrey font-normal mt-2">
                  {t("cards.topUp.This_is_the_balance_of_card")}
                </p>
              </div>
              <div className="text-right mt-9">
                <CustomButton
                  type="primary"
                  className={""}
                  htmlType="submit"
                  loading={localState?.topupLoader}
                  disabled={localState?.topUpButtonDisable}
                >
                  {t("cards.topUp.Top_Up")}
                </CustomButton>
              </div>
            </div>
          </Form>
        </>
      )}
    </>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return {
    user: userConfig.details,
    trackauditlogs: userConfig?.trackAuditLogData,
  };
};
export default connect(connectStateToProps)(TopUp);
