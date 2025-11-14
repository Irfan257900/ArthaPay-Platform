import { Form, Select } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useApi from '../../../utils/useApi'
import AppAlert from '../../../core/shared/appAlert'
import { getStatusChangeLookup, updatePayinStatus } from './service'
import { useSelector } from 'react-redux'
import CommonDrawer from '../../../core/shared/drawer'
import CustomButton from '../../../core/button/button'
import SideDrawerLoader from '../../../core/skeleton/drawer.loaders/sidedrawer.loader'
import { useTranslation } from 'react-i18next'
import { successToaster } from '../../../core/shared/toasters'
import { toasterMessages } from './payin.constants'
const optionsKey = 'options'
const saveKey = 'save'
const StateChange = ({ isModalOpen, onCancel, onSuccess, selectedPayin }) => {
    const [form] = Form.useForm()
    const {t} = useTranslation();
    const { awaitingResponse, data, error, clearError, handleApi } = useApi(true)
    const userProfile = useSelector((info) => info.userConfig.details)
    const errorMessage = useMemo(() => {
        return error[optionsKey] || error[saveKey]
    }, [error])

    const [initialStatus, setInitialStatus] = useState(null)
    const [currentStatus, setCurrentStatus] = useState(null)

    useEffect(() => {
        if (selectedPayin) {
            setInitialStatus(selectedPayin?.status)
            setCurrentStatus(selectedPayin?.status)
        }
        form.setFieldsValue({ status: selectedPayin?.status })

        return () => form.resetFields()
    }, [selectedPayin])

    useEffect(() => {
        handleApi(getStatusChangeLookup, null, optionsKey, true, [selectedPayin?.status], 'onlyData')
    }, [])

    useEffect(() => {
        data[saveKey] && onSuccess(data[saveKey])
    }, [data[saveKey]])

    const handleSave = useCallback(() => {
        const values = form.getFieldsValue(true)
        if (values.status === selectedPayin?.status) {
            return
        }
        handleApi(updatePayinStatus, null, saveKey, true, [selectedPayin, values.status, userProfile], 'dataWithError');
        successToaster({ content: toasterMessages.statusToaster})
    },[selectedPayin,userProfile])

    const handleCancel = useCallback((e) => {
        e.preventDefault();
        onCancel?.();
    },[])
    const isSaveDisabled = () => {
        return currentStatus === initialStatus || awaitingResponse[saveKey] || awaitingResponse[optionsKey]
    }
    const handleDropdownChange = useCallback((value) => {
        setCurrentStatus(value)
    },[]);

    const handleSubmit=useCallback(()=>{
        form.submit()
    },[form])

    return (
        <CommonDrawer
            isOpen={isModalOpen}
            title={<h1 className="text-2xl text-titleColor font-semibold">{t('common.changestatus')}</h1>}
            onClose={onCancel}
            maskClosable={false}
            className="add-merchant invoice-modal status-modal"
        >
            <Form form={form} onFinish={handleSave} className='basicinfo-form'>
                {errorMessage && <div className="alert-flex" style={{ width: "100%" }}><AppAlert description={errorMessage} type="error" showIcon onClose={clearError} /><span className="icon sm alert-close" onClick={() => clearError()}></span></div>}
                {awaitingResponse[optionsKey] && <SideDrawerLoader />}
                {!awaitingResponse[optionsKey] && <Form.Item
                    className="payees-input mt-4 mb-4"
                    name="status"
                    label={t('common.status')}
                    colon={false}
                    rules={[{ required: true, message: "Is required", whitespace: true }]}
                >
                    <Select
                        className="text-left"
                        placeholder={t('common.selectstatus')}
                        type="input"
                        maxLength={50}
                        value={currentStatus}
                        onChange={handleDropdownChange}
                    >
                        {data[optionsKey]?.map(option => (<Select.Option key={option.code} value={option.code}>{option.name}</Select.Option>))}
                    </Select>
                </Form.Item>}
            </Form>
            <div className="mt-9 text-right">
                <CustomButton
                    onClick={handleCancel}
                // disabled={awaitingResponse[saveKey]}
                >
                  {t('common.cancel')}
                </CustomButton>
                <CustomButton
                    type='primary'
                    loading={awaitingResponse[optionsKey] || awaitingResponse[saveKey]}
                    disabled={isSaveDisabled()}
                    onClick={handleSubmit} 
                    className={"md:ml-3.5"}
                >
                  {t('common.save')}
                  </CustomButton>
            </div>
        </CommonDrawer>
    )
}

export default StateChange


