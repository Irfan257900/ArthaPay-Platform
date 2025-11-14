import { Alert, Form } from "antd"
import { useCallback, useReducer, useRef } from "react";
import { connect } from "react-redux";
import { setpin } from "../httpServices";
import CustomButton from "../../../core/button/button";
import { useOutletContext } from "react-router";
import { successToaster } from "../../../core/shared/toasters";
import { setPinreducer, setPinState } from "./card.reducer";
import FileUpload from "../../../core/shared/file.upload";
import { useTranslation } from "react-i18next";
const SetPin = ({ handleSetPinModal, cardDetails, user, selectedCurdID, handleTopUpChange, handleShowTransactions }) => {
    const formContainerRef = useRef(null);
    const [form] = Form.useForm();
    const getData = useOutletContext();
    const [localState, localDispatch] = useReducer(setPinreducer, setPinState);
    const { t } = useTranslation();
    const setGetpin = (response)=>{
        if (response) {
              successToaster({content : t('cards.Messages.REQUEST_SUBMITTED'),className : "custom-msg",duration : 3})
            handleSetPinModal("save")
            form.resetFields();
            handleTopUpChange(true)
            handleShowTransactions(true)
            localDispatch({ type: 'setFileLists', payload: { SignImage: [] }});
            localDispatch({ type: 'setUploadRules', payload: { setPinSignImage: cardDetails?.cardSetPinNeedSign}});
            getData && getData();
        } else {
            localDispatch({ type: 'setError', payload: response});
            formContainerRef.current.scrollIntoView(0, 0);
            localDispatch({ type: 'setSetPinLoader', payload: false});
            localDispatch({ type: 'setUploadRules', payload: { setPinSignImage: cardDetails?.cardSetPinNeedSign}});
        }
    }
    const setCardpin = useCallback(async () => {
        try {
            await form.validateFields();
            if (cardDetails?.cardSetPinFee > cardDetails?.amount) {
                formContainerRef.current.scrollIntoView(0, 0);
                localDispatch({ type: 'setError', payload: t('cards.Messages.INSUFFICIENT_CARD_BALANCE')});
            } else {
                localDispatch({ type: 'setError', payload: null});
                localDispatch({ type: 'setSetPinLoader', payload: true});
                let obj = {
                    cardId: selectedCurdID,
                    customerId: user.id,
                    signImage: localState?.fileLists?.SignImage[0]?.response[0],
                };
            const urlParams = {obj:obj}
             await setpin(localDispatch,setGetpin,urlParams);
            }
        } catch (errorInfo) {
            localDispatch({ type: 'setError', payload: errorInfo});
        }
    }, [localState,form,t,selectedCurdID,formContainerRef]);

    const handleUploadChange = useCallback((type, { fileList }) => {
        localDispatch({ type: 'setError', payload: null});
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        if (fileList[0].size > MAX_FILE_SIZE) {
            localDispatch({ type: 'setError', payload: t('cards.Messages.FILE_SIZE_EXCEEDS_LIMIT')});
            formContainerRef.current.scrollIntoView(0, 0)
            return;
        }
        const fileName = fileList[0].name;
        const fileNameParts = fileName.split('.');
        if (fileNameParts?.length > 2) {
            formContainerRef.current.scrollIntoView(0, 0)
            localDispatch({ type: 'setError', payload: t('cards.Messages.INVALID_DOUBLE_EXTENSION')});
            return;
        }
        const fileExtension = fileNameParts[fileNameParts?.length - 1].toLowerCase();
        const allowedExtensions = ['png', 'jpg', 'jpeg'];
        if (!allowedExtensions.includes(fileExtension)) {
            localDispatch({ type: 'setError', payload: t('cards.Messages.INVALID_FILE_EXTENSION')});
            formContainerRef.current.scrollIntoView(0, 0)
            return;
        }
        localDispatch({ type: 'setFileLists', payload: { ...localState?.fileLists, [type]: fileList }});
        if (fileList?.length > 0) {
            form.setFields([
                {
                    name: type,
                    errors: [],
                },
            ]);
        }
        const latestFile = fileList[fileList?.length - 1];
        if (latestFile && latestFile.status === 'done') {
            successToaster({content :'Upload successful!',className : "custom-msg",duration : 3});
            localDispatch({ type: 'setUploadRules', payload: { setPinSignImage: false }});
            const imageUrl = latestFile.response?.url || URL.createObjectURL(latestFile.originFileObj);
            form.setFieldsValue({ [type]: imageUrl });
            localDispatch({ type: 'setPreviewImages', payload: { ...localState?.previewImages, [type]: imageUrl }});
            localDispatch({ type: 'setFileLists', payload: { ...localState?.fileLists, [type]: [...fileList]} });
        }
    }, [localState,t,form]);
    const handleRemove = useCallback((type) => {
        form.setFieldsValue({ [type]: null });
        localDispatch({ type: 'setFileLists', payload: {...localState?.fileLists,[type]: []} });
        localDispatch({ type: 'setUploadRules', payload: { setPinSignImage: cardDetails?.cardSetPinNeedSign,}});
        localDispatch({ type: 'setPreviewImages', payload: { ...localState?.previewImages, [type]: "" }});
    }, [localState]);

    const clearErrorMsg = useCallback(()=>{
        localDispatch({ type: 'setError', payload: null})
    },[])
    return (
            <>
                <div ref={formContainerRef}></div>
                <Form form={form} onFinish={setCardpin} className='terminate modal-wcontent'>
                    <>
                        {localState?.error && (
                            <div className="alert-flex mb-24">
                                <Alert
                                    type="error"
                                    description={localState?.error}
                                    onClose={clearErrorMsg }
                                    showIcon
                                />
                                <span className="icon sm alert-close c-pointer" onClick={clearErrorMsg}></span>
                            </div>
                        )}
                        <div className='summary-list-item summaryList-total mb-3 w-100 !pl-0'>
                            <p><strong>{cardDetails?.cardSetPinFee || "0.00"} {" "}{cardDetails?.cardcurrency}</strong>  {t('cards.setPin.FEE_CHARGED_PIN')}</p>
                        </div>
                        {cardDetails?.cardSetPinNote && <div className='info-card'>
                            <div className="summary-label">
                            {t('cards.setPin.NOTE')}
                            </div>
                            <p className='mb-0 text-sm text-lightWhite'>
                            {t('cards.setPin.PIN_RESET_EMAIL')}
                            </p>
                        </div>}
                        {cardDetails?.cardSetPinNeedSign && <Form.Item
                            name={"SignImage"}
                            className="payees-input mt-4 mb-4 required-reverse"
                            rules={[{ required: localState?.uploadRules?.setPinSignImage ? true : false, message: t('cards.Is_required') }]}
                        >
                            <div className="flex items-center justify-between mt-4 gap-4">
                                <p className="ant-form-item-required !mb-2">{t('cards.freeze.Sign_Photo')}<span className='text-requiredRed'> *</span> (2MB)</p>
                            </div>
                        <FileUpload
                            name="SignImage"
                            fileList={localState?.fileLists.SignImage}
                            previewImage={localState?.previewImages?.SignImage}
                            handleUploadChange={handleUploadChange}
                            handleRemoveImage={handleRemove}
                        />
                        </Form.Item>}
                        <div className='text-right'>
                        <CustomButton type="primary" className={"mt-9"} htmlType="submit" loading={localState?.setPinLoader}><span>Submit</span></CustomButton>
                        </div>
                    </>
                </Form>
            </>
    )
}
const connectStateToProps = ({ userConfig }) => {
    return {
        user: userConfig.details,
        trackauditlogs: userConfig?.trackAuditLogData,
    }
}
export default connect(connectStateToProps)(SetPin)