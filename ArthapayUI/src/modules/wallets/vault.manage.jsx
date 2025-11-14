import { Form, Input, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { handleVaultSave } from './service';
import AppAlert from '../../core/shared/appAlert';
import { validateContentRule } from '../../utils/custom.validator';
import { replaceExtraSpaces } from '../../utils/validations';
import CustomButton from '../../core/button/button';
import CommonDrawer from '../../core/shared/drawer';
import { useTranslation } from 'react-i18next';
const walletType = process.env.REACT_APP_WALLET_TYPE;
const ManageVault = ({ mode, isOpen, onClose, onUpgrade, onSave, data }) => {
    const userProfile = useSelector((store) => store.userConfig.details);
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [step, setStep] = useState('form');
    const [loading, setLoading] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (mode === 'edit' && data) {
            form.setFieldsValue(data);
        }
        return () => {
            clearState();
        };
    }, [data, mode]);

    const clearState = () => {
        setStep('form');
        setErrorMessage('');
        setLoading('');
        form.resetFields();
    };

    const validateFields = useCallback(async () => {
        setLoading('save');
        try {
            await form.validateFields();
            form.submit();
        } catch (error) {
            setLoading('');
        }
    },[form, setLoading])

    const handleSave = useCallback(async () => {
        try {
            const response = await handleVaultSave(form.getFieldsValue(true), userProfile, mode);

            message.success({
                content: `Wallet ${mode === 'edit' ? 'updated' : 'saved'} successfully!`,
                className: 'custom-msg',
                duration: 1,
            });
            setLoading('');
            form.resetFields();
            onSave(response);
        } catch (error) {
            setLoading('');
            if (error.message?.includes('upgrade')) {
                setStep('upgrade');
            }
            setErrorMessage(error.message);
        }
    },[form, userProfile, mode, handleVaultSave, setLoading, setStep, setErrorMessage, onSave])

    const setField = useCallback((field) =>(e)=> {
        let value= e?.type === 'onChange' ? e?.target?.value : replaceExtraSpaces(e?.target?.value)
        const values = form.getFieldsValue(true);
        form.setFieldsValue({ ...values, [field]: value });
    },[])

    const handleUpgrade = useCallback((e) => {
        e.preventDefault();
        message.info({
            content: 'Upgrade feature coming soon!',
            className: '',
            duration: '2',
        });
        onUpgrade();
    },[])

const closeErrorMsgHandler=useCallback(()=>{
    setErrorMessage('')
},[])
    return (
        <CommonDrawer
            isOpen={isOpen}
            onClose={onClose}
            className="add-merchant invoice-modal"
            title={t('vault.vaultscrypto.createVault')}
        >


            {step !== 'upgrade' && errorMessage && (
                <div className="alert-flex" style={{ width: '100%' }}>
                    <AppAlert
                        description={errorMessage}
                        type="error"
                        showIcon
                        onClose={closeErrorMsgHandler}
                    />
                </div>
            )}

            {step === 'form' && (
                <Form form={form} onFinish={handleSave} className="basicinfo-form py-9">
                    <Form.Item
                        className="mb-0"
                        name="merchantName"
                        label={t('vault.vaultscrypto.vaultName')}
                        colon={false}
                        rules={[
                            { required: true, message: 'Is required' },
                            { validator: validateContentRule },
                        ]}
                    >
                        <Input
                            onChange={(e) => {
                                const values = form.getFieldsValue(true);
                                form.setFieldsValue({ ...values, merchantName: e.target.value });
                            }}
                            onBlur={(e) => {
                                const cleanValue = e.target.value.trim().replace(/\s+/g, ' ');
                                const values = form.getFieldsValue(true);
                                form.setFieldsValue({ ...values, merchantName: cleanValue });
                            }}
                            className="custom-input-field outline-0"
                            placeholder={t('vault.vaultscrypto.enterVaultName')}
                            type="input"
                            maxLength={50}
                        />

                    </Form.Item>
                    {walletType !== 'non_custodial' && (
                        <div className=" mt-2">
                            <p className="text-base font-normal text-paraColor ">
                                <>{t('vault.vaultscrypto.note')}:</> {t('vault.vaultscrypto.description')}
                            </p>
                        </div>
                    )}
                </Form>
            )}
            {step === 'upgrade' && <div><p>{errorMessage}</p></div>}
            <div className="drawer-footer text-right mt-9">
            {step === 'upgrade' && (
                    <CustomButton onClick={onClose} className={``} >
                        {t('vault.vaultscrypto.close')}
                    </CustomButton>
                )}
                {step === 'upgrade' ? (
                    <CustomButton type="primary" onClick={handleUpgrade} className={`md:ml-3.5`}>
                        {t('vault.vaultscrypto.upgrade')}
                    </CustomButton>         
                ) : (
                    <CustomButton onClick={onClose} className={``}>
                        {step === 'form' ? t('vault.vaultscrypto.cancel') : t('vault.vaultscrypto.close')}
                    </CustomButton>
                )}                
                {step !== 'upgrade' && (
                    <CustomButton
                        type="primary"
                        onClick={validateFields}
                        loading={loading === 'save'}
                        className={`md:ml-3.5`}
                    >
                        {t('vault.vaultscrypto.save')}
                    </CustomButton>
                )}                
            </div>
        </CommonDrawer>
    );
};

export default ManageVault;
