import React from 'react'
import { Button, Input, Table, Tooltip, Typography } from 'antd'
import { NumericFormat } from "react-number-format";
import {
cryptoMaxAllowedDecimals,
validateContentRule,
validateAddressType
} from '../../../utils/custom.validator';
import { validations } from '../../../utils/validations';
import AppDefaults from '../../../utils/app.config';
import { useTranslation } from 'react-i18next';
const { requiredValidator } = validations

const { Title } = Typography;
const PayeesGrid = (
  { data,
    form,
    FormInstance,
    addRow,
    removeRow,
    downloadSampleExcel,
    handleInputChange,
    formValues,
    handleImportToExcel }
) => {

  const {t} = useTranslation();
  const handleSampleExcel = async (e) => {
    e.preventDefault();
    downloadSampleExcel();
  }
  const createFieldChangeHandler = (index, field) => (e) => handleInputChange(index, field, e.target.value,data);
  const createAmountFieldChangeHandler = (index, field) => (values) => handleInputChange(index, field, values.floatValue,data);
  const handleBlur =(index)=>{
    if (form) {
      form.validateFields([['payees', index, 'recipientAddress']]);
    }
  }
  const columns = [
    {
      title: <span className="text-sm font-semibold text-paraColor">{t('payments.batchpayouts.sno')}</span>,
      dataIndex: 'sno',
      key: 'sno',
      render: (_, __, index) => index + 1,
    },
    {
      title: <span className="text-sm font-semibold text-paraColor">{t('payments.batchpayouts.recipientaddress')}</span>,
      dataIndex: 'recipientAddress',
      key: 'recipientAddress',
      render: (text, record, index) => (
        <FormInstance.Item
          name={[index, 'recipientAddress']}
          className="mb-0"
          rules={[requiredValidator(),
          {
            validator(_, value) {
              return validateAddressType(value, formValues?.network)
            },
          },
          ]}
        >
          <Input
           placeholder={t('payments.placeholders.address')}
            className="bg-tableInputBg text-subTextColor border border-inputDarkBorder outline-0 h-h42 px-3 focus:bg-tableInputBg hover:bg-tableInputBg focus:border-inputDarkBorder focus-within:!border-inputDarkBorder rounded-5 focus-within:!border focus-within:!border-solid"
            onBlur={()=>handleBlur(index)}
            onChange={createFieldChangeHandler(index, 'recipientAddress')}
          />
        </FormInstance.Item>
      ),
    },
    {
      title: <span className="text-sm font-semibold text-paraColor">{t('payments.batchpayouts.amount')}</span>,
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record, index) => (
        <FormInstance.Item
          name={[index, 'amount']}
          rules={[requiredValidator()]}
          className="mb-0"
        >
          <NumericFormat
            className={'bg-tableInputBg input-bordered text-subTextColor border border-inputDarkBorder outline-0 h-h42 px-3 focus:!bg-tableInputBg hover:!bg-tableInputBg focus:!border-inputDarkBorder focus-within:!border-inputDarkBorder rounded-5 focus-within:!border focus-within:!border-solid'}
            placeholder="0"
            name={'amount'}
            isAllowed={cryptoMaxAllowedDecimals}
            thousandSeparator={true}
            thousandsGroupStyle='lakh'
            disabled={false}
            allowNegative={false}
            maxLength={20}
            decimalScale={AppDefaults.cryptoDecimals}
            value={record.amount}
            onValueChange={createAmountFieldChangeHandler(index, 'amount')}
          />
        </FormInstance.Item>
      ),
    },
    {
      title: <span className="text-sm font-semibold text-paraColor">{t('payments.batchpayouts.email')}</span>,
      dataIndex: 'email',
      key: 'email',
      render: (text, record, index) => (
        <FormInstance.Item
          name={[index, 'email']}
          rules={[{ type: 'email', message: 'Enter valid email' }]}
          className="mb-0"
        >
          <Input
           placeholder={t('payments.placeholders.recipientemail')}
           className="bg-tableInputBg text-subTextColor border border-inputDarkBorder outline-0 h-h42 px-3 focus:!bg-tableInputBg hover:!bg-tableInputBg focus:!border-inputDarkBorder focus-within:!border-inputDarkBorder rounded-5 focus-within:!border focus-within:!border-solid"
            onChange={createFieldChangeHandler(index, 'email')}
          />
        </FormInstance.Item>
      ),
    },
    {
      title: <span className="text-sm font-semibold text-paraColor">{t('payments.batchpayouts.name')}</span>,
      dataIndex: 'recipientName',
      key: 'recipientName',
      render: (text, record, index) => (
        <FormInstance.Item
          name={[index, 'recipientName']}
          rules={[requiredValidator(),
          {
            validator: validateContentRule,
          },
          ]}
          className="mb-0"
        >
          <Input
           placeholder={t('payments.placeholders.recipientname')}
           className="bg-tableInputBg text-subTextColor border border-inputDarkBorder outline-0 h-h42 px-3 focus:!bg-tableInputBg hover:!bg-tableInputBg focus:!border-inputDarkBorder focus-within:!border-inputDarkBorder rounded-5 focus-within:!border focus-within:!border-solid"
            onChange={createFieldChangeHandler(index, 'recipientName')}
          />
        </FormInstance.Item>
      ),
    },
    {
      title: <span className="text-sm font-semibold text-paraColor">{t('payments.batchpayouts.entrynotes')}</span>,
      dataIndex: 'entryNote',
      key: 'entryNote',
      render: (text, record, index) => (
        <FormInstance.Item name={[index, 'entryNote']}
          className="mb-0"
          rules={[
            { required: false, message: "Is required", whitespace: true },
            {
              validator: validateContentRule,
            },
          ]}>
          <Input
           placeholder={t('payments.placeholders.notes')}
           className="bg-tableInputBg text-subTextColor border border-inputDarkBorder rounded-5 outline-0 h-h42 px-3 focus:!bg-tableInputBg hover:!bg-tableInputBg focus:!border-inputDarkBorder focus-within:!border-inputDarkBorder focus-within:!border focus-within:!border-solid"
            onChange={createFieldChangeHandler(index, 'entryNote')}
          />
        </FormInstance.Item>
      ),
    },
    {
      title: <span className="text-sm font-semibold text-paraColor">{t('payments.batchpayouts.delete')}</span>,
      dataIndex: 'delete',
      key: 'delete',
      render: (_, record, index) => (
        <Button className="delete-btn bg-transparent border-0 hover:!bg-transparent hover:!border-0" onClick={()=>removeRow(index, data)}><span className='icon delete'></span> </Button>
      ),
    },
  ]

  return (
    <FormInstance.List name='merchantPayees'>
      {() => (<>
        <div className="flex items-center justify-between my-3 px-0">
          <h2 className='text-2xl font-semibold text-titleColor my-2 pl-5'>{t('payments.batchpayouts.payeelist')}</h2>
          <div className="flex justify-end gap-2">
            <div className="">
              <Tooltip placement="top" title={"Create Payee List"}>
                <button className="c-pointer btn-style" onClick={(e) => addRow(e, data)}>
                  <span className="icon add-links"></span>
                </button>
              </Tooltip>
            </div>
            <div className="">
              <Tooltip placement="top" title={"Import Excel"}>
                <button className="c-pointer btn-style"
                  onClick={(e) => {
                    handleImportToExcel(e)
                  }}
                >
                  <span className="icon excel"></span>
                </button>
              </Tooltip>
            </div>
            <div className="">
              <Tooltip placement="top" title={"Download Sample File"}>
                <button className="c-pointer btn-style"
                  onClick={(e) => {
                    handleSampleExcel(e)
                  }}
                >
                  <span
                    className="icon download-sample"
                  ></span></button>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="amount-table px-0">
          <Table
            columns={columns}
            dataSource={data}
            bordered
            pagination={false}
            className='overflow-auto form-field-width'
          />
        </div>
      </>)}
    </FormInstance.List>
  )
}
export default PayeesGrid