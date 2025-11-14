import { Form, Input} from 'antd'
import React, { useCallback, useContext } from 'react'
import SignReviewContext from './signReviewContext'
import { validations } from '../../../../core/shared/validations'
import CustomButton from '../../../../core/button/button'
const { TextArea } = Input
const SignatureForm = () => {
    const { asset, message, addressFormat, setError, onError, onSuccess, isSigning, setIsSigning, setSigningThrough } = useContext(SignReviewContext)
    const [form] = Form.useForm()
    const handleFormValueChange = (field, value) => {
        form.setFieldValue(field, value)
    }
    const handleSignVerification = async (values) => {
        let signVerifier;
        switch (asset) {
            case 'eth': signVerifier = (await import('../utils/verifyEthSign')).default
                break;
            case 'btc': signVerifier = (await import('../utils/verifyBtcSign')).default
                break;
            case 'trx': signVerifier = (await import('../utils/verifyTrxSign')).default
                break
            default: return false
        }
        return signVerifier?.(message, values.sign, values.address, addressFormat)
    }
    const onSubmit = useCallback(async (values) => {
        setError('')
        setIsSigning(true)
        try {
            const isValid = await handleSignVerification(values)
            if (!isValid) {
                setIsSigning(false)
                onError('Invalid Signature')
                return;
            }
            onSuccess?.(values)
        } catch (error) {
            setIsSigning(false)
            onError?.(error.message)
        }
    },[]);
    const handleChange = useCallback((e) => {
        handleFormValueChange(e.target.id, e.target.value)
    }, [handleFormValueChange]);
    const handleSignatureChange = useCallback((e) => {
        handleFormValueChange('sign', e.target.value)
    }, [handleFormValueChange]);
    const handleSubmit = useCallback(()=>{
        form.submit()
    },[form]);
    const handleSubmitCancel = useCallback(()=>{
        setIsSigning(false)
        setSigningThrough('')
    },[]);
    return (
        <Form form={form} onFinish={onSubmit}>
            <div className='grid md:grid-cols-1 gap-6 basicinfo-form py-7 px-4'>
                <div >
                    <Form.Item className='mb-0' name='address' rules={[validations.requiredValidator(), validations.addressValidator('Address', asset, addressFormat)]} label='Wallet Address'>
                        <Input type='text' onChange={handleChange } placeholder=' Enter Wallet Address' className='custom-input-field outline-0' />
                        </Form.Item>
                </div>
                <div>
                    <Form.Item className='mb-0' name='sign' rules={[validations.requiredValidator(), validations.signValidator('Signature')]} label='Signature'>
                    <TextArea rows={4} maxLength={50} placeholder="Enter base64 encoded signature" onChange={handleSignatureChange } className='bg-transparent border border-inputDarkBorder text-lightWhite p-2 outline-0 rounded-5 wallet-note' />

                    </Form.Item>
                </div>
            </div>
            <div className="text-right mt-9">
                <CustomButton disabled={isSigning} onClick={handleSubmitCancel}>Cancel</CustomButton>
                <CustomButton className="md:ml-3.5" type='primary' disabled={isSigning} loading={isSigning} onClick={handleSubmit }>Add Proof</CustomButton>
            </div>
        </Form>
    )
}

export default SignatureForm