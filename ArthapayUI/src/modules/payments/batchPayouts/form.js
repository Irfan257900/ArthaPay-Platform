import React, { useCallback, useEffect, useReducer } from "react";
import { Form as AntForm, Select, Input } from "antd";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { useDispatch, useSelector, connect } from "react-redux";
import { formReducer, formState } from "./reducer";
import ContentLoader from '../../../core/skeleton/common.page.loader/content.loader'
import AppAlert from "../../../core/shared/appAlert";
import PayeesGrid from "./payeesGrid";
import { validateContentRule } from "../../../utils/custom.validator";
import PayeesUpload from "./payeesUpload";
import PropTypes from "prop-types";
import { VALIDATION_ERROR_MESSAGES } from "../../../utils/validations";
import { NumericFormat } from "react-number-format";
import { clearError, getBatchPayoutDetails, setBatchPaymentDetails } from "../reducers/batchPayoutsReducer";
import { fetchBatchPayoutDetail, getPaymentDetails, saveBatchPayment } from "../api/services";
import CustomButton from "../../../core/button/button";
import { getSampleFile } from "./services";
import { successToaster } from "../../../core/shared/toasters";
import { useTranslation } from "react-i18next";

const { TextArea } = Input;
const { Option } = Select;

const Form = (props) => {
    const { id, vault, mode } = useParams()
    const [form] = AntForm.useForm();
    const navigate = useNavigate();
    const reducerDispatch = useDispatch();
    const customerInfo = useSelector((info) => info.userConfig.details);
    const marchantsDetails = useSelector((info) => info.batchPayouts?.marchantsDetails);
    const batchPaymentDetails = useSelector((info) => info.batchPayouts?.batchPaymentDetails);
    const [localState, localDispatch] = useReducer(formReducer, formState);
    const { t } = useTranslation();
    const { getData, selectedPayout } = useOutletContext();

    useEffect(() => {
        if (mode !== 'create' && customerInfo?.id) {
            getPayments();
        } else {
            form.resetFields();
            reducerDispatch(setBatchPaymentDetails(null));
            localDispatch({ type: "setTotalPaymentAmount", payload: null });
            localDispatch({ type: "setFormDetails", payload: null })
        }
    }, [mode])// eslint-disable-line react-hooks/exhaustive-deps
    const navigateToDashboard = useCallback(() => {
        navigate(`/payments/batchpayouts/payout/${selectedPayout?.id}/${selectedPayout?.walletName}/view`)
    }, [selectedPayout])

    const getPayments = async () => {
        const urlParams = {
            localDispatch:localDispatch, 
            fetchBatchPayoutDetail:fetchBatchPayoutDetail, 
            marchantsDetails:marchantsDetails, 
            setBatchPaymentDetails:setBatchPaymentDetails, 
            setErrorMessages:setErrorMessages, 
            customerInfo:customerInfo, 
            id:id, 
            form:form, 
            reducerDispatch:reducerDispatch
        }
        await getPaymentDetails(urlParams)
    }

    const addRow = useCallback((e, gridData) => {
        e.preventDefault();
        const allValues = form.getFieldsValue();
        const requiredFields = ['currency', 'network', 'walletName', 'batchName'];
        const isFormComplete = requiredFields.every(field => !!allValues[field]);
        if (!isFormComplete) {
            window.scrollTo(0, 0);
            localDispatch({ type: 'setErrorMsg', payload: VALIDATION_ERROR_MESSAGES.REQUIRED_FIELDS });
            return;
        }
        const newRow = {
            recipientAddress: '',
            amount: '',
            email: '',
            recipientName: '',
            entryNote: '',
            recordStatus: 'Added'
        };
        localDispatch({
            type: "setFormDetails", payload: {
                ...localState.formDetails, payeesGridData: [...gridData, newRow]
            }
        });
    },[form,localState.formDetails]);


    const handleImportToExcel = useCallback((e) => {
        e.preventDefault();
        const allValues = form.getFieldsValue();
        const requiredFields = ['currency', 'network', 'walletName', 'batchName'];
        const isFormComplete = requiredFields.every(field => !!allValues[field]);
        if (!isFormComplete) {
            window.scrollTo(0, 0);
            localDispatch({ type: 'setErrorMsg', payload: VALIDATION_ERROR_MESSAGES.REQUIRED_FIELDS });
        } else {
            showUploadModal(true);
        }
    },[form]);


    const removeRow = useCallback((index, gridData) => {
        const newData = [
            ...gridData.slice(0, index), ...gridData.slice(index + 1)
        ];
        form.resetFields([[index, 'recipientAddress'], [index, 'amount'], [index, 'email'], [index, 'recipientName'], [index, 'entryNote']]);
        const updatedTotal = newData.reduce((total, item) => {
            return total + (parseFloat(item.amount) || 0);
        }, 0);
        const updatedTotalMultiply = updatedTotal * (parseFloat(localState.formDetails?.selectedCoinInfo?.oneCoinValue) || 0);
        localDispatch({ type: 'setTotalPaymentAmount', payload: updatedTotal });
        localDispatch({ type: 'setAmountAfterConversion', payload: updatedTotalMultiply });
        localDispatch({
            type: "setFormDetails", payload: {
                ...localState.formDetails, payeesGridData: newData
            }
        });
        form.setFieldsValue({ merchantPayees: newData });
    },[form,localState.formDetails]);



    const setField = (field, value) => {
        form.setFieldsValue({ [field]: value });
        setErrorMessages(null);
        if (field === 'currency') {
            form.resetFields(['network'])
            const selectedCoinInfo = localState.formDetails?.selectedVaultDetails?.merchantsDetails.find(item => item.code === value);
            const updatedPayeesGridData = localState.formDetails?.payeesGridData ? localState.formDetails?.payeesGridData.map(item => ({
                ...item,
                recipientAddress: ''
            })) : [];
            localDispatch({
                type: "setFormDetails", payload: {
                    ...localState.formDetails,
                    selectedCoinInfo: selectedCoinInfo,
                    selectedNetworkInfo: {},
                    payeesGridData: updatedPayeesGridData
                }
            });
            form.setFieldsValue({ merchantPayees: updatedPayeesGridData });
        }
        else if (field === 'walletName') {
            form.setFieldsValue({ currency: null, network: null });
            form.resetFields(['network', 'currency']);
            const selectedMerchant = marchantsDetails.data.find(item => item.merchantName === value);
            localDispatch({
                type: "setFormDetails", payload: {
                    ...localState.formDetails,
                    selectedVaultDetails: selectedMerchant,
                    selectedCoinInfo: {},
                    selectedNetworkInfo: {},
                }
            });
        }
    };

    const handleNetwork = (field, value) => {
        form.setFieldsValue({ [field]: value });
        let selectedNetworkInfo = localState.formDetails?.selectedCoinInfo?.networks.find(item => item.name === value);
        const updatedPayeesGridData = localState.formDetails?.payeesGridData ? localState.formDetails?.payeesGridData.map(item => ({
            ...item,
            recipientAddress: ''
        })) : [];
        localDispatch({
            type: "setFormDetails", payload: {
                ...localState.formDetails,
                selectedNetworkInfo: selectedNetworkInfo,
                payeesGridData: updatedPayeesGridData
            }
        });
        form.setFieldsValue({ merchantPayees: updatedPayeesGridData });
    }

    const handleSampleExcel = useCallback(async () => {
        try {
            setErrorMessages(null);
            const response = await getSampleFile('Merchant/samplepayeesexcel');
            if (response) {
                downloadFile(response);
            } else {
                window.scrollTo(0, 0);
                setErrorMessages(response);
            }
        } catch (fileError) {
            window.scrollTo(0, 0);
            setErrorMessages(fileError);
        }
    }, [])
    const downloadFile = async (fileInfo) => {
        window.open(fileInfo, '_self');
    };
    const setErrorMessages = (error) => {
        if (error === null) {
            localDispatch({ type: 'setErrorMsg', payload: error });
            reducerDispatch(clearError('marchantsDetails'))
        } else {
            localDispatch({ type: 'setErrorMsg', payload: error });
        }
    }
    const handleInputChange = useCallback((index, field, value, gridData) => {
        setErrorMessages(null);
        const updatedGridData = [...gridData];
        updatedGridData[index] = {
            ...updatedGridData[index],
            [field]: value
        };

        if (field === 'amount') {
            const record = updatedGridData[index];
            if (record) {
                let updatedTotal = updatedGridData.reduce((total, item) => {
                    return total + (parseFloat(item.amount) || 0);
                }, 0);
                updatedTotal = parseFloat(updatedTotal.toFixed(4));
                const updatedTotalMultiply = updatedTotal * (parseFloat(localState.formDetails?.selectedCoinInfo?.oneCoinValue?.toFixed(4)) || 0);
                localDispatch({ type: 'setTotalPaymentAmount', payload: updatedTotal });
                localDispatch({ type: 'setAmountAfterConversion', payload: updatedTotalMultiply });
            }
        }
        form.setFieldsValue({ merchantPayees: updatedGridData });
        localDispatch({
            type: "setFormDetails", payload: {
                ...localState.formDetails, payeesGridData: updatedGridData
            }
        });
    },[localState.formDetails,form]);


    const validateFormData = (merchantPayees) => {
        const paymentAmount = localState.totalPaymentAmount || batchPaymentDetails?.amount;
        const tokenBalance = localState.formDetails?.selectedNetworkInfo?.balance
        if (!merchantPayees.length) {
            return { message: VALIDATION_ERROR_MESSAGES.ADD_PAYEE_DATA };
        }
        else if (localState.totalPaymentAmount === 0) {
            return { message: VALIDATION_ERROR_MESSAGES.ENTER_AMOUNT };
        }
        else if (tokenBalance < paymentAmount) {
            return { message: VALIDATION_ERROR_MESSAGES.INSUFFICIENT_BALANCE };
        }
        return null;
    };
    const generateCombinedList = (merchantPayees) => {
        const updatedList = merchantPayees.map(item => {
            const originalItem = batchPaymentDetails?.merchantPayees?.find(original => original.id === item.id);

            if (!originalItem) {
                return {
                    ...item,
                    recordStatus: "Added"
                };
            }
            const isModified = Object.keys(item).some(key => item[key] !== originalItem[key]);

            if (isModified) {
                return {
                    ...item,
                    recordStatus: "Modified"
                };
            }
            return {
                ...item,
                recordStatus: null
            };
        });

        if (mode === 'create') {
            return updatedList;
        } else {
            const deletedRecords = batchPaymentDetails?.merchantPayees?.filter(originalItem =>
                !updatedList.some(updatedItem => updatedItem.id === originalItem.id)
            ).map(deletedItem => ({
                ...deletedItem,
                recordStatus: "Deleted"
            }));

            return [...updatedList, ...deletedRecords];
        }
    };

    const handleCreate = useCallback(async (e) => {
        e.preventDefault();
        setErrorMessages(null)
        const areValid = await form.validateFields();
        if (areValid) {
            try {
                localDispatch({ type: 'setIsLoading', payload: 'btnLoader' });
                const values = await form.getFieldsValue();
                const validationError = validateFormData(values.merchantPayees);

                if (validationError) {
                    localDispatch({ type: 'setErrorMsg', payload: validationError.message });
                    window.scrollTo(0, 0);
                    return;
                }
                const combinedList = generateCombinedList(values.merchantPayees);
                const trimmedValues = {
                    ...values,
                    totalPaymentAmount: localState.totalPaymentAmount || batchPaymentDetails?.amount || 0,
                    availableAmount: localState.formDetails?.selectedNetworkInfo?.balance || 0,
                    merchantPayees: combinedList,
                    merchantId: localState?.formDetails?.selectedVaultDetails?.id
                };
                const response = await saveBatchPayment('Merchant/batchpayment', trimmedValues, customerInfo?.id, id, mode, setErrorMessages);
                if (response) {
                    let _obj = {
                        ...trimmedValues, response: response
                    }
                    reducerDispatch(setBatchPaymentDetails(_obj));
                    successToaster({
                        content: mode === 'create' ?
                            VALIDATION_ERROR_MESSAGES.CREATE_SUCCESS :
                            VALIDATION_ERROR_MESSAGES.UPDATE_SUCCESS
                    })
                    navigate(`/payments/batchpayouts/payout/${response?.id}/${_obj?.batchName}/view`)
                    await getData();
                    reducerDispatch(getBatchPayoutDetails(
                        {
                            customerId: customerInfo?.id,
                            batchId: response?.id
                        }
                    ))
                    form.resetFields();
                } else {
                    window.scrollTo(0, 0);
                }
            }
            catch (error) {
                window.scrollTo(0, 0);
                setErrorMessages(error?.message);
            } finally {
                localDispatch({ type: 'setIsLoading', payload: '' });
            }
        } else {
            localDispatch({ type: 'setErrorMsg', payload: VALIDATION_ERROR_MESSAGES.VALIDATION_ERROR });
            localDispatch({ type: 'setIsLoading', payload: '' });
        }
    },[form,localState.totalPaymentAmount,localState.formDetails,localState?.formDetails?.selectedVaultDetails])

    const showUploadModal = useCallback((isShowModal) => {
        localDispatch({ type: 'setShowPayeeUploadModal', payload: isShowModal });
    }, [])
    const handlePayeesUpload = useCallback((payeesData) => {
        const updatedPayeesData = payeesData?.map(record => ({
            ...record,
            recordStatus: "Added",
        }));
        const newGridData = [...(localState.formDetails?.payeesGridData || []), ...updatedPayeesData];
        let updatedTotal = newGridData?.reduce((sum, record) => sum + (record?.amount || 0), 0);
        updatedTotal = parseFloat(updatedTotal.toFixed(8));
        const updatedTotalMultiply = updatedTotal * (parseFloat(localState.formDetails?.selectedCoinInfo?.oneCoinValue?.toFixed(4)) || 0);
        localDispatch({ type: 'setTotalPaymentAmount', payload: updatedTotal });
        localDispatch({ type: 'setAmountAfterConversion', payload: updatedTotalMultiply });
        form.setFieldsValue({ merchantPayees: newGridData });
        localDispatch({
            type: "setFormDetails", payload: {
                ...localState.formDetails, payeesGridData: newGridData
            }
        });
    }, [localState.formDetails,]);

    const handleChange = useCallback((e) => {
        setField(e.target.id, e.target.value)
    }, [form, setField]);

    const handleBlur = useCallback((e) => {
        setField(e.target.id, e.target.value?.trim())
    }, [form, setField]);

    const handleWalletChange= useCallback((e)=>{
        setField("walletName", e)
    },[form,setField]);

    const handleCurrencyChange = useCallback((e)=>{
       setField('currency', e)
    },[form,setField]);

    const handleNetworkChange = useCallback((e)=>{
       handleNetwork('network', e);
    },[form,handleNetwork]);

    return (<>
        <div className="dashboard-breadcumb">
        </div>
        {!(localState.isLoading === 'initialLoading' || marchantsDetails?.loading) && <>
            {(localState?.errorMsg || marchantsDetails?.error) && (<div className="px-4">
                <div className="alert-flex" style={{ width: "100%" }}>
                    <AppAlert
                        className="w-100 "
                        type="warning"
                        description={(localState?.errorMsg || marchantsDetails?.error)}
                        showIcon
                    />
                    <span className="icon sm alert-close" onClick={() => setErrorMessages(null)}></span>
                </div>
            </div>)}
            {mode === 'edit' && <div className="flex gap-4 items-center mb-6">
                <div className="bg-nameCircle w-10 h-10 rounded-full text-large font-semibold flex justify-center items-center !text-textWhite">{vault[0]}</div>
                <h1 className="ttext-2xl text-titleColor font-semibold">{vault}</h1>
            </div>}
            <div className="grid md:grid-cols-3 grid-cols-1 p-5 gap-4 rounded-5 border border-StrokeColor bg-kpcardhover" >
                <div className="">
                    <label className="text-xs text-labelGrey uppercase font-medium">{t('payments.batchpayouts.totalpaymentamount')}</label>
                    <h2 className='text-md font-medium text-lightWhite'>
                        <NumericFormat value={parseFloat(localState.totalPaymentAmount || batchPaymentDetails?.amount || 0).toFixed(4)} displayType="text" thousandSeparator={true} />{' '}
                        {form.getFieldValue('currency') || 'ETH'}
                        ( <span className="text-2xl font-semibold text-titleColor">~</span>
                        $ {localState.amountAfterConversion ?
                            <NumericFormat value={parseFloat(localState.amountAfterConversion).toFixed(2)} displayType="text" thousandSeparator={true} />
                            :
                            <NumericFormat value={batchPaymentDetails?.amount * (parseFloat(localState?.formDetails?.selectedCoinInfo?.oneCoinValue) || 0).toFixed(2) || '0.00'} displayType="text" thousandSeparator={true} />})
                    </h2>
                </div>
                <div className="">
                    <label className="text-xs text-labelGrey uppercase font-medium">{t('payments.batchpayouts.availablebalance')}</label>
                    <h2 className='text-md font-medium text-lightWhite'>
                        <NumericFormat value={parseFloat(localState.formDetails?.selectedVaultDetails?.marchantTotalBanlance || 0).toFixed(2)} displayType="text" thousandSeparator={true} />{' '}
                        USD </h2>
                </div>
                <div className="">
                    <label className="text-xs text-labelGrey uppercase font-medium">{t('payments.batchpayouts.tokenbalance')}</label>
                    <h2 className='text-md font-medium text-lightWhite'>
                        <NumericFormat value={parseFloat(localState.formDetails?.selectedNetworkInfo?.balance || 0).toFixed(4)} displayType="text" thousandSeparator={true} />{' '}
                        {form.getFieldValue('currency') || 'ETH'}</h2>
                </div>
            </div>
            <div className="panel-card buy-card card-paddingrm">
                <AntForm
                    form={form}
                    initialValues={{ merchantPayees: localState?.formDetails?.payeesGridData || [] }}
                >
                    <div className="grid md:grid-cols-2 gap-6 basicinfo-form panel-form-items-bg py-7 px-0">
                        <AntForm.Item
                            className="mb-0"
                            name="batchName"
                            label={t('payments.batchpayouts.batchname')}
                            colon={false}
                            rules={[{ required: true, message: "Is required" }, { validator: validateContentRule },]}
                        >
                            <Input
                                className="custom-input-field outline-0"
                                placeholder={t('payments.placeholders.enterbatchname')}
                                type="input"
                                maxLength={100}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                        </AntForm.Item>
                        <AntForm.Item
                            className="custom-select-float mb-0"
                            name="walletName"
                            placeholder={t('payments.placeholders.vaultname')}
                            label={t('payments.batchpayouts.vaultname')}
                            colon={false}
                            rules={[{ required: true, message: "Is required" }]}
                        >
                            <Select
                                onChange={handleWalletChange}
                                placeholder={t('payments.placeholders.vaultname')}
                                className=""
                                maxLength={30}
                                disabled={mode === 'edit'}
                            >
                                {marchantsDetails?.data?.map((item) => (
                                    <Option key={item?.id} value={item.merchantName}>
                                        {item.merchantName}
                                    </Option>
                                ))}

                            </Select>
                        </AntForm.Item>
                        <AntForm.Item
                            className="custom-select-float mb-0"
                            name="currency"
                            placeholder={t('payments.placeholders.token')}
                            label={t('payments.batchpayouts.token')}
                            colon={false}
                            rules={[{ required: true, message: "Is required" }]}
                        >
                            <Select
                                placeholder={t('payments.placeholders.token')}
                                className=""
                                maxLength={30}
                                onChange={handleCurrencyChange}
                                disabled={mode === 'edit'}
                            >
                                {localState.formDetails?.selectedVaultDetails?.merchantsDetails?.map((item) => (
                                    <Option
                                        key={item?.id} value={item?.code}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img
                                                className="rounded-full w-6 h-6"
                                                src={item?.logo}
                                                alt={item?.code}
                                            />
                                            <span>{item?.code}</span>
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </AntForm.Item>
                        <AntForm.Item
                            className="custom-select-float mb-0"
                            name="network"
                            placeholder={t('payments.placeholders.network')}
                            label={t('payments.batchpayouts.network')}
                            colon={false}
                            rules={[{ required: true, message: "Is required" }]}
                        >
                            <Select
                                placeholder={t('payments.placeholders.network')}
                                className=""
                                maxLength={30}
                                onChange={handleNetworkChange}
                                disabled={mode === 'edit'}
                            >
                                {localState.formDetails?.selectedCoinInfo?.networks?.map((item) => (
                                    <Option key={item.id} value={item.name}>
                                        <span>{item.name}</span>
                                    </Option>
                                ))}
                            </Select>
                        </AntForm.Item>
                        <div className="md:col-span-2">
                            <AntForm.Item
                                className="mb-0 cust-textarea"
                                name="transactionNote"
                                placeholder="Note"
                                label={t('payments.batchpayouts.note')}
                                colon={false}
                                rules={[
                                    { required: true, message: "Is required", whitespace: true },
                                    {
                                        validator: validateContentRule,
                                    },
                                ]}
                            >
                                <TextArea
                                    showCount
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="bg-transparent"
                                    placeholder={t('payments.placeholders.typeyournote')}
                                    rows={4}
                                />
                            </AntForm.Item>
                        </div>
                    </div>
                    {localState.showPayeeUploadModal && <PayeesUpload
                        showModal={localState.showPayeeUploadModal}
                        setShowModal={showUploadModal}
                        payeeUploadData={handlePayeesUpload}
                        customerInfo={customerInfo}
                    />}
                    <PayeesGrid
                        data={localState.formDetails?.payeesGridData}
                        from={form}
                        FormInstance={AntForm}
                        handleImportToExcel={handleImportToExcel}
                        handleInputChange={handleInputChange}
                        addRow={addRow}
                        removeRow={removeRow}
                        formValues={form.getFieldsValue(true)}
                        downloadSampleExcel={handleSampleExcel}
                    />
                </AntForm>
            </div>
            <div className="flex items-center justify-end gap-2">
                <CustomButton
                    className="outlined-btn payee-popup pop-btn"
                    style={{ width: 'auto' }}
                    onClick={navigateToDashboard}
                >
                    {t('common.cancel')}
                </CustomButton>
                <CustomButton
                    type="primary"
                    className="estimate-text download-btn m-0"
                    onClick={handleCreate}
                    loading={localState.isLoading === 'btnLoader'}
                >
                    {mode === 'create' ? `${t('common.save')}` : `${t('common.update')}`}
                </CustomButton>
            </div>

        </>}
        {(localState.isLoading === 'initialLoading' || marchantsDetails?.loading) && <ContentLoader />}
    </>
    )
}

const connectStateToProps = ({ merchantData, userConfig }) => {
    return { userConfig: userConfig.details, merchantData: merchantData };
};

const connectDispatchToProps = (dispatch) => {
    return { dispatch };
};

Form.propTypes = {
    merchantData: PropTypes.any,
    userConfig: PropTypes.object.isRequired,
};

export default connect(connectStateToProps, connectDispatchToProps)(Form);
