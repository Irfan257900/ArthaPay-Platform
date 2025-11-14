import React, { useCallback, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import { Alert, Form, Input, Modal, Upload, message } from "antd";
import moment from "moment";
import { v4 as uuidv4 } from 'uuid';
import { getPreviewFile, postMsgReplies } from "./httpServices";
import { initialState, caseReducer } from "./reducer";
import { getFileType,validateContentRules } from "../../shared/validations";
import CustomButton from "../../button/button";
import { Messages } from "./service";
import { CaseViewModalLoader } from "../../skeleton/case.loaders";
import { useSelector } from "react-redux";
import { currentApiVersion } from "../../http.clients";

const UPLOAD_API_END_POINT = `${window.runtimeConfig.VITE_CORE_API_END_POINT}/${currentApiVersion}casesuploadfile`;

const AccordionContent = ({ initialMessages, docDetails,caseData }) => {
    const [state, dispatch] = useReducer(caseReducer, initialState);
    const {
        fileLists,
        showPreviewModel,
        uploadError,
        messages,
        inputText,
        documentUploading,
        previewImg,
        btnLoader,
        selectedFilesList,
        showPreviewLoader,
        previewError,
        fileType,
        selectedFileName
    } = state;
    const [form] = Form.useForm();

    const userProfileInfo = useSelector(state => state.userConfig.details);

    const today = moment().startOf("day");
    const groupedMessages = messages?.reduce((acc, message) => {
        const messageDate = moment(message.repliedDate);
        const dateKey = messageDate.isSame(today, "day")
            ? "Today"
            : messageDate.format("DD MMM YYYY");
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(message);
        return acc;
    }, {});
    useEffect(() => {
        if (initialMessages)
            dispatch({ type: 'SET_MESSAGES', payload: initialMessages });
    }, [initialMessages])
    const renderMessage = (message, isCustomer) => {
        const { repliedBy, reply, repositories, repliedDate } = message;     
        const time =moment.utc(repliedDate).local().format("hh:mm A"); 
        return (
            <div
                className={`${isCustomer
                    ? "accordian-first-text-space"
                    : "accordian-second-text-space"
                    }`}
                key={message.id}
            >
                <div className="md:px-4 p-2">

                    <div className="flex top-chat md:space-x-4 space-x-2">
                        {isCustomer && (
                            <div className="accordianprofile-letter w-10 h-10 flex items-center justify-center rounded-md bg-primaryColor">
                               <p className="text-textPrimary dark:!text-notifPara text-sm font-semibold"> {repliedBy?.slice(0, 2)?.toUpperCase()}</p>
                            </div>
                        )}

                        <div
                            className={`accordian-first-text border border-StrokeColor bg-sectionBG w-full !p-4 ${isCustomer ? "triangle-left-top" : "triangle-right-top"
                                } `}
                        >
                            <div className="flex justify-between">
                                <p className="accordian-Brooklyn m-0">{repliedBy}</p>
                                <p className="accordian-date m-0">{time}</p>
                            </div>
                            <div className={`p-3 mt-0.5 rounded-5 bg-menuhover ${isCustomer ? "accordian-p mt accordian-second-text m-0" : "accordian-p m-0"}`}><p className="break-all whitespace-pre-line">{reply}</p></div>
                            {repositories?.length > 0 && (

                                <div>
                                    <div>
                                        {repositories.map((doc) => (

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" key={doc.id} >
                                                <div className="flex user-upload space-x-2 p-2 bg-inputDarkBorder border border-StrokeColor rounded-md">
                                                <div className="">
                                                <span className="icon file-attachement mt-1"></span>
                                                </div>
                                                <div className="">
                                                <a onClick={() => handlePreview(doc)} className=" inline-block md:w-[300px] w-[150px] text-lightWhite truncate overflow-hidden whitespace-nowrap" >
                                                    {doc.fileName}
                                                </a>
                                                </div>
                                                </div>
                                            </div>

                                        ))}
                                    </div>

                                </div>

                            )}
                        </div>
                        {!isCustomer && (
                            <div className="accordianprofile-letter w-10 h-10 flex items-center justify-center !text-lightDark rounded-md bg-primaryColor">
                                {repliedBy?.slice(0, 2)?.toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    const setGetCaseDetails = (res,doc)=>{
        if (res) {
            const base64String = res;
            const mimeType = getFileType(base64String);
            const fileWithPrefix = addMimeTypePrefix(base64String, mimeType);
            dispatch({ type: 'SET_PREVIEW_DATA',
            payload: {
                previewImg: fileWithPrefix,
                fileType: mimeType,
                selectedFileName:doc.fileName
            },
        });
        } else {
            dispatch({
                type: 'SET_PREVIEW_STATUS',
                payload: {
                    loader: false,
                    error: res,
                },
            });
        }
    }
    const handlePreview = useCallback(async (doc) => {
        dispatch({ type: 'SET_SHOW_PREVIEW_MODEL', payload: true });
        await getPreviewFile(dispatch,(res)=>setGetCaseDetails(res,doc),doc?.id);
    },[]);
    const addMimeTypePrefix = (base64String, fileType) => {
        if (fileType === "image") {
            const mimeType = base64String?.startsWith("iVBOR") ? Messages.ALLOWED_MIME_TYPES.PNG : Messages.ALLOWED_MIME_TYPES.JPEG;
            return `data:${mimeType};base64,${base64String}`;
        }
        if (fileType === "pdf") {
            return `data:application/pdf;base64,${base64String}`;
        }
        return base64String;
    };
    const renderPreview = () => {
        switch (fileType) {
            case "image":
                return <img src={previewImg} alt="Preview" style={{ maxWidth: "100%", maxHeight: "500px", margin:"auto" }} />;
            case "pdf":
                return <iframe src={previewImg} width="100%" height="500" title="PDF Preview" />;
            default:
                return <p>Unsupported file type</p>;
        }
    };

    const handleDownload = useCallback(() => {
        const link = document.createElement('a');
        link.href = previewImg;
        link.download = selectedFileName;
        link.click();
    },[previewImg,selectedFileName]);
    const setPostMsgReplies = (response,inputContent)=>{
        if (response) {
            const newMessage = {
                id: uuidv4(),
                docunetDetailId: docDetails?.id,
                reply: inputContent,
                repliedBy: userProfileInfo?.name,
                repliedDate: new Date().toISOString(),
                isCustomer: true,
                repositories: selectedFilesList,
            };
            dispatch({ type: 'SET_MESSAGES', payload: [...messages, newMessage] });
            setTimeout(() => {
                message.success(Messages.MESSAGE_SENT_SUCCESS);
            }, 1000);
            dispatch({ type: 'SET_INPUT_TEXT', payload: "" });
            dispatch({ type: 'SET_SELECTED_FILES_LIST', payload: [] });
            dispatch({ type: 'SET_FILE_LISTS', payload: { SignImage: [] } });
        } else {
            dispatch({ type: 'SET_UPLOAD_ERROR', payload: response});
        }
    }
    const handleSendMessage = useCallback(async () => {
        if (!inputText.trim()) {
            form.setFields([
                {
                    name: 'SignImage',
                    errors: ['Is required'],
                },
            ]);
            return;
        }
        dispatch({ type: 'SET_BTN_LOADER', payload: true });
        if (inputText.trim()) {
            let obj = {
                "caseId": docDetails?.caseId,
                "id": uuidv4(),
                "docunetDetailId": docDetails?.id,
                "repositories": selectedFilesList,
                "reply": inputText,
                "repliedBy": userProfileInfo?.name,
                "repliedDate":  new Date().toISOString(),
                "isCustomer": true,
                "path": null,
                "status": null,
                "info": null,
                "customerId": userProfileInfo?.id
            }
            await postMsgReplies(dispatch,(res)=>setPostMsgReplies(res,inputText),obj, docDetails?.id);
        } else {
            message.error(Messages.ENTER_MESSAGE);
        }
    },[inputText,form,docDetails,selectedFilesList,userProfileInfo]);

    const handleUploadChange = (type, { file, fileList }) => {
        dispatch({ type: 'SET_UPLOAD_ERROR', payload: null });
        const MAX_FILE_SIZE = 2 * 1024 * 1024;
        const fileNameParts = file.name.split('.');
        if (file.size > MAX_FILE_SIZE) {
            dispatch({ type: 'SET_UPLOAD_ERROR', payload: Messages.FILE_SIZE_EXCEED });
            return;
        }
        if (fileNameParts?.length > 2) {
            dispatch({ type: 'SET_UPLOAD_ERROR', payload: Messages.DOUBLE_EXTENSION_NOT_ALLOWED });
            return;
        }
        dispatch({ type: 'SET_FILE_LISTS', payload: { ...fileLists, [type]: fileList } });
        if (file.status === "uploading") {
            dispatch({ type: 'SET_DOCUMENT_UPLOADING', payload: true });
        }
        if (file.status === "done") {
            const response = file.response;
            if (response) {
                const uploadedFile = {
                    id: response.id,
                    fileName: response.fileName,
                    fileSize: response.fileSize,
                    state: "submitted",
                };
                dispatch({ type: 'SET_SELECTED_FILES_LIST', payload: [...selectedFilesList, uploadedFile] });
                dispatch({ type: 'SET_FILE_LISTS', payload: { ...fileLists, [type]: [...fileLists[type], uploadedFile] } });
                message.success(Messages.UPLOAD_SUCCESS);
            } else {
                message.error(Messages.UPLOAD_RESPONSE_INVALID);
            }
            dispatch({ type: 'SET_DOCUMENT_UPLOADING', payload: false });
        }
        if (file.status === "error") {
            dispatch({ type: 'SET_DOCUMENT_UPLOADING', payload: false });
            dispatch({ type: 'SET_UPLOAD_ERROR', payload: Messages.UPLOAD_FAILED });
        }
    };
    const handleRemove = (id) => {
        dispatch({
            type: 'SET_SELECTED_FILES_LIST',
            payload: selectedFilesList.filter((file) => file.id !== id)
        });
        dispatch({ type: 'SET_UPLOAD_ERROR', payload: null });
    };

    const handleInputChange = useCallback((e) => {
        dispatch({ type: 'SET_INPUT_TEXT', payload: e.target.value });
    },[]);
    const clearErrorMsg = useCallback(()=>{
        dispatch({ type: 'SET_UPLOAD_ERROR', payload: null });
    },[]);
    const handleSignImageChange = useCallback((info)=>{
        handleUploadChange('SignImage', info);
    },[]);
    const handleModelPreview = useCallback(()=>{
        dispatch({ type: 'SET_SHOW_PREVIEW_MODEL', payload: false });
    },[]);
    const handleBeforeUpload = useCallback((file) => {
        const MAX_FILE_SIZE = 2 * 1024 * 1024;
        const fileNameParts = file.name.split('.');
        if (file.size > MAX_FILE_SIZE) {
            message.error(Messages.FILE_SIZE_EXCEED);
            return Upload.LIST_IGNORE;
        }
        if (fileNameParts?.length > 2) {
            message.error(Messages.DOUBLE_EXTENSION_NOT_ALLOWED);
            return Upload.LIST_IGNORE;
        }
        return true;
    }, [Messages]);
    const handleModelPreviewError = useCallback(()=>{
        dispatch({ type: 'SET_SHOW_PREVIEW_ERROR', payload: null });
    },[]);

    return (
        <>
            {Object.entries(groupedMessages).map(([dateKey, messages]) => (
                <div key={dateKey}>
                    <div className="text-center mt-2">
                        <p className="accordian-today">{dateKey}</p>
                    </div>
                    {messages.map((message) => renderMessage(message, message.isCustomer))}
                </div>
            ))}

            {uploadError && <Alert
                className="mb-12 security-error"
                description={uploadError}
                closable
                onClose={clearErrorMsg }

            />}
            <div className='w-full collapsInput upload-chat px-4'>
            { caseData?.state?.toLowerCase() !== 'approved' && <Form form={form} onFinish={handleSendMessage}>
                <div className="flex !w-full gap-4 mb-5">
                    <div className="flex-1">
                        <Form.Item
                        className="!mb-0"
                        name={"SignImage"}
                        rules={[
                            {
                                required: true,
                                message: 'Is required',
                            },
                            {
                                whitespace: true,
                                message: 'Is required',
                            },
                            {
								validator: validateContentRules,
							},
                        ]}
                    >
                        <div className='flex items-center chat-input-field'>
                            <Input
                                className="w-[98%] reply-input-field !bg-transparent !border-0 h-11 !shadow-none"
                                placeholder="Send Message"
                                starNotRequired={false}
                                maxLength={200}
                                onChange={handleInputChange}
                                onPressEnter={handleSendMessage}
                                value={inputText}
                            />
                            <Upload
                                action={UPLOAD_API_END_POINT}
                                className="mb-0"
                                beforeUpload={handleBeforeUpload  }
                                multiple={true}
                                accept="image/*,application/pdf"
                                showUploadList={false}
                                onPreview={handlePreview}
                                onChange={handleSignImageChange }
                                fileList={fileLists.SignImage}
                            >
                                <div className='flex items-center -bottom-2 absolute -left-1.5 cursor-pointer'>
                                    <span className="icon file-attachement"></span>
                                </div>
                            </Upload>
                        </div>
                    </Form.Item>
                    </div>
                    
                    <div className="!mt-2">
                        <CustomButton
                            className="submit-sm-btn accordian-button md:min-w-[60px] !h-11"
                            type="primary"
                            htmlType="submit"
                            loading={btnLoader}
                        >   
                            <span className="icon send-icon"></span>
                        </CustomButton>
                    </div>
                    </div>
                </Form>}

            </div>
            <div>
                {documentUploading && <CaseViewModalLoader />}
                {/* <Row gutter={[16, 16]} className="align-center"> */}
                {selectedFilesList.length > 0 ? (
                    selectedFilesList.map((file, index) => (
                        
                            <div  key={file.id || index}>
                                           
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 mb-2">
                                
                                 <div className=" upload-background p-2 rounded-md bg-inputDarkBorder border border-borderLightGreen ">
                                    <div className="flex justify-between">
                                    <div className="flex space-x-2">
                                    <span className="icon file-attachement mt-1"></span>                                    
                                    <div className="files-overflow text-ellipsis xl:w-[300px] w-[180px] !truncate">
                                    <a onClick={() => handlePreview(file)} className="file-name ">{file.fileName}</a> 
                                    </div>
                                    </div>
                                    <div>
                                    <span onClick={() => handleRemove(file.id)} className="icon delete"></span>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                       
                    ))                   
                ) : (
                    <p className="text-center col-span-2"></p>
                )}
                {/* </Row> */}
            </div>
            
            
            <Modal
                visible={showPreviewModel}
                title=" "
                className="accordian-pop mt-14"
                closeIcon={
                    <button className="btn-plane" onClick={handleModelPreview }>
                        <span className="icon close"></span>
                    </button>
                }
                onCancel={handleModelPreview}
                footer={[
                    <CustomButton key="back" type="cancel" onClick={handleModelPreview} className="close-btn close-btn">
                        Close
                    </CustomButton>,
                    <CustomButton
                        key="download"
                        type="primary"
                        className="profile-sm-btn"
                        onClick={handleDownload}
                    >
                        Download
                    </CustomButton>
                ]}
            >
                <div className="!my-14">
                {previewError &&
                    <Alert className="mb-12 security-error"
                        description={previewError}
                        closable
                        onClose={handleModelPreviewError } />}
                {showPreviewLoader && <CaseViewModalLoader />}
                {!showPreviewLoader && !previewError && renderPreview()}
                </div>
            </Modal>
        </>
    );
};

AccordionContent.propTypes = {
    initialMessages: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            repliedDate: PropTypes.string.isRequired,
            repliedBy: PropTypes.string.isRequired,
            reply: PropTypes.string.isRequired,
            isCustomer: PropTypes.bool.isRequired,
            repositories: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    fileName: PropTypes.string.isRequired,
                })
            ),
        })
    ).isRequired,

};

export default AccordionContent;
