import { Alert, Form } from "antd";
import { connect } from "react-redux";
import { useCallback, useReducer, useRef } from "react";
import CustomButton from "../../../core/button/button";
import { freezeunfreezeCard } from "../httpServices";
import { useOutletContext } from "react-router";
import { successToaster } from "../../../core/shared/toasters";
import FileUpload from "../../../core/shared/file.upload";
import { freezeOrUnfreezereducer, freezeOrUnfreezeState } from "./card.reducer";
import { useTranslation } from "react-i18next";
const CardFreezeControl = ({ user, cardDetails, handleErrorMessage, handleFreezeModal, selectedCurdID }) => {
    const [form] = Form.useForm();
    const formContainerRef = useRef(null);
    const getData = useOutletContext();
    const [localState, localDispatch] = useReducer(freezeOrUnfreezereducer, freezeOrUnfreezeState);
    const { t } = useTranslation();
    const setGetfreezeCard = (response)=>{
        if (response) {
            successToaster({content : t('cards.Messages.Card_State_Updated'),className : "custom-msg",duration : 3})
            localDispatch({ type: 'setError', payload: null });
            localDispatch({ type: 'setFileLists', payload: { SignImage: [] } });
            form.resetFields()
            localDispatch({ type: 'setUploadRules', payload: { freezeSignImage: cardDetails?.needSignforFreezeCard} });
            getData && getData();
             handleFreezeModal("save")
        }
        else {
            localDispatch({ type: 'setUploadRules', payload: { freezeSignImage: cardDetails?.needSignforFreezeCard,} });
            localDispatch({ type: 'setError', payload: response });
            form.resetFields()
            localDispatch({ type: 'setFileLists', payload: { SignImage: [] } });
            localDispatch({ type: 'setBtnLoader', payload: false });
            handleFreezeModal()
        }
      }
    const freezeCard = useCallback(async () => {
        let obj = {
            "id": selectedCurdID,
            "status": cardDetails?.state?.toLowerCase() == "freezed" ? 'Active' : 'Inactive',
            "actionBy": cardDetails?.state?.toLowerCase() == "freezed" ? 'UnFreezed' : 'Freezed',
            "createdBy": user?.name,
            "createdDate": new Date(), SignImage: localState?.fileLists?.SignImage[0]?.response[0]
        }
        const urlParams = {id:user.id, cardid:selectedCurdID ,obj:obj,isFreezed:cardDetails?.state?.toLowerCase() == "freezed"}
        await freezeunfreezeCard(localDispatch,setGetfreezeCard,urlParams);
    }, [localState, selectedCurdID, cardDetails, user, localDispatch]);
    const handleUploadChange = useCallback((type, { fileList }) => {
        localDispatch({ type: 'setError', payload: null });
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        if (fileList?.[0]?.size > MAX_FILE_SIZE) {
            localDispatch({ type: 'setError', payload: t('cards.Messages.FILE_SIZE_EXCEEDS_LIMIT') });
            formContainerRef.current.scrollIntoView(0, 0)
            return;
        }
        const fileName = fileList?.[0]?.name;
        const fileNameParts = fileName?.split('.');
        if (fileNameParts?.length > 2) {
            formContainerRef?.current?.scrollIntoView(0, 0)
            localDispatch({ type: 'setError', payload: t('cards.Messages.INVALID_DOUBLE_EXTENSION') });
            return;
        }
        const fileExtension = fileNameParts[fileNameParts?.length - 1]?.toLowerCase();
        const allowedExtensions = ['png', 'jpg', 'jpeg'];
        if (!allowedExtensions.includes(fileExtension)) {
            localDispatch({ type: 'setError', payload: t('cards.Messages.INVALID_FILE_EXTENSION')  });
            formContainerRef?.current?.scrollIntoView(0, 0)
            return;
        }
        localDispatch({ type: 'setFileLists', payload: { ...localState?.fileLists, [type]: fileList } });
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
            localDispatch({ type: 'setUploadRules', payload: { freezeSignImage: false} });
            const imageUrl = latestFile.response?.url || URL.createObjectURL(latestFile.originFileObj);
            form.setFieldsValue({ [type]: imageUrl });
            localDispatch({ type: 'setPreviewImages', payload: { ...localState?.previewImages, [type]: imageUrl } }) 
            localDispatch({ type: 'setFileLists', payload: { ...localState?.fileLists, [type]: [...fileList]} })
        }
    }, [localState,form,t]);
    const handleRemove = useCallback((type) => {
        form.setFieldsValue({ [type]: null });
        localDispatch({ type: 'setFileLists', payload:{...localState?.fileLists, [type]: [] } }) 
        localDispatch({ type: 'setUploadRules', payload: { freezeSignImage: cardDetails?.needSignforFreezeCard} });
        localDispatch({ type: 'setPreviewImages', payload: { ...localState?.previewImages, [type]: "" } }) 
    }, [localState,cardDetails,form]);
    const handleCancel = useCallback(() => {
        localDispatch({ type: 'setError', payload: null });
        handleFreezeModal()
        form.resetFields()
        localDispatch({ type: 'setFileLists', payload:{ SignImage: [] } }) 
        handleErrorMessage(null)
    }, [form]);
    const clearErrorMsg = useCallback(()=>{
        localDispatch({ type: 'setError', payload: null });
    },[])
    const handleFreezeCard = useCallback(() => {
        form.validateFields()
            .then(() => {
                freezeCard();
            })
            .catch((errorInfo) => {
                localDispatch({ type: 'setError', payload: errorInfo });
            });
    }, [form, freezeCard]);
    return (
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
            <div ref={formContainerRef}></div>
            <p className='text-md text-lightWhite font-semibold pt-3 pb-4'>{t('cards.freeze.Do_you_really_want_to')} {cardDetails?.state?.toLowerCase() === "freezed" ? `${t('cards.freeze.UnFreeze')}` : `${t('cards.freeze.Freeze')}`}?</p>
            {cardDetails?.needSignforFreezeCard && (
                <Form form={form} name="form" onFinish={freezeCard} className='modal-wcontent'>
                    <Form.Item
                        name={"SignImage"}
                        className="payees-input mt-4 mb-4 required-reverse"
                        rules={[{ required: localState?.uploadRules?.freezeSignImage ? true : false, message: t('cards.Is_required') }]}
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

                    </Form.Item>
                </Form>
            )}
            <div className='text-right'>
            <CustomButton key="back" onClick={handleCancel} type="" className={""}>
                   No
                </CustomButton>
            <CustomButton type="primary" className={"mb-5 ml-3.5"}
                    key="submit"
                    loading={localState?.btnLoader}
                    onClick={handleFreezeCard}
                >
                    Yes
            </CustomButton>               
                
            </div>
            </>
    )
}
const connectStateToProps = ({ userConfig }) => {
    return {
        user: userConfig.details,
        trackauditlogs: userConfig?.trackAuditLogData,
    }
}
export default connect(connectStateToProps)(CardFreezeControl)