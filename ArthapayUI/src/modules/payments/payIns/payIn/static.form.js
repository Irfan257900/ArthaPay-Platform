import React, { useCallback } from "react";
import { useParams } from "react-router";
import { NumericFormat } from "react-number-format";
import { InfoCircleOutlined } from '@ant-design/icons';
import { Select, Tooltip } from "antd";
import { cryptoMaxAllowedDecimals } from "../../../../utils/custom.validator";
import { dateValidOn, replaceExtraSpaces, validations } from "../../../../utils/validations";
import { allowedDecimals, normalizeFormattedNumber } from "./service";
import { useTranslation } from "react-i18next";
import AppDatePicker from "../../../../core/shared/appDatePicker";
import CryptoMerchantDropDown from './merchant.crypto.dropdown';
import AppDefaults from "../../../../utils/app.config";
const { requiredValidator, textValidator, dateValidator, numberValidator } = validations
const StaticForm = ({ FormInstance, form, lookups, loading, setState }) => {
  const { mode } = useParams();
  const { t } = useTranslation();

  const setField = (field, value) => {
    setState({ type: 'setError', payload: '' })
    let customerWalletId = form.getFieldValue('customerWalletId'), merchantName = form.getFieldValue('merchantName')
    if (field === 'currency') {
      const selectedCoin = lookups.currencies.find(coin => coin.code === value);
      form.resetFields(['networkName'])
      setState({ type: 'setLookups', payload: { ...lookups, networks: selectedCoin.networks } })
    }

    if (field === 'invoiceType') {
      form.resetFields(['amount'])
    }
    if (field === 'merchantId') {
      const selectedVault = lookups.vaults.find(vault => vault.id === value)
      merchantName = selectedVault.name
      form.resetFields(['currency', 'networkName'])
      setState({ type: 'setLookups', payload: { ...lookups, currencies: selectedVault.merchantsDetails } })
    }
    if (field === 'networkName') {
      const selectedNetwork = lookups.networks.find(network => network.code === value);
      customerWalletId = selectedNetwork.customerWalletId
    }
    form.setFieldsValue({ ...form.getFieldsValue(true), customerWalletId, merchantName, [field]: value })
  };
  const handleMerchantId = useCallback((e) => {
    setField("merchantId", e)
  }, [setField]);
  const handleAmountChange = useCallback((e) => {
    setField('amount', e.floatValue);
  }, [setField]);
  const handleCurrencyChange = useCallback((e) => {
    setField('currency', e);
  }, [setField]);
  const handleNetworkNameChange = useCallback((e) => {
    setField('networkName', e);
  }, [setField]);
  const handleDueDateChange = useCallback((e) => {
    setField('dueDate', e)
  }, [setField]);
  const normalizeAmount = useCallback((value) => (value ? normalizeFormattedNumber(value) : undefined), []);
  return (
    <div className="mt-6 ">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <CryptoMerchantDropDown form={form} coinsDetails={lookups?.vaults} isform={true} isDisable={mode !== 'generate'} />
        </div>
        <div>
          <div className={`relative`}>
            <div className="custom-input-lablel">
              {t('payments.payin.static.orderid')} &nbsp;
              <Tooltip className="c-pointer" title='Helps your client understand what they are paying for.'><InfoCircleOutlined /></Tooltip>

            </div>
            <div className="text-left">
              <FormInstance.Item
                className="payees-input m-0 error-block orderid-input"
                name="orderId"
                colon={false}
                rules={[
                  textValidator('order id', 'alphaNumWithUsHyphenAndAt', ['onlyNumbers']),
                  {
                    whitespace: true,
                    message: 'Invalid order id',
                  },
                ]}
              >
                <input
                  className="custom-input-field"
                  placeholder={t('payments.placeholders.enterorderid')}
                  type="input"
                  maxLength={30}
                  onBlur={(e) => setField("orderId", replaceExtraSpaces(e.target.value))}
                  disabled={mode !== 'generate' || (mode !== 'generate' && form.getFieldValue('status') !== 'Not Paid')}
                />
              </FormInstance.Item>
            </div>
          </div>
        </div>
      </div>
      {/* <Title className='form-title-input mb-20'>Enter Amount:</Title> */}
      <h1 className="text-2xl text-titleColor font-semibold my-5">{t('payments.payin.static.amounttopay')}</h1>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div>
          <div className={`relative`}>
            <div className="custom-input-lablel">
              {t('payments.payin.static.amount')} <span className="text-requiredRed">*</span>

            </div>
            <FormInstance.Item
              className={`payees-input amount-label`}
              name="amount"
              // label="Amount"
              colon={false}
              rules={[requiredValidator(), numberValidator('Amount')]}
              normalize={normalizeAmount}
            >
              <NumericFormat
                className={'custom-input-field'}
                placeholder={t('payments.placeholders.enteramount')}
                name={'amount'}
                isAllowed={cryptoMaxAllowedDecimals}
                thousandSeparator={true}
                thousandsGroupStyle='lakh'
                disabled={mode !== 'generate' || (mode !== 'generate' && form.getFieldValue('status') !== 'Not Paid')}
                allowNegative={false}
                decimalScale={allowedDecimals['amount']}
                onValueChange={handleAmountChange}
              />
            </FormInstance.Item>
          </div>
        </div>

        <div className={`relative`}>
          <div className="custom-input-lablel">
            {t('payments.payin.static.duedate')}<span className="text-requiredRed">*</span>
          </div>
          <div className={`text-left`}>
            <FormInstance.Item
              className="mb-4"
              name="dueDate"
              rules={[requiredValidator(), dateValidator('Due date', [{ fieldName: 'current date', value: null }], { ...dateValidOn, greaterThan: true })]}
            >
              <AppDatePicker
                datesToDisable="pastDates"
                className="custom-input-field"
                disabled={(mode !== 'generate' && form.getFieldValue('status') !== 'Not Paid')}
                onChange={handleDueDateChange}
                showTime={false}
                format={AppDefaults.formats.date}
                placeholder={AppDefaults.formats.date}
              />
            </FormInstance.Item>
          </div>
        </div>
      </div>
    </div>);
};

export default StaticForm;
