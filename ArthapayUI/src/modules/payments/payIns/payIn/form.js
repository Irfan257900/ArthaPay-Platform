import { Button, Form as AntForm, Select, Segmented, Switch } from 'antd'
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router';
import { formReducer, initialState } from './reducer';
import { useDispatch, useSelector } from 'react-redux';
import { formButtonTexts } from './service';
import moment from 'moment';
import PreviewModal from '../../../../core/shared/previewModal';
import StaticPreview from './static.preview';
import StaticForm from './static.form';
import InvoiceInfoForm from './invoice.info.form';
import InvoiceAddressForm from './invoice.address.form';
import InvoiceItemsForm from './invoice.items.form';
import CustomButton from '../../../../core/button/button';
import { createOrUpdatePaymentLink, getNetworkLuPayins, getPaymentLinkDetails, getVaultsPayins, payinsFormLu, payinslookups } from '../../httpServices';
import { toasterMessages, validateForTexts } from '../payin.constants';
import AppAlert from '../../../../core/shared/appAlert';
import ContentLoader from '../../../../core/skeleton/common.page.loader/content.loader';
import { successToaster } from '../../../../core/shared/toasters';
import InvoicePreView from './invoice.preview';
import { useTranslation } from 'react-i18next';
import { decryptAES } from '../../../../core/shared/encrypt.decrypt';
import { setSelectedPayinWallet } from '../../reducers/payin.reducer';
import TabSwitcher from './tabs.switcher';

const Form = () => {
    const [form] = AntForm.useForm()
    const formRef = useRef(null)
    const navigate = useNavigate();
    const userProfile = useSelector((info) => info.userConfig.details);
    const [{
        loading,
        error,
        lookups,
        selectedType,
        modalOpen,
        formLu,
        selectedVault
    }, setState] = useReducer(formReducer, initialState)
    const [activeTab, setActiveTab] = useState('PaymentLink' || selectedType);
    const { getData, selectedPayin, payinGridData, setInvoiceHeading } = useOutletContext();
    const { mode, id, type, invno } = useParams();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const selectedPayinWallet = useSelector(state => state.payinstore.selectedPayinWallet);


    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        clearErrorMessage();
        form.resetFields();
        // setState({ type: "setLookups", payload: {} });
        setState({ type: 'setSelectedType', payload: newTab });
    };

    useEffect(() => {
        if (mode !== 'update') {
            payinsFormLu(setState);
        }
    }, [mode, payinGridData])

    useEffect(() => {
        selectedType && getFormDetails(selectedType);
        setInvoiceHeading(selectedType)
    }, [selectedType]);

    useEffect(() => {
        type && setState({ type: 'setSelectedType', payload: type })
        setInvoiceHeading?.('Payment Link')
        !type && handleTypeChange('PaymentLink')
    }, [type])
    useEffect(() => {
        error && formRef.current?.scrollIntoView({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }, [error]);

    const getFormDetails = async (detailType) => {
        setState({ type: 'setLoading', payload: 'gettingFormDetails' })
        switch (detailType) {
            case 'Invoice': await getInvoiceFormDetails()
                break;
            case 'PaymentLink': await getStaticFormDetails()
                break
            default: break;
        }
    }
    const getInvoiceFormDetails = async () => {
        try {
            const [vaults, allLookups, formData] = await Promise.allSettled(
                mode === 'update' ?
                    [getVaultsPayins(),
                    payinslookups(),
                    getPaymentLinkDetails(id, 'Invoice')] :
                    [getVaultsPayins(),
                    payinslookups(),
                    ])
            const lookupsToUpdate = { ...lookups, vaults: vaults?.value, countries: allLookups?.value?.countryWithStates, invoiceCurrencies: allLookups?.value?.cryptoCurrency }
            setState({ type: 'setLookups', payload: lookupsToUpdate });
            if (mode === 'update' && formData?.value) {
                const issuedDate = formData?.value?.issuedDate ? moment(formData?.value?.issuedDate) : null
                const dueDate = formData?.value?.dueDate ? moment(formData?.value?.dueDate) : null
                const emails = decryptAES(formData?.value?.emails)
                const taxIdentificationNumber = decryptAES(formData?.value?.taxIdentificationNumber)
                const zipCode = decryptAES(formData?.value?.zipCode)
                form.setFieldsValue({ ...formData?.value, dueDate, issuedDate, emails, taxIdentificationNumber, zipCode })
                getStates(formData?.value?.saveInvoice?.country)
            }
        } catch (error) {
            setState({ type: 'setError', payload: error?.message })
        } finally {
            setState({ type: 'setLoading', payload: '' })
        }
    }
    const getStaticFormDetails = async () => {
        try {
            const [vaults, formData] = await Promise.all(
                mode === 'update'
                    ? [getVaultsPayins(), getPaymentLinkDetails(id, 'Static')]
                    : [getVaultsPayins()]
            );

            const lookupsToUpdate = { ...lookups, vaults };
            setState({ type: 'setLookups', payload: lookupsToUpdate });

            if (mode !== 'generate' && formData) {
                const dueDate = formData?.dueDate
                    ? moment(formData?.dueDate)
                    : null;

                let networkId = null;
                let selectedWallet = null;
                let selectedMerchant = null;
                let selectedNetwork = null;

                // ✅ Compare wallet.id with formData.merchantId
                for (const wallet of vaults) {
                    if (wallet.id === formData.merchantId) {
                        for (const merchant of wallet.merchantsDetails) {
                            if (merchant.code === formData.currency) {
                                for (const network of merchant.networks) {
                                    if (network.customerWalletId === formData.customerWalletId) {
                                        networkId = network.id;
                                        selectedWallet = wallet;
                                        selectedMerchant = merchant;
                                        selectedNetwork = network;
                                        break;
                                    }
                                }
                            }
                            if (networkId) break;
                        }
                    }
                    if (networkId) break;
                }

                form.setFieldsValue({
                    ...formData,
                    dueDate,
                    walletsId: networkId,
                });

                if (networkId) {
                    dispatch(setSelectedPayinWallet({
                        ...selectedNetwork,
                        wallet: selectedWallet,
                        merchant: selectedMerchant,
                    }));
                }
            }
        } catch (errorMessage) {
            setState({ type: 'setError', payload: errorMessage?.message });
        } finally {
            setState({ type: 'setLoading', payload: '' });
        }
    };




    const getNetworks = useCallback(async (coin, lookupsToUpdate = lookups) => {
        setState({ type: 'setLoading', payload: 'networks' })
        try {
            const response = await getNetworkLuPayins(coin, userProfile?.id)
            setState({ type: 'setLookups', payload: { ...lookupsToUpdate, networks: response } });
        } catch (errorMessage) {
            setState({ type: 'setError', payload: errorMessage.message })
        } finally {
            setState({ type: 'setLoading', payload: '' })
        }
    }, [userProfile, lookups])

    const getStates = useCallback(async (value) => {
        setState({ type: 'setLoading', payload: 'gettingStates' })
        try {
            const states = lookups?.countries?.find((item) => item?.name === value)?.details || []
            setState({ type: 'setLookups', payload: { ...lookups, states } })
        } catch (errorMessage) {
            setState({ type: "setError", payload: errorMessage?.message })
        } finally {
            setState({ type: 'setLoading', payload: '' })
        }

    }, [lookups])

    const handleTypeChange = useCallback((value) => {
        if (mode === 'update' || loading === 'gettingFormDetails') {
            return;
        }
        error && setState({ type: 'setError', payload: '' })
        form.resetFields()
        setState({ type: "setLookups", payload: {} })
        setState({ type: 'setSelectedType', payload: value })
    }, [mode, loading, error, form])

    const handleFormSubmission = useCallback(async () => {
        setState({ type: 'setLoading', payload: 'save' })
        error && setState({ type: 'setError', payload: '' })
        try {
            const values = form.getFieldsValue(true)
            const { data, error: saveError } = await createOrUpdatePaymentLink(values, userProfile, mode, selectedType, selectedVault, selectedPayinWallet)
            if (data) {
                const message = mode === 'generate' ? toasterMessages.paymentCreation : toasterMessages.paymentUpdate;
                successToaster({ content: message })
                navigate(`/payments/payins/payin/${data.id}/${data.merchantName}/view/${data?.invoiceType || selectedType}/crypto`)
                await getData([], 1, null, "isCancel");
                // dispatch(fetchKpisData({showLoading:false}))
                return
            }
            saveError && setState({ type: 'setError', payload: saveError })
        } catch (errorMsg) {
            setState({ type: 'setError', payload: errorMsg?.message })
        } finally {
            setState({ type: 'setLoading', payload: '' })
        }

    }, [form, userProfile, mode, selectedType, error, selectedVault, selectedPayinWallet])

    const validateFields = async (validateFor) => {
        try {
            await form.validateFields()
            error && setState({ type: 'setError', payload: '' })
            return true
        } catch (errorMessage) {
            setState({ type: 'setError', payload: `Please ensure that all required fields are filled out correctly before ${validateForTexts[validateFor]}` })
            return false
        }
    }
    const submitForm = useCallback(async (e) => {
        e.preventDefault()
        const areValid = await validateFields('submit')
        if (areValid) {
            form.submit();
            await handleFormSubmission()
        }
    }, [validateFields, form])
    const setModalToOpen = useCallback(async (e) => {
        e.preventDefault()
        const areValid = mode === 'generate' ? await validateFields('preview') : true
        if (areValid) {
            setState({ type: 'setModalOpen', payload: selectedType })
        }
    }, [mode, selectedType])
    const onCloseModal = useCallback((e) => {
        e.preventDefault()
        setState({ type: 'setModalOpen', payload: '' })
    }, [])
    const clearErrorMessage = () => {
        setState({ type: 'setError', payload: '' })
    }

    const navigatetoPayins = useCallback(() => {
        if (!selectedPayin) {
            getData([], 1, null, "isCancel");
        }
        navigate(`/payments/payins/payin/${selectedPayin?.id}/${selectedPayin?.merchantName}/view/${selectedPayin?.type}/crypto`)
    }, [selectedPayin]);

    return (
        <div ref={formRef} className='mt-5'>
            {loading !== 'gettingTypes' && <>
                {
                    error && (
                        <div className="alert-flex" style={{ width: "100%" }}>
                            <AppAlert
                                className="w-100 "
                                type="warning"
                                description={error}
                                showIcon
                            />
                            <button className="icon sm alert-close" onClick={() => clearErrorMessage()}></button>
                        </div>
                    )
                }
                <div className="">
                    <AntForm
                        //  onFinish={handleFormSubmission}
                        form={form} className='pay-inform'>
                        <div className='form-field-bg '>
                            {loading !== 'gettingFormDetails' &&
                                <div className='grid md:grid-cols-2 gap-4'>
                                    <div className='relative'>
                                        <TabSwitcher
                                            activeTab={activeTab}
                                            setActiveTab={handleTabChange}
                                            disable={mode !== 'generate'}
                                             selectedType={mode !== 'generate' ? selectedType : null}
                                        />
                                    </div>
                                </div>
                            }
                            {(loading === 'gettingFormDetails' || !selectedType) && <div className='text-center mt-4'><ContentLoader /></div>}
                            {loading !== 'gettingFormDetails' && selectedType === 'Invoice' && <>
                                <InvoiceInfoForm form={form} FormInstance={AntForm} setState={setState} />
                                <InvoiceAddressForm form={form} FormInstance={AntForm} lookups={lookups} loading={loading} getStates={getStates} setState={setState} />
                                <div className='mt-4'> <InvoiceItemsForm form={form} FormInstance={AntForm} lookups={lookups} setState={setState} /></div>
                            </>
                            }
                            {loading !== 'gettingFormDetails' && selectedType === 'PaymentLink' && <StaticForm getNetworks={getNetworks} form={form} FormInstance={AntForm} lookups={lookups} loading={loading} setState={setState} />}
                        </div>
                        <div className='md:flex gap-2.5 justify-end !mt-6'>
                            <CustomButton className='' onClick={navigatetoPayins}>
                                {t('common.cancel')}
                            </CustomButton>
                            <CustomButton onClick={setModalToOpen} className=''>
                                {t('common.preview')}
                            </CustomButton>
                            <CustomButton
                                onClick={submitForm}
                                className='' type='primary' loading={loading === 'save'} disabled={loading === 'save'}>
                                {formButtonTexts[selectedType]?.[mode]}
                            </CustomButton>
                        </div>
                    </AntForm>
                </div>
                <PreviewModal isModalOpen={modalOpen !== ''} onCancel={onCloseModal} title={''} width={modalOpen === 'PaymentLink' ? 850 : 1320}
                    closeIcon={<button onClick={onCloseModal}><span className="icon lg close cursor-pointer" title="close"></span></button>}
                    footer={<div className='text-right'>
                        <CustomButton key="close" onClick={onCloseModal}>
                            Close
                        </CustomButton>
                        {/* <Button className='close-btn' onClick={onCloseModal} >Close</Button> */}
                    </div>}
                >
                    {modalOpen === 'Invoice' && <InvoicePreView data={form.getFieldsValue(true)} isPreview={true} />}
                    {modalOpen === 'PaymentLink' && <StaticPreview data={form.getFieldsValue(true)} selectedPayinWallet={selectedPayinWallet} />}
                </PreviewModal>
            </>}
        </div>
    )
}

export default Form