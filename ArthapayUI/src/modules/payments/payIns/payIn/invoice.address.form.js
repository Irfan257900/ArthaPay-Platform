import { Input, Select } from 'antd'
import React, { useCallback } from 'react'
import { replaceExtraSpaces, validations } from '../../../../core/shared/validations'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
const { Option } = Select
const { requiredValidator, textValidator, cityValidator, taxIdentificationValidator, zipCodeValidator } = validations
const InvoiceAddressForm = ({ FormInstance, form, lookups, loading, getStates, setState }) => {
    const { mode } = useParams();
    const { t } = useTranslation();

    const setField = (field, value) => {
        setState({ type: 'setError', payload: '' });
        const currentValues = form.getFieldsValue(true);
        if (field === 'country') {
            getStates(value);
            form.resetFields(['state']);
        } else {
            form.setFieldsValue({ ...currentValues, [field]: value });
        }
    };

    const handleInputChange = useCallback((e) => {
        setField(e?.target?.id, e?.target?.value);
    }, [form, setField]);

    const handleBlur = useCallback((e) => {
        setField(e?.target?.id, replaceExtraSpaces(e?.target?.value));
    }, [form, setField]);

    const handleCountrySelect = useCallback((value) => {
        setField("country", value);
    }, [form, setField]);

    const handleStateSelect = useCallback((value) => {
        setField("state", value);
    }, [form, setField]);

    const handleInvoiceCurrency = useCallback((e) => {
        setField('invoiceCurrency', e);
    }, [form, setField])

    return (
        <div className='mt-6'>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className={`relative`}>
                    <div className="custom-input-lablel">
                        {t('payments.payin.invoice.country')}<span className="text-requiredRed">*</span>

                    </div>
                    <div className="text-left ">
                        <FormInstance.Item
                            name="country"
                            rules={[requiredValidator()]}
                            className="mb-0 custom-select-float"
                            colon={false}
                        >
                            <Select
                                showSearch
                                allowClear
                                className="p-0 rounded outline-0 w-full text-lightWhite cursor-pointer"
                                placeholder={t('payments.placeholders.selectcountry')}
                                onSelect={handleCountrySelect}
                                fieldNames={{ label: 'name', value: 'name' }}
                                options={lookups?.countries || []}
                                disabled={mode !== 'generate'}
                            />
                        </FormInstance.Item>
                    </div>
                </div>
                <div className={`relative`}>
                    <div className="custom-input-lablel">
                        {t('payments.payin.invoice.state')}
                    </div>
                    <div className="text-left">
                        <FormInstance.Item
                            name="state"
                            className="mb-0 custom-select-float"
                            colon={false}
                        >
                            <Select
                                showSearch
                                allowClear
                                className="p-0 rounded outline-0 w-full text-lightWhite"
                                placeholder={t('payments.placeholders.selectstate')}
                                onSelect={handleStateSelect}
                                loading={loading === 'gettingStates'}
                                fieldNames={{ label: 'name', value: 'name' }}
                                options={lookups?.states || []}
                                disabled={mode !== 'generate'}
                            />
                        </FormInstance.Item>
                    </div>
                </div>
                <div className={`relative`}>
                    <div className="custom-input-lablel">
                        {t('payments.payin.invoice.city')}
                    </div>
                    <div className="text-left">
                        <FormInstance.Item
                            name="city"
                            className="mb-0"
                            colon={false}
                            rules={[
                                cityValidator('city name')(),
                                {
                                    whitespace: true,
                                    message: 'Invalid city name'
                                }
                            ]}
                        >
                            <Input
                                onChange={handleInputChange}
                                placeholder={t('payments.placeholders.entercity')}
                                className="custom-input-field"
                                maxLength={30}
                                disabled={mode !== 'generate'}
                                onBlur={handleBlur}
                            />
                        </FormInstance.Item>
                    </div>
                </div>

                <div className={`relative`}>
                    <div className="custom-input-lablel">
                        {t('payments.payin.invoice.street')}<span className="text-requiredRed">*</span>

                    </div>
                    <div className="text-left">
                        <FormInstance.Item
                            name="streetAddress"
                            rules={[
                                requiredValidator(),
                                {
                                    ...textValidator('street address', 'alphaNumWithSpaceAndSpecialChars'),
                                    whitespace: true,
                                    message: 'Invalid street address'
                                }
                            ]}
                            className="mb-0"
                            colon={false}
                        >
                            <Input
                                onChange={handleInputChange}
                                placeholder={t('payments.placeholders.enterstreetaddress')}
                                className="custom-input-field"
                                maxLength={50}
                                disabled={mode !== 'generate'}
                                onBlur={handleBlur}
                            />
                        </FormInstance.Item>
                    </div>
                </div>

                <div className={`relative`}>
                    <div className="custom-input-lablel">
                        Postal Code<span className="text-requiredRed">*</span>
                    </div>
                    <div className="text-left">
                        <FormInstance.Item
                            name="zipCode"
                            rules={[requiredValidator(), zipCodeValidator('zip code', form.getFieldValue('country'))]}
                            className="mb-0"
                            colon={false}
                        >
                            <Input
                                onChange={handleInputChange}
                                placeholder='Enter Postal Code'
                                className="custom-input-field"
                                maxLength={9}
                                disabled={mode !== 'generate'}
                                onBlur={handleBlur}
                            />
                        </FormInstance.Item>
                    </div>
                </div>
                <div className={`relative`}>
                    <div className="custom-input-lablel">
                        {t('payments.payin.invoice.invoicecurrency')}<span className="text-requiredRed">*</span>
                    </div>
                    <div className="text-left">
                        <FormInstance.Item
                            name="invoiceCurrency"
                            rules={[requiredValidator()]}
                            className="mb-0 custom-select-float"
                            colon={false}
                        >
                            <Select
                                className="p-0 rounded outline-0 w-full text-lightWhite"
                                placeholder={t('payments.placeholders.selectcurrency')}
                                onChange={handleInvoiceCurrency}
                                disabled={mode !== 'generate'}
                            >
                                {lookups?.invoiceCurrencies?.map((item) => (
                                    <Option key={item?.id || item?.code} value={item?.code}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            <img
                                                className="rounded-full w-6 h-6"
                                                src={item?.image}
                                                alt={item?.code}
                                            />
                                            <span>{item?.code}</span>
                                        </div>
                                        {/* <span className={`active-coin crypto coin sm ${item?.code.toLowerCase()} mr-4`}></span>
                                        <span>{item?.code}</span> */}
                                    </Option>
                                ))}
                            </Select>
                        </FormInstance.Item>
                    </div>
                </div>
                <div className={`relative`}>
                    <div className="custom-input-lablel">
                        {t('payments.payin.invoice.taxidennum')}<span className="text-requiredRed">*</span>

                    </div>
                    <div className="text-left">
                        <FormInstance.Item
                            name="taxIdentificationNumber"
                            rules={[requiredValidator(), taxIdentificationValidator('tax identification number', form.getFieldValue('country'))]}
                            className="mb-0"
                            colon={false}
                        >
                            <Input
                                onChange={handleInputChange}
                                placeholder={t('payments.placeholders.entertaxnum')}
                                className="custom-input-field"
                                maxLength={50}
                                disabled={mode !== 'generate'}
                                onBlur={handleBlur}
                            />
                        </FormInstance.Item>
                    </div>
                </div>
            </div>
        </div>)
}

export default InvoiceAddressForm