import React, { useCallback, useEffect } from 'react'
import { numberValidationHelper, validations } from '../../../../core/shared/validations'
import { Input, Table, Tooltip, Select } from 'antd'
import { NumericFormat } from 'react-number-format';
import { allowedDecimals, calculateAmounts, getTotals, normalizeFormattedNumber } from './service';
import { useParams } from 'react-router';
import NoteEditor from '../../../../core/shared/noteEditor';
import { useTranslation } from 'react-i18next';
const { requiredValidator, textValidator, numberValidator, invoiceItemsValidator, noteEditorValidator } = validations
const defaultItemValue = {
    itemName: '',
    quantity: '',
    unitPrice: '',
    discountPercentage: '',
    discountAmount: 0,
    taxPercentage: '',
    taxAmount: 0,
    amount: 0
}
const getColumns = (handleItemFieldChange, handleItemDeletion, remove, normalizeValue, normalizeFormattedValue, columnsParams) => {
    const { mode, FormInstance, t } = columnsParams;
    const createFieldChangeHandler = (index, field) => (values) => handleItemFieldChange(index, field, values.floatValue);
    const getMinFieldValue = (field) => {
        return 1 / (10 ** allowedDecimals[field])
    }
    const basicColumns = [
        {
            title: <span className="text-sm font-semibold text-lightWhite">
                {t('payments.payin.invoice.itemname')} <span className="text-requiredRed">*</span>
            </span>,
            dataIndex: 'itemName',
            key: 'itemName',
            minWidth: '150px',
            render: (_, __, index) => (
                <FormInstance.Item
                    name={[index, 'itemName']}
                    rules={[requiredValidator(), textValidator('item name', 'alphaNumWithSpaceUsAndHyphen')]}
                    className="mb-0"
                >
                    <Input
                        placeholder={t('payments.placeholders.enteritemname')}
                        disabled={mode !== 'generate'}
                        maxLength={30}
                        className="table-input !bg-inputBg text-lightWhite border-0 outline-offset-0 outline-0 h-h42 px-3 focus:!bg-tableInputBg hover:!bg-tableInputBg focus:border-none focus-within::bg-tableInputBg rounded-sm"
                    />
                </FormInstance.Item>
            ),
        },
        {
            title: <span className="text-sm font-semibold text-lightWhite">
                {t('payments.payin.invoice.qty')} <span className="text-requiredRed">*</span>
            </span>,
            dataIndex: 'quantity',
            key: 'quantity',
            minWidth: '100px',
            render: (_, __, index) => (
                <FormInstance.Item
                    name={[index, 'quantity']}
                    rules={[requiredValidator(), numberValidator('Quantity', { ...numberValidationHelper, minLimit: getMinFieldValue('quantity') })]}
                    normalize={normalizeValue}
                    className="mb-0"
                >
                    <NumericFormat
                        className="table-input !bg-inputBg text-lightWhite border-0 outline-none h-h42 px-3 focus:!bg-menuhover hover:!bg-menuhover focus:border-none focus-within::bg-menuhover rounded-sm w-28 text-ellipsis"
                        placeholder={t('payments.placeholders.enterquantity')}
                        name={'quantity'}
                        thousandSeparator={true}
                        thousandsGroupStyle='lakh'
                        disabled={false}
                        allowNegative={false}
                        fixedDecimalScale={mode !== 'generate'}
                        decimalScale={allowedDecimals['quantity']}
                        displayType={mode !== 'generate' ? 'text' : 'input'}
                        onValueChange={createFieldChangeHandler(index, 'quantity')}
                    />
                </FormInstance.Item>
            ),
        },
        {
            title: <span className="text-sm font-semibold text-lightWhite">
                {t('payments.payin.invoice.unitprice')} <span className="text-requiredRed">*</span>
            </span>,
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            minWidth: '120px',
            render: (_, __, index) => (
                <FormInstance.Item
                    name={[index, 'unitPrice']}
                    rules={[requiredValidator(), numberValidator('Unit price', { ...numberValidationHelper, minLimit: getMinFieldValue('unitPrice') })]}
                    normalize={normalizeValue}
                    className="mb-0"
                >
                    <NumericFormat
                        className="table-input !bg-inputBg text-lightWhite border-0 outline-none h-h42 px-3 focus:!bg-menuhover hover:!bg-menuhover focus:border-none focus-within::bg-menuhover rounded-sm w-28 text-ellipsis"
                        placeholder={t('payments.placeholders.enterunitprice')}
                        name={'unitPrice'}
                        thousandSeparator={true}
                        thousandsGroupStyle='lakh'
                        disabled={false}
                        allowNegative={false}
                        decimalScale={allowedDecimals['unitPrice']}
                        fixedDecimalScale={mode !== 'generate'}
                        displayType={mode !== 'generate' ? 'text' : 'input'}
                        onValueChange={createFieldChangeHandler(index, 'unitPrice')}
                    />
                </FormInstance.Item>
            ),
        },
        {
            title: <span className="text-sm font-semibold text-lightWhite">
                {t('payments.payin.invoice.discount')} <span className="text-requiredRed">*</span>
            </span>,
            dataIndex: 'discountPercentage',
            key: 'discountPercentage',
            minWidth: '100px',
            children: [
                {

                    dataIndex: 'discountPercentage',
                    align: 'center',
                    onCell: () => ({
                        colSpan: 1
                    }),
                    minWidth: '0px',
                    render: (_, __, index) => (
                        <>
                            <div className='flex items-center gap-1'>
                                <p className='text-sm font-normal text-lightWhite'>%</p>
                                <FormInstance.Item
                                    name={[index, 'discountPercentage']}
                                    className="mb-0"
                                    normalize={normalizeValue}
                                    rules={[requiredValidator(), numberValidator('Discount %', { ...numberValidationHelper, maxLimit: 100, maxLimitString: '100' })]}
                                >
                                    <NumericFormat
                                        className="table-input !bg-inputBg text-lightWhite border-0 outline-none h-h42 px-3 focus:!bg-menuhover hover:!bg-menuhover focus:border-none focus-within::bg-menuhover rounded-sm w-28 text-ellipsis"
                                        placeholder={t('payments.placeholders.enterdiscount')}
                                        name={'discountPercentage'}
                                        thousandSeparator={true}
                                        thousandsGroupStyle='lakh'
                                        disabled={false}
                                        allowNegative={false}
                                        displayType={mode !== 'generate' ? 'text' : 'input'}
                                        decimalScale={allowedDecimals['discountPercentage']}
                                        fixedDecimalScale={mode !== 'generate'}
                                        onValueChange={createFieldChangeHandler(index, 'discountPercentage')}
                                    />
                                </FormInstance.Item>
                            </div>
                        </>),
                },
                {
                    dataIndex: 'discountAmount',
                    align: 'center',
                    onCell: () => ({
                        colSpan: 1,
                    }),
                    minWidth: '100px',
                    render: (_, __, index) => {
                        return <FormInstance.Item
                            name={[index, 'discountAmount']}
                            className="mb-0"
                            normalize={normalizeFormattedValue}
                        ><NumericFormat
                                className="text-lightWhite  border-0 outline-none h-h42 px-3 focus:border-none focus-within::bg-menuhover rounded-sm w-28 text-ellipsis"
                                placeholder="0.00"
                                name={'discountAmount'}
                                thousandSeparator={true}
                                thousandsGroupStyle='lakh'
                                disabled={false}
                                defaultValue={0}
                                allowNegative={false}
                                fixedDecimalScale={true}
                                decimalScale={allowedDecimals['discountAmount']}
                                displayType='text'
                            />
                        </FormInstance.Item>
                    },
                },
            ],
        },
        {
            title: <span className="text-sm font-semibold text-lightWhite">
                {t('payments.payin.invoice.tax')} <span className="text-requiredRed">*</span>
            </span>,
            dataIndex: 'taxPercentage',
            key: 'taxPercentage',
            onCell: () => ({
                ColSpa: 1,
            }),
            minWidth: '100px',
            children: [
                {

                    dataIndex: 'taxPercentage',
                    align: 'center',
                    onCell: () => ({
                        colSpan: 1
                    }),
                    minWidth: '100px',
                    render: (_, __, index) => (
                        <>
                            <div className='flex items-center gap-1'>
                                <p className='text-sm font-normal text-lightWhite'>%</p>
                                <FormInstance.Item
                                    name={[index, 'taxPercentage']}
                                    className="mb-0"
                                    normalize={normalizeValue}
                                    rules={[requiredValidator(), numberValidator('Tax %', { ...numberValidationHelper, maxLimit: 100, maxLimitString: '100' })]}
                                >
                                    <NumericFormat
                                        className="table-input !bg-inputBg text-lightWhite border-0 outline-none h-h42 px-3 focus:!bg-menuhover hover:!bg-menuhover focus:border-none focus-within::bg-menuhover rounded-sm w-28"
                                        placeholder={t('payments.placeholders.entertax')}
                                        name={'taxPercentage'}
                                        thousandSeparator={true}
                                        thousandsGroupStyle='lakh'
                                        disabled={false}
                                        allowNegative={false}
                                        displayType={mode !== 'generate' ? 'text' : 'input'}
                                        decimalScale={allowedDecimals['taxPercentage']}
                                        fixedDecimalScale={mode !== 'generate'}
                                        onValueChange={createFieldChangeHandler(index, 'taxPercentage')}
                                    />
                                </FormInstance.Item>
                            </div>
                        </>),
                },
                {

                    dataIndex: 'taxAmount',
                    align: 'center',
                    onCell: () => ({
                        colSpan: 1,
                    }),
                    minWidth: '100px',
                    render: (_, __, index) => {
                        return <FormInstance.Item
                            name={[index, 'taxAmount']}
                            normalize={normalizeFormattedValue}
                            className="mb-0"
                        ><NumericFormat
                                className="table-input  border-0 outline-none h-h42 px-3 focus:border-none focus-within::bg-tableInputBg rounded-sm w-28"
                                placeholder="0.00"
                                name={'taxAmount'}
                                thousandSeparator={true}
                                thousandsGroupStyle='lakh'
                                disabled={false}
                                allowNegative={false}
                                fixedDecimalScale={true}
                                defaultValue={0}
                                decimalScale={allowedDecimals['taxAmount']}
                                displayType='text'
                            />
                        </FormInstance.Item>
                    },
                },
            ],
        },
        {
            title: <span className="text-sm font-semibold text-lightWhite">
                {t('payments.payin.invoice.amount')} <span className="text-requiredRed">*</span>
            </span>,
            dataIndex: 'amount',
            key: 'amount',
            minWidth: '120px',
            render: (_, __, index) => {
                return <FormInstance.Item
                    name={[index, 'amount']}
                    normalize={normalizeFormattedValue}
                    rules={[requiredValidator()]}
                    className="mb-0"
                >
                    <NumericFormat
                        className="table-input  text-lightWhite border-0 outline-none h-h42 px-3 focus:border-none focus-within::bg-tableInputBg w-28"
                        placeholder="0.00"
                        name={'amount'}
                        thousandSeparator={true}
                        thousandsGroupStyle='lakh'
                        allowNegative={false}
                        maxLength={20}
                        defaultValue={0}
                        decimalScale={allowedDecimals['amount']}
                        fixedDecimalScale={true}
                        displayType={'text'}
                    />
                </FormInstance.Item>
            },
        },
    ]

    return mode !== 'generate' ? basicColumns : [...basicColumns, {
        title: '',
        dataIndex: 'delete',
        key: 'delete',
        render: (_, __, index) => (
            <button className="btn-plane"
                onClick={(e) => handleItemDeletion(e, index, remove)}
                disabled={mode !== 'generate'}
            ><span className='icon delete lg c-pointer'></span></button>
        ),
    },]
}
const InvoiceItemsForm = ({ FormInstance, form, lookups, setState }) => {

    const { t } = useTranslation();
    const { mode } = useParams();
    const invoiceCurrencyValue = form.getFieldValue('invoiceCurrency');
    const setField = (field, value) => {
        setState({ type: 'setError', payload: '' })
        const currentValues = form.getFieldsValue(true)
        let customerWalletId = currentValues.customerWalletId, merchantName = currentValues.merchantName;
        if (field === 'merchantName') {
            const selectedVault = lookups.vaults.find(vault => vault.id === value);
            merchantName = selectedVault.name
            form.resetFields(['currency', 'networkName']);
            setState({ type: 'setSelectedVault', payload: selectedVault })
            setState({ type: 'setLookups', payload: { ...lookups, currencies: selectedVault.merchantsDetails } })
        }
        if (field === 'currency') {
            const selectedCoin = lookups.currencies.find(coin => coin.code === value);
            form.resetFields(['networkName'])
            setState({ type: 'setLookups', payload: { ...lookups, networks: selectedCoin.networks } })
        }
        if (field === 'networkName') {
            const selectedNetwork = lookups.networks.find(network => network.code === value);
            customerWalletId = selectedNetwork.customerWalletId
        }
        form.setFieldsValue({ ...form.getFieldsValue(true), [field]: value, merchantName, customerWalletId })
    }

    useEffect(() => {
        if (lookups?.vaults?.length === 1) {
            setField('merchantName', lookups?.vaults?.[0]?.id);
        }
    }, [lookups?.vaults])

    const handleItemFieldChange = (index, field, value) => {
        try {
            setState({ type: 'setError', payload: '' })
            const currentValues = form.getFieldsValue(true)
            const items = [...form.getFieldValue('details')];
            let item = items[index] || {}
            const valueToBeUpdated = normalizeFormattedNumber(value)
            let { discountPercentage, unitPrice, quantity, taxPercentage } = item
            discountPercentage = field === 'discountPercentage' ? valueToBeUpdated : normalizeFormattedNumber(discountPercentage);
            unitPrice = field === 'unitPrice' ? valueToBeUpdated : normalizeFormattedNumber(unitPrice);
            quantity = field === 'quantity' ? valueToBeUpdated : normalizeFormattedNumber(quantity);
            taxPercentage = field === 'taxPercentage' ? valueToBeUpdated : normalizeFormattedNumber(taxPercentage);
            const amounts = calculateAmounts(quantity, unitPrice, discountPercentage, taxPercentage);
            item = { ...item, ...amounts, [field]: valueToBeUpdated }
            items[index] = item
            form.setFieldsValue({ ...currentValues, details: items, ...getTotals(items) })
        } catch (error) {

        }
    }
    const handleItemDeletion = (event, index, remove) => {
        event.preventDefault()
        setState({ type: 'setError', payload: '' })
        const items = [...form.getFieldValue('details')]
        items.splice(index, 1)
        remove(index)
        form.setFieldsValue({ ...form.getFieldsValue(true), ...getTotals(items) })
    };


    const handleTotalAmountTax = useCallback((value) => {
        normalizeFormattedNumber(value);
    }, []);

    const handleMerchantId = useCallback((e) => {
        setField('merchantName', e);
    }, [form, setField]);

    const handleCurrencyChange = useCallback((e) => {
        setField('currency', e);
    }, [form, setField]);

    const handleNetworkChange = useCallback((e) => {
        setField('networkName', e);
    }, [form, setField]);

    const handleNoteChange = useCallback((content) => {
        setField('paymentNote', content);
    }, [form, setField])
    const normalizeValue = useCallback((value) => (value ? normalizeFormattedNumber(value) : undefined), []);
    const normalizeFormattedValue = useCallback((value) => normalizeFormattedNumber(value), []);
    const shouldUpdatePaymentType = useCallback((prev, curr) => prev.paymentNote !== curr.paymentNote, [],);
    const columnsParams = { mode: mode, FormInstance: FormInstance, t: t };
    return (
        <>
            <FormInstance.List name={'details'} rules={[invoiceItemsValidator()]} >
                {(fields, { add, remove }, { errors }) => {
                    return <div className="">
                        <div className="flex items-center justify-between">
                            <h3 className='text-2xl font-semibold text-titleColor mt-3 mb-2'>{t('payments.payin.invoice.amountdetails')}</h3>
                            <div className="" >
                                {mode === 'generate' && <div className="text-right export-pdf secureDropdown">
                                    <button disabled={mode !== 'generate'} className="c-pointer btn-style" onClick={(e) => {
                                        e.preventDefault()
                                        add(defaultItemValue)
                                    }}>
                                        <Tooltip placement="top" title={t('payments.tooltips.additemdetails')}><span className="icon add-links"></span>
                                        </Tooltip>
                                    </button>
                                </div>}
                            </div>
                        </div>
                        <div className="!w-full custom-payins-scroll overflow-auto" >
                            <Table
                                columns={getColumns(handleItemFieldChange, handleItemDeletion, remove, normalizeValue, normalizeFormattedValue, columnsParams)}
                                dataSource={fields}
                                bordered
                                className='amount-table min-w-[650px]'
                                pagination={false}
                            />
                        </div>
                        <FormInstance.ErrorList errors={errors} />
                    </div>
                }}

            </FormInstance.List>
            <div className='mt-5 max-w-[371px] w-full ml-auto'>
                <div className='flex items-center justify-between'>
                    <p className='text-sm text-lightWhite font-normal mb-0'>{t('payments.payin.invoice.totalamountexcludingtax')}:</p>
                    <FormInstance.Item name='amountwithoutTax'
                        normalize={handleTotalAmountTax} className="mb-0 ">
                        <NumericFormat
                            className={'text-sm font-normal text-lightWhite'}
                            placeholder="0.00"
                            name={'amountwithoutTax'}
                            thousandSeparator={true}
                            thousandsGroupStyle='lakh'
                            disabled={false}
                            allowNegative={false}
                            defaultValue={0}
                            fixedDecimalScale={true}
                            decimalScale={allowedDecimals['amountwithoutTax']}
                            displayType='text'
                        />
                    </FormInstance.Item>
                </div>
                <hr className='border-StrokeColor my-2' />
                <div className='flex items-center justify-between'>
                    <p className='text-sm text-lightWhite font-normal mb-0'>{t('payments.payin.invoice.totaltaxamount')}:</p>
                    <FormInstance.Item name='taxAmount' normalize={handleTotalAmountTax} className="mb-0 ">
                        <NumericFormat
                            className={'text-sm font-normal text-lightWhite'}
                            placeholder="0.00"
                            name={'taxAmount'}
                            thousandSeparator={true}
                            thousandsGroupStyle='lakh'
                            disabled={false}
                            allowNegative={false}
                            fixedDecimalScale={true}
                            defaultValue={0}
                            decimalScale={allowedDecimals['taxAmount']}
                            displayType='text'
                        />
                    </FormInstance.Item>
                </div>
                <hr className='border-inputDarkBorder my-2' />
                <div className='flex items-center justify-between'>
                    <p className='text-sm text-lightWhite font-normal mb-0'>{t('payments.payin.invoice.totaldiscount')}:</p>
                    <FormInstance.Item
                        name='totalDiscount'
                        normalize={handleTotalAmountTax} className="mb-0 ">
                        <NumericFormat
                            className={'text-sm font-normal text-lightWhite'}
                            placeholder="0.00"
                            name={'totalDiscount'}
                            thousandSeparator={true}
                            thousandsGroupStyle='lakh'
                            disabled={false}
                            defaultValue={0}
                            allowNegative={false}
                            fixedDecimalScale={true}
                            decimalScale={allowedDecimals['totalDiscount']}
                            displayType='text'
                        />
                    </FormInstance.Item>
                </div>
                <hr className='border-StrokeColor my-2' />
                <div className='flex items-center justify-between'>
                    <p className='text-sm text-lightWhite font-normal mb-0'>{t('payments.payin.invoice.dueamount')}:</p>
                    <FormInstance.Item name='dueAmount' normalize={handleTotalAmountTax} className="mb-0">
                        <NumericFormat
                            className={'text-sm font-normal text-lightWhite'}
                            placeholder="0.00"
                            name={'dueAmount'}
                            thousandSeparator={true}
                            thousandsGroupStyle='lakh'
                            disabled={false}
                            defaultValue={0}
                            allowNegative={false}
                            fixedDecimalScale={true}
                            decimalScale={allowedDecimals['dueAmount']}
                            displayType='text'
                            suffix={invoiceCurrencyValue ? invoiceCurrencyValue : ''}
                        />
                    </FormInstance.Item>
                </div>
                <hr className='border-StrokeColor mb-9 mt-2' />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {lookups?.vaults?.length > 1 && <div className={`relative`}>
                    <div className="custom-input-lablel">
                        {t('payments.payin.invoice.choosevault')}<span className="text-requiredRed">*</span>
                    </div>
                    <div className="text-left">
                        <FormInstance.Item
                            name="merchantName"
                            rules={[requiredValidator()]}
                            className="mb-0 custom-select-float"
                            colon={false}
                        >
                            <Select
                                className="p-0 rounded outline-0 w-full text-lightWhite"
                                placeholder={t('payments.placeholders.choosevault')}
                                onSelect={handleMerchantId}
                                disabled={mode !== 'generate'}
                                fieldNames={{ label: 'name', value: 'id' }}
                                options={lookups?.vaults || []}
                            />
                        </FormInstance.Item>
                    </div>
                </div>}

                <div className={`relative`}>
                    <div className="custom-input-lablel">
                        {t('payments.payin.invoice.selectcoin')}<span className="text-requiredRed">*</span>

                    </div>
                    <div className="text-left">
                        <FormInstance.Item
                            name="currency"
                            rules={[requiredValidator()]}
                            className="mb-0 custom-select-float"
                            colon={false}
                        >
                            <Select
                                className="p-0 rounded outline-0 w-full text-lightWhite"
                                placeholder={t('payments.placeholders.selectcoin')}
                                onChange={handleCurrencyChange}
                                disabled={mode !== 'generate'}
                            >
                                {lookups?.currencies?.map((item) => (
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
                                    </Option>
                                ))}
                            </Select>
                        </FormInstance.Item>
                    </div>
                </div>

                <div className={`relative`}>
                    <div className="custom-input-lablel">
                        {t('payments.payin.invoice.selectnetwork')}<span className="text-requiredRed">*</span>

                    </div>
                    <div className="text-left">
                        <FormInstance.Item
                            name="networkName"
                            rules={[requiredValidator()]}
                            className="mb-0 custom-select-float"
                            colon={false}
                        >
                            <Select
                                className="p-0 rounded outline-0 w-full text-lightWhite"
                                placeholder={t('payments.placeholders.selectnetwork')}
                                onSelect={handleNetworkChange}
                                disabled={mode !== 'generate'}
                                fieldNames={{ label: 'name', value: 'code' }}
                                options={lookups?.networks || []}
                            />
                        </FormInstance.Item>
                    </div>
                </div>
            </div>
            <div className='mt-5'>
                <div >
                    <div className={`text-left`}>
                        <div className="mb-4">
                            <div className="text-labelGrey text-sm font-normal">
                                {t('payments.payin.invoice.notes')}
                            </div>
                        </div>
                        <div className="">
                            <FormInstance.Item shouldUpdate={shouldUpdatePaymentType}>
                                {({ getFieldValue, getFieldError }) => {
                                    const paymentNote = getFieldValue('paymentNote');
                                    return <FormInstance.Item
                                        name="paymentNote"
                                        rules={[noteEditorValidator(4000)]}
                                        className="mb-0"
                                        colon={false}
                                    >
                                        <NoteEditor hasError={getFieldError('paymentNote')?.length > 0} disabled={mode !== 'generate'} initialContent={paymentNote} onChange={handleNoteChange} />
                                    </FormInstance.Item>
                                }}
                            </FormInstance.Item>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default InvoiceItemsForm