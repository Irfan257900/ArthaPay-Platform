import React, { useCallback, useMemo } from "react";
import AppNumber from "../../core/shared/appNumber";
import Spinner from "../../core/shared/loaders/spinner";
import { Dropdown, Space } from "antd";
import ActionController from "../../core/onboarding/action.controller";
import AppDefaults from "../../utils/app.config";
import NumericText from "../../core/shared/numericText";
import FormInput from "../../core/shared/formInput";
import { MinMaxLoader } from "../../core/skeleton/buysell";
const screenTexts = {
  buy: {
    saveButton: "Buy",
    cryptoAmountLabel: "You Buy",
    cryptoAmtPlaceholder: "You Buy",
    fiatAmountLabel: "You Pay",
    fiatAmtPlaceholder: "You Pay",
  },
  sell: {
    cryptoAmountLabel: "You Sell",
    cryptoAmtPlaceholder: "You Sell",
    fiatAmountLabel: "You Receive",
    fiatAmtPlaceholder: "You Receive",
    saveButton: "Sell",
  },
};
export const defaultCryptoFields = {
  code: "code",
  logo: "image",
  name: "name",
  min: "min",
  max: "max",
  available: "amount",
};
const defaultFiatFields = {
  code: "code",
  available: "amount",
  logo: "image",
  name: "name",
};

const BuySellWidget = ({ config }) => {
  const {
    classNames = {},
    cryptoCoins,
    handleCryptoCurrencyChange,
    selectedCryptoCoin,
    cryptoAmountLoader,
    fiatAmountLoader,
    handleMinMax,
    cryptoAmount,
    fiatAmount,
    handleFiatChange,
    handleChange,
    selectedFiatCoin,
    saving,
    handleSave,
    disabled,
    fiatWalletsLoading,
    assetDetailsLoading,
    fiatWallets,
    screen,
    cryptoFields = defaultCryptoFields,
    fiatFields = defaultFiatFields,
  } = config;

  const onInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      switch (name) {
        case "from":
          handleChange(value, true);
          break;
        case "to":
          handleChange(value, false);
          break;
        default:
          break;
      }
    },
    [selectedCryptoCoin, selectedFiatCoin]
  );

  const cryptoList = useMemo(() => {
    return cryptoCoins?.map((coin) => ({
      label: (
        <div className="flex items-center gap-2">
          <img
            className="inline-block h-6 w-6 rounded-full"
            src={coin?.[cryptoFields.logo]}
            alt={coin?.[cryptoFields.name]}
          />
          <div>
            <h5 className="xl:text-base lg:text-sm text-subTextColor font-semibold">
              {coin?.[cryptoFields.code]}
            </h5>
            <p className="text-xs font-normal text-subTextColor">
              <NumericText
                value={coin?.[cryptoFields.available]}
                decimalScale={AppDefaults.cryptoDecimals}
              />
            </p>
          </div>
        </div>
      ),
      key: coin?.[cryptoFields.code],
    }));
  }, [cryptoCoins, selectedCryptoCoin, cryptoFields]);
  const fiatList = useMemo(() => {
    return fiatWallets?.map((coin) => ({
      label: (
        <div className="flex items-center gap-2 ">
          <img
            className="inline-block h-6 w-6 rounded-full"
            src={coin?.[fiatFields.logo]}
            alt={coin?.[fiatFields.name]}
          />
          <div>
            <h5 className="xl:text-base lg:text-sm text-subTextColor font-semibold">
              {coin?.[fiatFields.code]}
            </h5>
            <p className="text-xs font-normal text-subTextColor">
              <NumericText
                value={coin?.[fiatFields.available]}
                decimalScale={AppDefaults.fiatDecimals}
              />
            </p>
          </div>
        </div>
      ),
      key: coin?.[fiatFields.code],
    }));
  }, [fiatWallets, selectedFiatCoin, fiatFields]);
  const handleCryptoSelection = useCallback(
    (item) => {
      handleCryptoCurrencyChange(item.key);
    },
    [
      selectedCryptoCoin,
      cryptoCoins,
      cryptoFields,
      selectedFiatCoin,
      fiatAmount,
    ]
  );
  const handleFiatSelection = useCallback(
    (item) => {
      const fiatWallet = fiatWallets?.find(
        (wallet) => wallet[fiatFields.code] === item.key
      );
      handleFiatChange(fiatWallet);
    },
    [
      fiatWallets,
      fiatFields,
      selectedCryptoCoin,
      selectedFiatCoin,
      cryptoAmount,
    ]
  );
  return (
    <div className={classNames?.root || "md:w-[465px] w-full mx-auto"}>
      <div
        className={
          classNames?.main || "form-field-bg grid grid-cols-1 gap-4 md:p-2"
        }
      >
        <div
          className={
            classNames?.inputSection ||
            "flex items-center flex-col gap-3 buysell-widget"
          }
        >
          <div className={classNames?.fromInputSection || "w-full"}>
            <div
              className={
                classNames?.fromInputRoot || "bg-inputBg border border-dbkpiStroke rounded-5 xl:p-1 lg:p-1 w-full"
              }
            >
              <div
                className={
                  classNames?.fromInputMain ||
                  "flex items-center justify-between gap-2"
                }
              >
                <div className={classNames?.fromInputBox || "flex-1"}>
                  <FormInput
                    label={screenTexts[screen].cryptoAmountLabel}
                    isRequired={false}
                  >
                    {!cryptoAmountLoader && (
                      <AppNumber
                        className={
                          classNames?.fromInput ||
                          "custom-input-field outline-0 !shadow-none !border-none"
                        }
                        placeholder={screenTexts[screen].cryptoAmtPlaceholder}
                        name="from"
                        type="input"
                        defaultValue={cryptoAmount}
                        value={cryptoAmount}
                        localCurrency={""}
                        prefix={""}
                        onChange={onInputChange}
                        decimalScale={AppDefaults.cryptoDecimals}
                        maxLength={10}
                        thousandSeparator={true}
                        loader={cryptoAmountLoader}
                      />
                    )}
                    {cryptoAmountLoader && (
                      <div
                        className={
                          classNames?.spinnerRoot || "custom-input-field block"
                        }
                      >
                        <Spinner />
                      </div>
                    )}
                  </FormInput>
                </div>
                <div
                  className={classNames?.verticalLineRoot || "lg:pr-0"}
                >
                  <p
                    className={classNames?.verticalLine || "vertical-line"}
                  ></p>
                </div>
                <div
                  className={
                    classNames?.cryptoDropdownRoot ||
                    "flex items-center space-x-1 justify-center min-w-[100px] min-h-[40px]"
                  }
                >
                  <Dropdown
                    className={classNames?.cryptoDropdown || "db-dropdownlist"}
                    menu={{
                      items: cryptoList,
                      selectable: true,
                      onSelect: handleCryptoSelection,
                      selectedKeys: [selectedCryptoCoin?.[cryptoFields.code]],
                    }}
                    trigger={["click"]}
                  >
                    <button>
                      <Space>
                        {selectedCryptoCoin && !assetDetailsLoading && (
                          <>
                            <img
                              className="inline-block h-6 w-6 rounded-full"
                              src={selectedCryptoCoin?.[cryptoFields.logo]}
                              alt={selectedCryptoCoin?.[cryptoFields.name]}
                            />
                            <div className="text-start">
                              <h5 className="xl:text-base lg:text-xs text-subTextColor font-semibold">
                                {selectedCryptoCoin?.[cryptoFields.code]}
                              </h5>
                              <p className="text-xs font-normal text-subTextColor">
                                <NumericText
                                  value={
                                    selectedCryptoCoin?.[cryptoFields.available]
                                  }
                                  decimalScale={AppDefaults.cryptoDecimals}
                                />
                              </p>
                            </div>
                          </>
                        )}
                        {assetDetailsLoading && <Spinner />}
                        {!selectedCryptoCoin && !assetDetailsLoading && (
                          <span>Select Coin</span>
                        )}
                        {!assetDetailsLoading && <button className="relative">
                          <span className="icon menu-expandicon ml-2 cursor-pointer rotate-90"></span>
                        </button>}
                      </Space>
                    </button>
                  </Dropdown>
                </div>
              </div>
            </div>
            {assetDetailsLoading && <div className="mt-2"><MinMaxLoader/></div>}
            {!assetDetailsLoading && (
              <div
                className={
                  classNames?.minMaxRoot || "flex w-full justify-between p-1 gap-8 flex-wrap"
                }
              >
                <button
                  id="buysellMinButton"
                  className={`${
                    classNames?.minButton ||
                    "xl:text-sm lg:text-xs font-normal !text-primaryColor hover:!text-primaryColor"
                  } ${
                    cryptoAmount === selectedCryptoCoin?.[cryptoFields.min]
                      ? classNames?.activeMinButton || "text-primaryColor"
                      : ""
                  }`}
                  onClick={handleMinMax}
                >
                  <span>Min - </span>
                  <span>
                    <NumericText
                      decimalScale={AppDefaults.cryptoDecimals}
                      value={selectedCryptoCoin?.[cryptoFields.min]}
                      suffixText={selectedCryptoCoin?.[cryptoFields.code]}
                    />
                  </span>
                </button>
                <button
                  id="buysellMaxButton"
                  className={`${
                    classNames?.maxButton ||
                    "xl:text-sm lg:text-xs font-normal !text-primaryColor hover:!text-primaryColor !visibletext-start"
                  } ${
                    cryptoAmount === selectedCryptoCoin?.[cryptoFields.max]
                      ? classNames?.activeMaxButton || "text-primaryColor"
                      : ""
                  }`}
                  onClick={handleMinMax}
                >
                  <span>Max - </span>
                  <span>
                    <NumericText
                      decimalScale={AppDefaults.cryptoDecimals}
                      value={selectedCryptoCoin?.[cryptoFields.max]}
                      suffixText={selectedCryptoCoin?.[cryptoFields.code]}
                    />
                  </span>
                </button>
              </div>
            )}
          </div>
          <span className="icon db-down-arrow"></span>
          <div
            className={
              classNames?.toAmountRoot || "bg-inputBg border border-dbkpiStroke rounded-5 xl:p-1 lg:p-1 w-full"
            }
          >
            <div
              className={
                classNames?.toAmountMain ||
                "flex items-center justify-between gap-2"
              }
            >
              <div className={classNames?.toAmountBox || "flex-1"}>
                <FormInput
                  label={screenTexts[screen].fiatAmountLabel}
                  isRequired={false}
                >
                  {!fiatAmountLoader && (
                    <AppNumber
                      className={
                        classNames?.toAmount ||
                        "custom-input-field block outline-0 !shadow-none !border-none"
                      }
                      placeholder={screenTexts[screen].fiatAmtPlaceholder}
                      name="to"
                      type="input"
                      defaultValue={fiatAmount}
                      value={fiatAmount || 0}
                      disabled={true}
                      displayType="text"
                      prefix=""
                      suffix=""
                      decimalScale={AppDefaults.fiatDecimals}
                      thousandSeparator={true}
                      loader={fiatAmountLoader}
                    />
                  )}
                  {fiatAmountLoader && (
                    <div
                      className={
                        classNames?.spinnerRoot || "custom-input-field block"
                      }
                    >
                      <Spinner />
                    </div>
                  )}
                </FormInput>
              </div>
              <div className={classNames?.verticalLineRoot || "lg:pr-0"}>
                <p className={classNames?.verticalLine || "vertical-line"}></p>
              </div>
              <div className="flex items-center space-x-2 justify-center min-w-[100px] min-h-[40px] ">
                <Dropdown
                  className={classNames?.fiatDropdown || "db-dropdownlist"}
                  menu={{
                    items: fiatList,
                    selectable: true,
                    onSelect: handleFiatSelection,
                    selectedKeys: [selectedFiatCoin?.[fiatFields.code]],
                  }}
                  trigger={["click"]}
                >
                  <button disabled={fiatWalletsLoading || assetDetailsLoading}>
                    <Space>
                      {(assetDetailsLoading || fiatWalletsLoading) && <Spinner/>}
                      {selectedFiatCoin && !assetDetailsLoading && (
                        <>
                          <img
                            className="inline-block h-6 w-6 rounded-full"
                            src={selectedFiatCoin?.[fiatFields.logo]}
                            alt={selectedFiatCoin?.[fiatFields.code]}
                          />
                          <div className="text-start">
                            <h5 className="text-sm text-subTextColor font-semibold">
                              {selectedFiatCoin?.[fiatFields.code]}
                            </h5>
                            <p className="text-xs font-normal text-subTextColor">
                              <NumericText
                                value={selectedFiatCoin?.[fiatFields.available]}
                                decimalScale={AppDefaults.fiatDecimals}
                              />
                            </p>
                          </div>
                        </>
                      )}
                      {!selectedFiatCoin && !assetDetailsLoading && <span>Select Fiat</span>}
                      {!fiatWalletsLoading && !assetDetailsLoading && (
                        <button className="relative">
                          <span className="icon menu-expandicon ml-2 cursor-pointer rotate-90"></span>
                        </button>
                      )}
                    </Space>
                  </button>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
        <ActionController
          handlerType="button"
          onAction={handleSave}
          actionFrom={screenTexts[screen].saveButton}
          buttonType="primary"
          buttonClass={
            "rounded-5 border-0 bg-primaryColor hover:!bg-buttonActiveBg dark:hover:!bg-buttonActiveBg text-sm font-medium !text-lightDark w-full disabled:!bg-btnDisabled disabled:cursor-not-allowed disabled:text-textBlack h-14 focus:none"
          }
          loading={saving}
          redirectTo={`/exchange/${encodeURIComponent(screen)}`}
          disabled={disabled || !selectedCryptoCoin || !selectedFiatCoin}
        >
          <span className="">{screenTexts[screen].saveButton}</span>
        </ActionController>
      </div>
    </div>
  );
};

export default BuySellWidget;
