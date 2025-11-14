import { Input, Tooltip } from 'antd'
import React, { useCallback } from 'react'
import { businessNameRegex, dateValidOn, replaceExtraSpaces, validations } from '../../../../core/shared/validations'
import { useParams } from 'react-router'
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import AppDatePicker from '../../../../core/shared/appDatePicker';
import AppDefaults from '../../../../utils/app.config';
const { requiredValidator, textValidator, dateValidator, ccEmailsValidator, regexValidator } = validations
const InvoiceInfoForm = ({ FormInstance, form, setState }) => {
    const { mode } = useParams();
    const { t } = useTranslation();
    const setField = (field, value) => {
        setState({ type: 'setError', payload: '' })
        const currentValues = form.getFieldsValue(true)
        if (mode !== 'generate' && (field !== 'dueDate' || field !== 'invoiceNumber')) {
            form.setFieldsValue({ ...currentValues })
            return;
        }
        form.setFieldsValue({ ...currentValues, [field]: value })
    };
    const handleInputChange = useCallback((e) => {
        setField(e?.target?.id, e?.target?.value)
    }, [form, setField]);

    const handleBlur = useCallback((e) => {
        setField(e?.target?.id, replaceExtraSpaces(e.target.value))
    }, [form, setField]);

    const handleIssuedDate = useCallback((date) => {
        setField('issuedDate', date);
    }, [form, setField]);

    const handleDueDate = useCallback((date) => {
        setField('dueDate', date);
    }, [form, setField]);
    const shouldUpdateIssuedDate = useCallback((prev, curr) => {
        return prev.issuedDate !== curr.issuedDate;
    }, []);
    const shouldUpdateDueDate = useCallback((prev, curr) => {
        return (prev.dueDate !== curr.dueDate || prev.issuedDate !== curr.issuedDate)
    }, []);
    return (
        <>
            <div className="mt-7 mb-6">
                <h3 className='text-2xl font-semibold text-titleColor'>{t('payments.payin.invoice.basic')}</h3>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                    <div className={`relative`}>
                        <div className="custom-input-lablel">
                            {t('payments.payin.invoice.orderid')}
                            <Tooltip className="c-pointer pl-2" title='Helps your client understand what they are paying for.'><InfoCircleOutlined /></Tooltip>
                        </div>
                        <div className="text-left">
                            <FormInstance.Item
                                name="orderId"
                                className="mb-0"
                                colon={false}
                                rules={[
                                    textValidator('order id', 'alphaNumWithUsHyphenAndAt', ['onlyNumbers']),
                                    {
                                        whitespace: true,
                                        message: 'Invalid order id',
                                    },
                                ]}
                            >
                                <Input
                                    disabled={mode !== 'generate'}
                                    onChange={handleInputChange}
                                    placeholder={t('payments.placeholders.enterorderid')}
                                    className="custom-input-field"
                                    maxLength={20}
                                    onBlur={handleBlur}
                                />
                            </FormInstance.Item>
                        </div>
                    </div>
                </div>
                <div className='col-start-1'>
                    <div className={`relative`}>
                        <div className="custom-input-lablel">
                            {t('payments.payin.invoice.issueddate')}<span className="text-requiredRed">*</span>
                        </div>
                        <div className="text-left">
                            <FormInstance.Item className="mb-0" shouldUpdate={shouldUpdateIssuedDate}>
                                {() => {
                                    return <FormInstance.Item
                                        name="issuedDate"
                                        rules={[requiredValidator(), dateValidator('Issued date', [{ validateAgainstCurrent: true, fieldName: 'current date', value: null }], { ...dateValidOn, lessThanOrEqual: true })]}
                                        className="mb-0"
                                        colon={false}
                                    >
                                        <AppDatePicker datesToDisable='pastDates'
                                            className="custom-input-field" disabled={mode !== 'generate'} onChange={handleIssuedDate} />
                                    </FormInstance.Item>
                                }}
                            </FormInstance.Item>

                        </div>
                    </div>
                </div>
                <div>
                    <div className={`relative`}>
                        <div className="custom-input-lablel">
                            {t('payments.payin.invoice.duedate')}<span className="text-requiredRed">*</span>

                        </div>
                        <div className="text-left">
                            <FormInstance.Item className="mb-0" shouldUpdate={shouldUpdateDueDate}>
                                {() => {
                                    return (
                                        <FormInstance.Item
                                            name="dueDate"
                                            rules={[
                                                requiredValidator(),
                                                dateValidator(
                                                    "Due date",
                                                    [
                                                        {
                                                            fieldName: "issued date",
                                                            value: form.getFieldValue("issuedDate"),
                                                        },
                                                    ],
                                                    { ...dateValidOn, greaterThan: false }
                                                ),
                                            ]}
                                            className="mb-0"
                                            colon={false}
                                        >
                                            <AppDatePicker
                                                datesToDisable="pastDates"
                                                className="custom-input-field"
                                                onChange={handleDueDate}
                                                showTime={false}
                                                format={AppDefaults.formats.date}
                                                placeholder={AppDefaults.formats.date}
                                            />
                                        </FormInstance.Item>
                                    );
                                }}
                            </FormInstance.Item>
                        </div>
                    </div>
                </div>
            </div>
            <div >
                <h3 className='text-2xl font-semibold text-titleColor mb-6 mt-5'>{t('payments.payin.invoice.addressdetails')}</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className={`relative`}>
                        <div className="custom-input-lablel">
                            {t('payments.payin.invoice.companyname')}<span className="text-requiredRed">*</span>
                        </div>
                        <div className="text-left">
                            <FormInstance.Item
                                name="companyName"
                                rules={[
                                    requiredValidator(),
                                    regexValidator('company name', businessNameRegex),
                                    {
                                        whitespace: true,
                                        message: 'Invalid company name'
                                    }
                                ]}
                                className="mb-0"
                                colon={false}
                            >
                                <Input
                                    onChange={handleInputChange}
                                    placeholder={t('payments.placeholders.entercompanyname')}
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
                            {t('payments.payin.invoice.client')}<span className="text-requiredRed">*</span>
                        </div>
                        <div className="text-left">
                            <FormInstance.Item
                                name="clientName"
                                rules={[
                                    requiredValidator(),
                                    textValidator('client name', 'alphaNumWithSpaceAndSpecialChars'),
                                    {
                                        whitespace: true,
                                        message: 'Invalid client name'
                                    }
                                ]}
                                className="mb-0"
                                colon={false}
                            >
                                <Input
                                    onChange={handleInputChange}
                                    placeholder={t('payments.placeholders.enterclientname')}
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
                            {t('payments.payin.invoice.ccemails')}<span className="text-requiredRed">*</span>&nbsp;<Tooltip className="c-pointer" title='Add multiple CC emails with commas between them.'><InfoCircleOutlined /></Tooltip>

                        </div>
                        <div className="text-left">
                            <FormInstance.Item
                                name="emails"
                                rules={[requiredValidator(), ccEmailsValidator()]}
                                className="mb-0"
                                colon={false}
                            >
                                <Input
                                    onChange={handleInputChange}
                                    placeholder={t('payments.placeholders.exampleemail')}
                                    className="custom-input-field"
                                    maxLength={150}
                                    disabled={mode !== 'generate'}
                                    onBlur={handleBlur}
                                />
                            </FormInstance.Item>
                        </div>
                    </div>
                </div>
                {/* <FormInstance.Item name="clientWillPayCommission" className={``} valuePropName="checked">
                    <Checkbox disabled={mode!=='generate'} onChange={(e) => setField('clientWillPayCommission', e.target.checked)} className="mr-6"></Checkbox>
                    <span className="checkbox-text"><div className='commisions-terms'>Client will pay commission</div></span>
                </FormInstance.Item> */}
            </div></>
    )
}

export default InvoiceInfoForm