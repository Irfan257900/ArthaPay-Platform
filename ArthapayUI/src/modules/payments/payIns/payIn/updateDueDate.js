import { Button, Form, Modal } from 'antd'
import React, { useCallback, useEffect, useMemo } from 'react'
import useApi from '../../../../utils/useApi'
import AppAlert from '../../../../core/shared/appAlert'
import { dateValidOn, validations } from '../../../../utils/validations'
import moment from 'moment'
import { convertUTCToLocalTime } from '../../../../utils/service'
import { createOrUpdatePaymentLink } from '../service'
import { useSelector } from 'react-redux'
import AppDatePicker from '../../../../core/shared/appDatePicker'
const UpdateDueDate = ({isModalOpen,onSuccess,onCancel,linkDetails}) => {
    const [form] = Form.useForm()
    const userProfile=useSelector((info) => info.userConfig.details);
    const { awaitingResponse, data, error, handleApi,clearError } = useApi(false)
    useEffect(()=>{
        data&& onSuccess(data)
    },[data])
    useEffect(()=>{
        linkDetails?.dueDate && form.setFieldsValue({dueDate:moment(convertUTCToLocalTime(linkDetails?.dueDate))})
    },[linkDetails])
    const handleSave=useCallback(()=>{
        const values=form.getFieldsValue(true)
        handleApi(createOrUpdatePaymentLink,null,null,true,[{...linkDetails,dueDate:values.dueDate}, userProfile, 'update', linkDetails.paymentType, null],'dataWithError')
    },[form,linkDetails,userProfile]); 
    const handleCancel=useCallback((e)=>{
        e.preventDefault()
        onCancel?.()
    },[]);
    const fieldsToValidate=useMemo(()=>{
        return linkDetails?.paymentType==='Static' ? 
        [{validateAgainstCurrent:true, fieldName:'current date', value: null}]:
        [{ fieldName:'issued date', value: linkDetails?.issuedDate },{validateAgainstCurrent:true, fieldName:'current date', value: null}]
    },[linkDetails])
    const handleFormSubmit=useCallback(()=>{
        form.submit()
    },[]); 
    const clearErrorMsg = useCallback(()=>{
        clearError();
    },[]);
    const handleDueDateChange=useCallback((e)=>{
        form.setFieldsValue({dueDate: e})
    },[form]);
    return (
        <Modal
            wrapClassName='add-merchant invoice-modal'
            title={
                <h1 className="text-2xl text-titleColor font-semibold">Update Due Date</h1>}
            visible={isModalOpen}
            closeIcon={true}
            onCancel={onCancel}
            destroyOnClose={true}
            footer={[
                <>
                    <Button key={'cancelDueDateUpdateButton'} style={{ width: 100 }}
                        className="outlined-btn payee-popup pop-btn mr-8"
                        onClick={handleCancel} disabled={awaitingResponse}>Cancel</Button>
                    <Button key={'dueDateUpdateButton'} className="btn-style payee-popup pop-btn"
                        style={{ width: 100, height: 50 }} onClick={handleFormSubmit}
                        loading={awaitingResponse}
                        disabled={awaitingResponse}
                    >Update</Button>
                </>
            ]} >
            <Form form={form} onFinish={handleSave}>
                {error && <div className="alert-flex" style={{ width: "100%" }}><AppAlert description={error} type="error" showIcon onClose={clearErrorMsg } /><span className="icon sm alert-close" onClick={clearErrorMsg}></span></div>}
                <Form.Item
                    className="payees-input mt-4 mb-4"
                    name="dueDate"
                    label="Due Date"
                    colon={false}
                    rules={[
                        validations.requiredValidator(),
                        validations.dateValidator('Due Date',fieldsToValidate , { ...dateValidOn, greaterThan: true })
                    ]}
                >
                    <AppDatePicker showTime={true} format='DD/MM/YYYY HH:mm:ss A' placeholder='DD/MM/YYYY HH:mm:ss A'  onChange={ handleDueDateChange} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default UpdateDueDate