import React from "react";
import membershipefreeimg from "../../../assets/images/membershipefreeimg.svg";
import bronzeimag from "../../../assets/images/bronzeimag.svg";
import goldimg from "../../../assets/images/goldimg.svg";
import membershipplatinumimg from "../../../assets/images/membership platinumimg.svg";
import {
  normalizeFormattedNumber,
  normalizeString,
  numberValidationHelper,
  replaceCommas,
  replaceExtraSpaces,
  validations,
} from "../../shared/validations";
import { allowedDecimals } from "../../../modules/referrals/services";
import AppDefaults from "../../../utils/app.config";
import { Input } from "antd";
import NumericInput from "../../shared/numericInput";
import NumericText from "../../shared/numericText";
import AppCheckbox from "../../shared/appCheckbox";
export const tierImage = {
  Platinum: membershipplatinumimg,
  Standard: goldimg,
  VIP: bronzeimag,
  Free: membershipefreeimg,
};
export const productIcon = {
  vaults: "icon db-vault-icon",
  payments: "icon db-payin-icon",
  cards: "icon db-card-icon",
  exchange: "icon db-exchange-icon",
  banks: "icon db-banks-icon",
};
export const actionNames = {
  depositcrypto: "Deposit Crypto",
  withdrawcrypto: "Withdraw Crypto",
  batchpayout: "Batch Payout",
  payin: "Pay In",
  payincrypto: "Payin Crypto",
  payinfiat: "Payin Fiat",
  payoutcrypto: "Payout Crypto",
  payoutfiat: "Payout Fiat",
  bankaccountcreation: "Account Creation",
  bankdepositfiat: "Deposit Fiat",
  bankwithdrawfiat: "Withdraw Fiat",
  depositfiat: "Deposit Fiat",
  withdrawfiat: "Withdraw Fiat",
};
export const defaultCommonFeeFields = {
  actions: "actions",
  data: "data",
  action: "action",
  name: "name",
  code: "code",
  network: "network",
  logo: "logo",
  prMinFee: "prMinFee",
  isMinMax: "isMinMax",
  minFee: "minFee",
  prMaxFee: "prMaxFee",
  maxFee: "maxFee",
  isFlat: "isFlat",
  flatFee: "flatFee",
  prFlatFee: 'prFlatFee',
  fee: "fee",
  currencyType: "currencyType",
  issuingFee: "issuingFee",
  prIssuingFee: "prIssuingFee",
};
export const defaultCardFeeFields = {
  ...defaultCommonFeeFields,
  issuingFee: "issuingFee",
  prIssuingFee: "prIssuingFee",
  prMaintenanceFee: "prMaintenanceFee",
  maintenanceFee: "maintenanceFee",
  prCardCancellationFee: "prCardCancellationFee",
  cardCancellationFee: "cardCancellationFee",
};
export const FeeTableModulesConfig = {
  Wallets: {
    action: true,
    name: true,
    displayLogo: true,
    network: true,
    fee: true,
    isMinMax: true,
    isFlat: true,
    flatFee: true,
    issuingFee: false,
    cancellationFee: false,
    topupFee: false,
    maintenanceFee: false,
    defaultFieldNames: defaultCommonFeeFields,
  },
  Exchange: {
    action: true,
    name: false,
    displayLogo: true,
    network: false,
    fee: true,
    isMinMax: true,
    isFlat: true,
    flatFee: true,
    issuingFee: false,
    cancellationFee: false,
    topupFee: false,
    maintenanceFee: false,
    defaultFieldNames: defaultCommonFeeFields,
  },
  Banks: {
    action: true,
    name: true,
    displayLogo: true,
    network: false,
    fee: true,
    isMinMax: true,
    isFlat: true,
    flatFee: true,
    issuingFee: false,
    cancellationFee: false,
    topupFee: false,
    maintenanceFee: false,
    defaultFieldNames: defaultCommonFeeFields,
  },
  Cards: {
    action: false,
    name: true,
    displayLogo: false,
    network: false,
    fee: false,
    isMinMax: true,
    isFlat: true,
    flatFee: true,
    issuingFee: true,
    cancellationFee: true,
    topupFee: true,
    maintenanceFee: true,
    defaultFieldNames: defaultCardFeeFields,
  },
  Payments: {
    action: true,
    name: true,
    displayLogo: true,
    network: true,
    fee: true,
    isMinMax: true,
    isFlat: true,
    flatFee: true,
    issuingFee: false,
    cancellationFee: false,
    topupFee: false,
    maintenanceFee: false,
    defaultFieldNames: defaultCommonFeeFields,
  },
};
const numberValidator = (value, validationHelper = numberValidationHelper) => {
  let valueToValidate = value;
  if (typeof valueToValidate !== "number") {
    valueToValidate = parseFloat(
      replaceCommas(replaceExtraSpaces(value?.toString()))
    );
  }
  if (value && isNaN(valueToValidate)) {
    return "invalid";
  }
  const notGreaterThanMaxLimit = valueToValidate <= validationHelper.maxLimit;
  const notLessThanMinLimit = valueToValidate >= validationHelper.minLimit;
  if (
    (!valueToValidate && valueToValidate !== 0) ||
    (notGreaterThanMaxLimit && notLessThanMinLimit)
  ) {
    return "";
  }
  if (!notGreaterThanMaxLimit) {
    return "greater";
  }
  if (!notLessThanMinLimit) {
    return "lesser";
  }
};
const isInValid = (value) => {
  return value === null || value === undefined || Number(value) !== 0;
};
const minMaxValidations = {
  "invalid-invalid": "Min and Max Fees are invalid.",
  "-invalid": "Invalid Max Fee.",
  "invalid-": "Invalid Min Fee.",
  "greater-": "Min Fee exceeds limit.",
  "lesser-": "Min Fee is too low.",
  "-greater": "Max Fee exceeds limit.",
  "-lesser": "Max Fee is too low.",
  "invalid-greater": "Min Fee is invalid, Max Fee exceeds limit.",
  "invalid-lesser": "Min Fee is invalid, Max Fee is too low.",
  "lesser-invalid": "Min Fee is too low, Max Fee is invalid.",
  "greater-invalid": "Min Fee exceeds limit, Max Fee is invalid.",
  "greater-greater": "Min Fee and Max Fee exceed the limit.",
  "greater-lesser": "Min Fee exceeds limit, Max Fee is too low.",
  "lesser-greater": "Min Fee is too low, Max Fee exceeds limit.",
  "lesser-lesser": "Min and Max Fees are too low.",
};
function getMinMaxFeeValidations(data, fields, hasPrFees) {
  const isMinMax = data[fields.isMinMax];
  const isFlat = data[fields.isFlat];
  const minFee = data[fields.minFee];
  const maxFee = data[fields.maxFee];
  return [
    {
      validator: () => {
        if (
          isMinMax &&
          !minFee &&
          isInValid(minFee) &&
          isInValid(maxFee) &&
          !maxFee
        ) {
          return Promise.reject(new Error(`Enter either Min or Max Fee`));
        }
        if (!isMinMax && !isFlat) {
          return Promise.reject(new Error(`Choose Min/Max or Flat Fee`));
        }
        if (isMinMax) {
          const minFeeValidation = numberValidator(minFee, {
            ...numberValidationHelper,
            minLimit: hasPrFees ? (data[fields?.prMinFee] || 0) : 0,
            minLimitString: hasPrFees ? `${data[fields?.prMinFee] || 0}` : '0',
          });
          const maxFeeValidation = numberValidator(maxFee, {
            ...numberValidationHelper,
            minLimit: hasPrFees ? (data[fields?.prMaxFee] || 0) : 0,
            minLimitString: hasPrFees ? `${data[fields?.prMaxFee] || 0}` : '0',
            maxLimit: 100,
          });

          const errorMessage =
            minMaxValidations[`${minFeeValidation}-${maxFeeValidation}`] || "";

          if (errorMessage) {
            return Promise.reject(new Error(errorMessage));
          }
        }

        return Promise.resolve();
      },
    },
  ];
}
export function getRulesFor(field, data, fields, hasPrFees) {
  if (field === "minMax") {
    return getMinMaxFeeValidations(data, fields, hasPrFees);
  }

  const getNumberValidation = (label, key) => [
    validations.requiredValidator(),
    validations.numberValidator(label, {
      ...numberValidationHelper,
      minLimit: hasPrFees ? (data[fields[key]] || 0) : 0,
      minLimitString: hasPrFees ? `${data[fields[key]] || 0}` : "0",
    }),
  ];

  const getMinMaxValidation = (label, key, maxLimit = null) => {
    if (!data[fields.isMinMax]) return [];
    return [
      numberValidator(label, {
        minLimit: hasPrFees ? (data[fields[key]] || 0) : 0,
        minLimitString: hasPrFees ? `${data[fields[key]] || 0}` : "0",
        ...(maxLimit !== null ? { maxLimit, maxLimitString: `${maxLimit}` } : {}),
      }),
    ];
  };

  const fieldValidations = {
    [fields.minFee]: () => getMinMaxValidation("Min Fee", "prMinFee"),
    [fields.maxFee]: () => getMinMaxValidation("Max Fee", "prMaxFee", 100),
    [fields.flatFee]: () => (data[fields.isFlat] ? getNumberValidation("Flat Fee", "prFlatFee") : []),
    [fields.issuingFee]: () => getNumberValidation("Issuing Fee", "prIssuingFee"),
    [fields.maintenanceFee]: () => getNumberValidation("Maintenance Fee", "prMaintenanceFee"),
    [fields.cardCancellationFee]: () => getNumberValidation("Cancellation Fee", "prCardCancellationFee"),
  };

  return fieldValidations[field] ? fieldValidations[field]() : [];
}

export const getFieldDependencies = (
  field,
  fields,
  actionIndex,
  productIndex
) => {
  switch (field) {
    case "minMax":
      return [
        [
          fields.actions,
          actionIndex,
          fields.data,
          productIndex,
          fields.isMinMax,
        ],
        [fields.actions, actionIndex, fields.data, productIndex, fields.minFee],
        [fields.actions, actionIndex, fields.data, productIndex, fields.maxFee],
        [fields.actions, actionIndex, fields.data, productIndex, fields.isFlat],
      ];
    case fields.minFee:
      return [
        [
          fields.actions,
          actionIndex,
          fields.data,
          productIndex,
          fields.isMinMax,
        ],
        [fields.actions, actionIndex, fields.data, productIndex, fields.maxFee],
        [fields.actions, actionIndex, fields.data, productIndex, fields.isFlat],
      ];
    case fields.maxFee:
      return [
        [
          fields.actions,
          actionIndex,
          fields.data,
          productIndex,
          fields.isMinMax,
        ],
      ];
    case fields.flatFee:
      return [
        [fields.actions, actionIndex, fields.data, productIndex, fields.isFlat],
      ];
    default:
      return [];
  }
};

export const normalizeFormNumber = (value) => {
  return value || Number(value) === 0
    ? normalizeFormattedNumber(value)
    : undefined;
};
export const RenderFieldLabel = React.memo((
  { label, hasPrFees, prFeeValue, isPercentage = false, currencyType }
) => {
  return <span>
    {label}{" "}
    {!hasPrFees && isPercentage && <span>(%)</span>}
    {hasPrFees && (
      <NumericText
        className="pointer-events-none"
        prefixText={"("}
        suffixText={isPercentage ? "%)" : ")"}
        fixedDecimals={null}
        value={prFeeValue || 0}
        decimalScale={
          isPercentage ? AppDefaults.percentageDecimals : (allowedDecimals[normalizeString(currencyType)] || AppDefaults.cryptoDecimals)
        }
        spaceAfterPrefix={false}
        spaceBeforeSuffix={false}
      />
    )}
  </span>
})
export const RenderMinMaxFee = React.memo(
  ({
    fees,
    rowData,
    FormInstance,
    fields,
    actionIndex,
    productIndex,
    hasPrFees,
    handleFieldChange,
  }) => (
    <>
      <FormInstance.Item shouldUpdate={true} noStyle>
        {({ getFieldError }) => {
          return (
            <div
              className={`flex border border-inputDarkBorder rounded cust-error-br-fee ${getFieldError([
                fields.actions,
                actionIndex,
                fields.data,
                productIndex,
                fields.minFee,
              ])?.length > 0
                  ? "border !border-errorBorderRed"
                  : ""
                }`}
            >
              <FormInstance.Item
                label={<RenderFieldLabel label='Min Fee' hasPrFees={hasPrFees} prFeeValue={rowData?.[fields.prMinFee]} currencyType={rowData?.[fields.currencyType]} />}
                name={[actionIndex, fields.data, productIndex, fields.minFee]}
                className="mb-0 feeslabel"
                rules={getRulesFor("minMax", rowData, fields, hasPrFees)}
                dependencies={getFieldDependencies(
                  "minMax",
                  fields,
                  actionIndex,
                  productIndex
                )}
                normalize={normalizeFormNumber}
                colon={false}
                required={false}
              >
                <NumericInput
                  name={fields.minFee}
                  decimalScale={
                    allowedDecimals[
                    normalizeString(rowData?.[fields.currencyType])
                    ]
                  }
                  customInput={Input}
                  onChange={handleFieldChange}
                  onChangeParams={[
                    fields.minFee,
                    actionIndex,
                    productIndex,
                    fees,
                  ]}
                  placeholder="Min Fee"
                  className="bg-transparent border-0 border-inputDarkBorder text-lightWhite p-2 rounded outline-0 w-32 border-r-0 rounded-r-none !shadow-none"
                />
              </FormInstance.Item>
              <FormInstance.Item label={<RenderFieldLabel label='Max Fee' hasPrFees={hasPrFees} prFeeValue={rowData?.[fields.prMaxFee]} currencyType={rowData?.[fields.currencyType]} isPercentage={true} />}
                required={false}
                name={[actionIndex, fields.data, productIndex, fields.maxFee]}
                className="mb-0 feeslabel"
                normalize={normalizeFormNumber}
              >
                <NumericInput
                  name={fields.maxFee}
                  decimalScale={
                    allowedDecimals[
                    normalizeString(rowData?.[fields.currencyType])
                    ]
                  }
                  customInput={Input}
                  onChange={handleFieldChange}
                  onChangeParams={[
                    fields.maxFee,
                    actionIndex,
                    productIndex,
                    fees,
                  ]}
                  placeholder="Max Fee"
                  className="bg-transparent border-0 border-inputDarkBorder text-lightWhite p-2 rounded outline-0 w-32 border-l-0 rounded-l-none !shadow-none"
                />
              </FormInstance.Item>
            </div>
          );
        }}
      </FormInstance.Item>
      <div>
        <FormInstance.Item noStyle shouldUpdate={true}>
          {({ getFieldError }) => {
            const minMaxErrors = getFieldError([
              fields.actions,
              actionIndex,
              fields.data,
              productIndex,
              fields.minFee,
            ]);
            return minMaxErrors?.length > 0 ? (
              <div className="text-errorBorderRed text-sm text-left">
                {minMaxErrors[0]}
              </div>
            ) : (
              <></>
            );
          }}
        </FormInstance.Item>
      </div>
    </>
  )
);

export const RenderFlatFee = React.memo(
  ({
    fees,
    rowData,
    FormInstance,
    fields,
    actionIndex,
    productIndex,
    hasPrFees,
    handleFieldChange,
  }) => (
    <FormInstance.Item
      label={<RenderFieldLabel label='Flat Fee' hasPrFees={hasPrFees} prFeeValue={rowData?.[fields.prFlatFee]} currencyType={rowData?.[fields.currencyType]} />}
      required={false}
      name={[actionIndex, fields.data, productIndex, fields.flatFee]}
      className="mb-0 feeslabel"
      rules={getRulesFor(fields.flatFee, rowData, fields, hasPrFees)}
      dependencies={getFieldDependencies(
        fields.flatFee,
        fields,
        actionIndex,
        productIndex
      )}
      normalize={normalizeFormNumber}
    >
      <NumericInput
        name={fields.flatFee}
        decimalScale={
          allowedDecimals[normalizeString(rowData?.[fields.currencyType])]
        }
        customInput={Input}
        onChange={handleFieldChange}
        onChangeParams={[fields.flatFee, actionIndex, productIndex, fees]}
        placeholder="Flat Fee"
        className="bg-transparent border border-inputDarkBorder text-lightWhite p-2 rounded outline-0 w-32"
      />
    </FormInstance.Item>
  )
);

export const FeeValueDisplay = React.memo(
  ({ label, value, isPercentage, currencyType, onlyValue = false }) => {
    const decimalScale = isPercentage
      ? AppDefaults.percentageDecimals
      : allowedDecimals[normalizeString(currencyType)] || AppDefaults.cryptoDecimals;
    const suffix = isPercentage ? "%" : "";
    const ValueContent = () => {
      if (typeof value === 'string' || /[a-zA-Z]/.test(value)) {
        return <span className="pointer-events-none">{value}</span>;
      }
      return (
        <NumericText
          value={value}
          displayType="text"
          className="pointer-events-none"
          decimalScale={decimalScale}
          fixedDecimals={null}
          suffixText={suffix}
        />
      );
    };

    if (onlyValue) {
      return (
        <div className="py-3 px-[9px] w-[120px]">
          <h3 className="text-sm font-semibold text-paraColor">
            <ValueContent />
          </h3>
        </div>
      );
    }

    return (
      <div className="min-w-10">
        <h3 className="text-sm font-semibold text-paraColor">{label}</h3>
        <h3 className="text-sm font-semibold text-subTextColor">
          <ValueContent />
        </h3>
      </div>
    );
  }
);
export const RenderMinMaxFeeView = React.memo(
  ({ module, rowData, fields, showFeeOverview }) => (
    <>
      {showFeeOverview && (
        <td className="py-3 px-5">
          <div>
            <h3 className="text-sm font-semibold text-paraColor">
              <span>{rowData?.[fields?.fee]}</span>
            </h3>
          </div>
        </td>
      )}
      {!showFeeOverview && (
        <>
          {FeeTableModulesConfig[module].isMinMax && (
            <td className="fees-inputfields px-3 py-2 pr-0 align-baseline">
              <AppCheckbox checked={rowData[fields.isMinMax]} disabled={true} />
            </td>
          )}
          <td>
            <FeeValueDisplay
              label="Min"
              value={rowData?.[fields?.minFee] || 0}
              currencyType={rowData[fields.currencyType]}
            />
          </td>
          <td>
            <FeeValueDisplay
              label="Max"
              value={rowData?.[fields?.maxFee] || 0}
              isPercentage={true}
              currencyType={rowData[fields.currencyType]}
            />
          </td>
          {FeeTableModulesConfig[module].isFlat && (
            <td className="fees-inputfields px-3 py-2 pr-0 align-baseline">
              <AppCheckbox checked={rowData[fields.isFlat]} disabled={true} />
            </td>
          )}
          {FeeTableModulesConfig[module].flatFee && (
            <td>
              <FeeValueDisplay
                label="Flat Fee"
                value={rowData?.[fields?.flatFee] || 0}
                currencyType={rowData[fields.currencyType]}
              />
            </td>
          )}
        </>
      )}
    </>
  )
);


