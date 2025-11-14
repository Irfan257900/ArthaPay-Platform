import { useCallback, useEffect, useState } from "react";
import { Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { WarningOutlined } from "@ant-design/icons";
import { NumericFormat } from "react-number-format";
import {
  fetchBanks,
  setSelectedBank,
  setErrorMessages,
  setSelectedCurrency,
} from "../../../reducers/banks.widthdraw.reducer";
import AppSelect from "../../../core/shared/appSelect";
import AppSelectOption from "../../../core/shared/appSelectOption";
import { useTranslation } from "react-i18next";
import AppAlert from "../../../core/shared/appAlert";
import PayeeSelection from "./payees.selection";
import ActionWidgetLoader from "../../../core/skeleton/actionWidgets.loader";
import VerificationsHandler from "../../../core/verifications.handler";
import AppDefaults from "../../../utils/app.config";
import NumericText from "../../../core/shared/numericText";
import AppButton from "../../../core/shared/appButton";

const icon = <WarningOutlined />;

const Widget = () => {
  const [amount, setAmount] = useState(null);

  const userProfile = useSelector((state) => state.userConfig.details);
  const accounts = useSelector((state) => state.transferReducer.accounts.data);
  const selectedBank = useSelector((state) => state.transferReducer.selectedBank);
  const selectedCurrency = useSelector((state) => state.transferReducer.selectedCurrency);
  const { error: summaryError } = useSelector((state) => state.transferReducer.summary);
  const {
    loading,
    data: banks,
    error: banksError,
  } = useSelector((state) => state.transferReducer.banks);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useParams();

  const MIN_AMOUNT = selectedCurrency?.minLimit?.toString() ?? "0";
  const MAX_AMOUNT = selectedCurrency?.maxLimit?.toString() ?? "0";

  useEffect(() => {
    if (currency && currency !== "null" && currency !== "undefined") {
      dispatch(fetchBanks({ currency }));
    }
  }, [currency]);

  useEffect(() => {
    if (banks) {
      dispatch(setSelectedBank(banks?.bankList?.[0]));
    }
  }, [banks]);

  const handleBankOptions = useCallback(
    (value) => {
      const bank = banks?.bankList?.filter((bank) => bank.name === value);
      dispatch(setSelectedBank(bank[0]));
    },
    [banks]
  );

  const onInputChange = useCallback((item) => {
    setAmount(item.target.value);
  }, []);

  const handleCurrencSelection = useCallback(
    (value) => {
      const selectedObj = accounts?.find((item) => item.currency === value);
      dispatch(setSelectedCurrency(selectedObj));
      const params = {
        id: userProfile.id,
        currency: selectedObj?.currency,
        param: "bankwithdrawfiat",
      };
      dispatch(fetchBanks(params));
      navigate(`/banks/withdraw/${selectedObj?.currency}`);
    },
    [accounts]
  );

  const closeErrorHandler = useCallback(() => {
    dispatch(
      setErrorMessages([
        { key: "banks", message: "" },
        { key: "summary", message: "" },
      ])
    );
  }, []);

  const filterBankOptions = useCallback((input, option) => {
    return (
      option.props.children.toLowerCase().includes(input.toLowerCase()) ||
      option.props.value.toLowerCase().includes(input.toLowerCase())
    );
  }, []);

  const handleMin = useCallback(() => {
    setAmount(MIN_AMOUNT);
  }, []);

  const handleMax = useCallback(() => {
    setAmount(MAX_AMOUNT);
  }, []);
  return (
    <VerificationsHandler loader={<ActionWidgetLoader />}>
      <div className="panel-card buy-card card-paddingrm !mt-6">
        {(banksError || summaryError) && (
          <div
            className="alert-flex"
            style={{ width: "100%", marginTop: "5%" }}
          >
            <AppAlert
              type="error"
              description={banksError || summaryError}
              closable={true}
              afterClose={closeErrorHandler}
              icon={icon}
              showIcon
            />
          </div>
        )}

        <div className="md:w-[465px] w-full mx-auto">
          <div className="summary-contentarea pay-inform basicinfo-form panel-form-items-bg">
            <div className="form-field-bg grid grid-cols-1">
              {/* Amount and Coin Selection */}
              <div className="bg-inputBg !border !border-StrokeColor rounded-5 px-2 py-1.5 w-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="relative flex-1">
                    <div className="custom-input-lablel">
                      Amount <span className="text-requiredRed">*</span>
                    </div>
                    <div className="text-center">
                      <NumericFormat
                        placeholder='Enter Amount'
                        customInput={Input}
                        thousandSeparator={true}
                        value={amount}
                        prefix=""
                        decimalScale={2}
                        allowNegative={false}
                        className="custom-input-field is-error-br !border-none outline-0 focus:outline-0"
                        onChange={onInputChange}
                        onValueChange={closeErrorHandler}
                        maxLength="13"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="custom-input-lablel">
                      {t("banks.lables.coin")}{" "}
                      <span className="text-requiredRed">*</span>
                    </div>
                    <AppSelect
                      placeholder="Select coin"
                      className="mb-0 custom-select-float w-full custom-input-border"
                      maxLength={30}
                      value={selectedCurrency?.currency}
                      onSelect={handleCurrencSelection}
                      options={accounts || []}
                      fieldNames={{ label: "currency", value: "currency" }}
                    />
                  </div>
                </div>
              </div>

              {/* Min & Max Buttons */}
              <div className="flex justify-between items-center !p-0">
                <AppButton
                  type="link"
                  className="text-sm text-primaryColor font-normal hover:!text-primaryColor !px-0"
                  onClick={handleMin}
                >
                  {t("vault.vaultscrypto.min")} -
                  <NumericText
                    value={MIN_AMOUNT}
                    displayType="text"
                    thousandSeparator={true}
                    decimalScale={AppDefaults.fiatDecimals}
                  />{" "}
                  {selectedCurrency?.name}
                </AppButton>

                <AppButton
                  type="link"
                  className="text-sm text-primaryColor font-normal hover:!text-primaryColor !px-0"
                  onClick={handleMax}
                >
                  {t("vault.vaultscrypto.max")} -
                  <NumericText
                    value={MAX_AMOUNT}
                    displayType="text"
                    thousandSeparator={true}
                    decimalScale={AppDefaults.fiatDecimals}
                  />{""}
                  {selectedCurrency?.name}
                </AppButton>
              </div>

              {/* Bank Selection */}
              {banks && banks?.bankList?.length > 1 && (
                <div className="relative">
                  <div className="custom-input-lablel">
                    {t("banks.lables.bank")}{" "}
                    <span className="text-requiredRed">*</span>
                  </div>
                  <AppSelect
                    showSearch
                    placeholder="Select bank"
                    className="mb-0 custom-select-float w-full !border-none"
                    maxLength={30}
                    loading={loading}
                    value={selectedBank?.name}
                    onSelect={handleBankOptions}
                    filterOption={filterBankOptions}
                  >
                    {banks?.bankList?.map((item) => (
                      <AppSelectOption key={item?.name} value={item?.name}>
                        {item?.name}
                      </AppSelectOption>
                    ))}
                  </AppSelect>
                </div>
              )}
            </div>

            {/* Payee Section */}
            <PayeeSelection amount={amount} />
          </div>
        </div>
      </div>
    </VerificationsHandler>
  );
};

export default Widget;