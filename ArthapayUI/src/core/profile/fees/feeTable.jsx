import {normalizeString} from "../../shared/validations";
import {
  actionNames,
  FeeTableModulesConfig,
  FeeValueDisplay,
  getRulesFor,
  normalizeFormNumber,
  RenderFieldLabel,
  RenderFlatFee,
  RenderMinMaxFee,
  RenderMinMaxFeeView,
} from "./service";
import { allowedDecimals } from "../../../modules/referrals/services";
import { useCallback, useMemo } from "react";
import { Input } from "antd";
import NumericInput from "../../shared/numericInput";
import Checkbox from "../../shared/appCheckbox";
const FeeTable = ({
  fees,
  dataKey='data',
  module,
  mode,
  moduleFields,
  FormInstance,
  hasPrFees,
  onFieldChange,
  showFeeOverview = true,
}) => {
  const fields = useMemo(() => {
    return moduleFields || FeeTableModulesConfig[module]?.defaultFieldNames;
  }, [module]);
  const handleFieldChange = useCallback(
    function (value, field, actionIndex, productIndex, data) {
      const dataToUpdate = data ? [...data] : [];
      dataToUpdate[actionIndex][fields.data][productIndex][field] = value;
      onFieldChange?.(dataToUpdate);
    },
    [module]
  );
  return (
    <div className="">
      <div className="overflow-x-auto rounded-5 mt-2.5 overflow-y-hidden">
        <table className="border border-StrokeColor w-full">
          <thead>
            <tr className="">
              {FeeTableModulesConfig[module].action && (
                <th className="py-3 border border-StrokeColor  min-w-36 text-paraColor text-sm font-semibold"></th>
              )}
              {FeeTableModulesConfig[module].name && (
                <th
                  className={`text-left border border-StrokeColor  py-3 ${
                    module === "Cards" ? "min-w-28" : ""
                  }`}
                ></th>
              )}
              {FeeTableModulesConfig[module].issuingFee && (
                <th className="text-sm font-semibold py-3 border border-StrokeColor">
                  {mode === "view" && "Issuing Fee"}
                </th>
              )}
              {FeeTableModulesConfig[module].topupFee && (
                <th
                  className="text-sm font-semibold py-3 border border-StrokeColor"
                  colSpan="2"
                >
                  Top-Up Fee
                </th>
              )}
              {FeeTableModulesConfig[module].maintenanceFee && (
                <th className="text-sm font-semibold py-3 border border-StrokeColor">
                  {mode === "view" && "Maintenance Fee"}
                </th>
              )}
              {FeeTableModulesConfig[module].cancellationFee && (
                <th className="text-sm font-semibold py-3 border border-StrokeColor">
                  {mode === "view" && "Cancellation Fee"}
                </th>
              )}
              {FeeTableModulesConfig[module].network && (
                <th className=" text-left border border-StrokeColor py-3"></th>
              )}
              {FeeTableModulesConfig[module].fee && (
                <th
                  className="text-center text-sm font-semibold py-3 "
                  colSpan="2"
                >
                  Fee
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {fees?.map((fee, actionIndex) => (
              <>
                {FeeTableModulesConfig[module].action && (
                  <tr>
                    <td
                      className={`text-sm font-semibold p-2 border border-StrokeColor text-subTextColor ${
                        module === "Exchange" ? "w-96" : ""
                      }`}
                      rowSpan={fee[dataKey]?.length + 1}
                    >
                      {actionNames[fee.action.toLowerCase()] || fee.action}
                    </td>
                  </tr>
                )}
                {fee[dataKey]?.map((data, productIndex) => (
                  <tr
                    key={
                      fee.action + data?.[fields.name] + data?.[fields.network]
                    }
                    className="align-center basicinfo-form"
                  >
                    {FeeTableModulesConfig[module].name &&
                      module !== "Cards" && (
                        <td className="border border-StrokeColor w-40">
                          <div className="flex items-center gap-2 py-4 p-5">
                            {FeeTableModulesConfig[module].displayLogo && (
                              <div>
                                <img
                                  src={data?.[fields.logo]}
                                  className="max-w-6 h-6 rounded-full"
                                  alt={data?.[fields.name]}
                                />
                              </div>
                            )}
                            <div>
                              <h4 className="text-xs font-semibold text-subTextColor">
                                {data?.[fields.name]}
                              </h4>
                              <h4 className="text-xs font-medium text-paraColor ">
                                {data?.[fields.code]}
                              </h4>
                            </div>
                          </div>
                        </td>
                      )}
                    {FeeTableModulesConfig[module].name &&
                      module === "Cards" && (
                        <td className="p-2 border border-StrokeColor">
                          {data?.name}
                        </td>
                      )}
                    {(FeeTableModulesConfig[module].issuingFee || (module==='Banks' && fee.action?.toLowerCase()==='bankaccountcreation') ) && (
                      <td className="border border-StrokeColor fees-inputfields px-3 py-2">
                        {mode === "view" && (
                          <FeeValueDisplay label="Issuing Fee" value={data?.[fields?.issuingFee] || 0} currencyType={data?.[fields.currencyType]} onlyValue={true}/>
                        )}
                        {mode !== "view" && (<FormInstance.Item
                            label={<RenderFieldLabel label='Issuing Fee' hasPrFees={hasPrFees} prFeeValue={data?.[fields.prIssuingFee]} currencyType={data[fields.currencyType]}/>}
                            name={[
                              actionIndex,
                              fields.data,
                              productIndex,
                              fields.issuingFee,
                            ]}
                            className="mb-0"
                            rules={getRulesFor(fields.issuingFee, data, fields,hasPrFees)}
                            normalize={normalizeFormNumber}
                          >
                            <NumericInput
                              name={fields.issuingFee}
                              decimalScale={
                                allowedDecimals[
                                  normalizeString(data[fields.currencyType])
                                ]
                              }
                              customInput={Input}
                              onChange={handleFieldChange}
                              onChangeParams={[
                                fields.issuingFee,
                                actionIndex,
                                productIndex,
                                fees,
                              ]}
                              placeholder="Issuing Fee"
                              className="bg-transparent border border-inputDarkBorder text-lightWhite p-2 rounded outline-0 min-w-32 max-w-48"
                            />
                          </FormInstance.Item>
                        )}
                      </td>
                    )}
                    {FeeTableModulesConfig[module].topupFee && (
                      <td colSpan={2} className="border border-StrokeColor">
                        <table className="basicinfo-form">
                          {mode !== "view" && (
                            <tr className="align-baseline">
                              {FeeTableModulesConfig[module].isMinMax && (
                                <td className="fees-inputfields px-3 py-2 pr-0 align-baseline">
                                  <FormInstance.Item
                                    name={[
                                      actionIndex,
                                      fields.data,
                                      productIndex,
                                      fields.isMinMax,
                                    ]}
                                    className="mb-0 feeslabel"
                                    colon={false}
                                    required={false}
                                    valuePropName="checked"
                                  >
                                    <Checkbox
                                      name={fields.isMinMax}
                                      onChange={handleFieldChange}
                                      onChangeParams={[
                                        fields.isMinMax,
                                        actionIndex,
                                        productIndex,
                                        fees,
                                      ]}
                                      className="cursor-pointer"
                                    />
                                  </FormInstance.Item>
                                </td>
                              )}
                              <td
                                colSpan={2}
                                className="fees-inputfields px-3 py-2 pr-0"
                              >
                                <RenderMinMaxFee
                                  rowData={data}
                                  fees={fees}
                                  fields={fields}
                                  FormInstance={FormInstance}
                                  actionIndex={actionIndex}
                                  productIndex={productIndex}
                                  hasPrFees={hasPrFees}
                                  handleFieldChange={handleFieldChange}
                                />
                              </td>
                              {FeeTableModulesConfig[module].isFlat && (
                                <td className="fees-inputfields px-3 py-2 align-baseline">
                                  {" "}
                                  <FormInstance.Item
                                    name={[
                                      actionIndex,
                                      fields.data,
                                      productIndex,
                                      fields.isFlat,
                                    ]}
                                    className="mb-0 feeslabel"
                                    colon={false}
                                    required={false}
                                    valuePropName={"checked"}
                                  >
                                    <Checkbox
                                      name={fields.isFlat}
                                      onChange={handleFieldChange}
                                      onChangeParams={[
                                        fields.isFlat,
                                        actionIndex,
                                        productIndex,
                                        fees,
                                      ]}
                                      className="cursor-pointer"
                                    />
                                  </FormInstance.Item>
                                </td>
                              )}
                              {FeeTableModulesConfig[module].flatFee && (
                                <td className="fees-inputfields px-3 py-2 pl-0">
                                  <RenderFlatFee
                                    rowData={data}
                                    fees={fees}
                                    fields={fields}
                                    FormInstance={FormInstance}
                                    actionIndex={actionIndex}
                                    productIndex={productIndex}
                                    hasPrFees={hasPrFees}
                                    handleFieldChange={handleFieldChange}
                                  />
                                </td>
                              )}
                            </tr>
                          )}
                        {mode==='view' && <tr>  
                          <RenderMinMaxFeeView
                            rowData={data}
                            module={module}
                            fields={fields}
                            showFeeOverview={showFeeOverview}
                          /></tr>}
                        </table>
                      </td>
                    )}
                    {FeeTableModulesConfig[module].maintenanceFee && (
                      <>
                        {mode === "view" && <td className="border-b border-StrokeColor"> <FeeValueDisplay label="Maintenance Fee" value={data?.[fields?.maintenanceFee] || 0} currencyType={data?.[fields.currencyType]} onlyValue={true} /></td>}
                        {mode !== "view" && (
                          <td className="fees-inputfields px-3 py-2 border-b border-StrokeColor">
                            <FormInstance.Item
                              label={<RenderFieldLabel label='Maintenance Fee' hasPrFees={hasPrFees} prFeeValue={data?.[fields.prMaintenanceFee]} currencyType={data[fields.currencyType]}/> }
                              name={[
                                actionIndex,
                                fields.data,
                                productIndex,
                                fields.maintenanceFee,
                              ]}
                              className="mb-0 feeslabel"
                              rules={getRulesFor(
                                fields.maintenanceFee,
                                data,
                                fields,
                                hasPrFees
                              )}
                              normalize={normalizeFormNumber}
                            >
                              <NumericInput
                                name={fields.maintenanceFee}
                                decimalScale={
                                  allowedDecimals[
                                    normalizeString(data[fields.currencyType])
                                  ]
                                }
                                customInput={Input}
                                onChange={handleFieldChange}
                                onChangeParams={[
                                  fields.maintenanceFee,
                                  actionIndex,
                                  productIndex,
                                  fees,
                                ]}
                                placeholder="Maintenance Fee"
                                className="bg-transparent border border-inputDarkBorder text-lightWhite p-2 rounded outline-0 w-32"
                              />
                            </FormInstance.Item>
                          </td>
                        )}
                      </>
                    )}
                    {FeeTableModulesConfig[module].cancellationFee && (
                      <>
                        {mode === "view" && <td className="fees-inputfields px-3 py-2 border border-StrokeColor"><FeeValueDisplay label="Cancellation Fee" value={data?.[fields?.cardCancellationFee] || 0} currencyType={data?.[fields.currencyType]} onlyValue={true}/></td>}
                        {mode !== "view" && (
                          <td className="fees-inputfields px-3 py-2 border border-StrokeColor">
                            <FormInstance.Item
                              label={<RenderFieldLabel label='Cancellation Fee' hasPrFees={hasPrFees} prFeeValue={data?.[fields.prCardCancellationFee]} currencyType={data[fields.currencyType]}/> }
                              name={[
                                actionIndex,
                                fields.data,
                                productIndex,
                                fields.cardCancellationFee,
                              ]}
                              className="mb-0 feeslabel"
                              rules={getRulesFor(
                                fields.cardCancellationFee,
                                data,
                                fields,
                                hasPrFees
                              )}
                              normalize={normalizeFormNumber}
                            >
                              <NumericInput
                                name={fields.cardCancellationFee}
                                decimalScale={
                                  allowedDecimals[
                                    normalizeString(data[fields.currencyType])
                                  ]
                                }
                                customInput={Input}
                                onChange={handleFieldChange}
                                onChangeParams={[
                                  fields.cardCancellationFee,
                                  actionIndex,
                                  productIndex,
                                  fees,
                                ]}
                                placeholder="Cancellation Fee"
                                className="bg-transparent border border-inputDarkBorder text-lightWhite p-2 rounded outline-0 w-32"
                              />
                            </FormInstance.Item>
                          </td>
                        )}
                      </>
                    )}
                    {FeeTableModulesConfig[module].network && (
                      <td className="w-32 border border-StrokeColor p-5">
                        <span className=" inline-block text-subTextColor">
                          {data?.[fields.network]}
                        </span>
                      </td>
                    )}
                    {((module!=='Banks' && FeeTableModulesConfig[module].fee) || (module==='Banks' && fee.action?.toLowerCase()!=='bankaccountcreation')) && (
                      <td className="border border-StrokeColor">
                        <table className="basicinfo-form">
                          {mode !== "view" && (
                            <tr className="align-baseline">
                              {FeeTableModulesConfig[module].isMinMax && (
                                <td className="fees-inputfields px-3 py-2 pr-0 align-baseline">
                                  <FormInstance.Item
                                    name={[
                                      actionIndex,
                                      fields.data,
                                      productIndex,
                                      fields.isMinMax,
                                    ]}
                                    className="mb-0 feeslabel"
                                    colon={false}
                                    required={false}
                                    valuePropName="checked"
                                  >
                                    <Checkbox
                                      name={fields.isMinMax}
                                      onChange={handleFieldChange}
                                      onChangeParams={[
                                        fields.isMinMax,
                                        actionIndex,
                                        productIndex,
                                        fees,
                                      ]}
                                      className="cursor-pointer"
                                    />
                                  </FormInstance.Item>
                                </td>
                              )}
                              <td
                                colSpan={2}
                                className="fees-inputfields px-3 py-2 pr-0"
                              >
                                <RenderMinMaxFee
                                  rowData={data}
                                  fees={fees}
                                  fields={fields}
                                  FormInstance={FormInstance}
                                  actionIndex={actionIndex}
                                  productIndex={productIndex}
                                  hasPrFees={hasPrFees}
                                  handleFieldChange={handleFieldChange}
                                />
                              </td>
                              {FeeTableModulesConfig[module].isFlat && (
                                <td className="fees-inputfields px-3 py-2 align-baseline">
                                  <FormInstance.Item
                                    name={[
                                      actionIndex,
                                      fields.data,
                                      productIndex,
                                      fields.isFlat,
                                    ]}
                                    className="mb-0 feeslabel"
                                    colon={false}
                                    required={false}
                                    valuePropName={"checked"}
                                  >
                                    <Checkbox
                                      name={fields.isFlat}
                                      onChange={handleFieldChange}
                                      onChangeParams={[
                                        fields.isFlat,
                                        actionIndex,
                                        productIndex,
                                        fees,
                                      ]}
                                      className="cursor-pointer"
                                    />
                                  </FormInstance.Item>
                                </td>
                              )}
                              {FeeTableModulesConfig[module].flatFee && (
                                <td className="fees-inputfields px-3 py-2 pl-0">
                                  <RenderFlatFee
                                    rowData={data}
                                    fees={fees}
                                    fields={fields}
                                    FormInstance={FormInstance}
                                    actionIndex={actionIndex}
                                    productIndex={productIndex}
                                    hasPrFees={hasPrFees}
                                    handleFieldChange={handleFieldChange}
                                  />
                                </td>
                              )}
                            </tr>
                          )}
                          {mode === "view" && (
                            <RenderMinMaxFeeView
                              rowData={data}
                              module={module}
                              fields={fields}
                              showFeeOverview={showFeeOverview}
                            />
                          )}
                        </table>
                      </td>
                    )}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default FeeTable;