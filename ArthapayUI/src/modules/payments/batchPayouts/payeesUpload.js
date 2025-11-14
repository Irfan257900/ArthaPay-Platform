import React, { useCallback, useState } from "react";
import { Modal, Button, Upload } from "antd";
import AppAlert from "../../../core/shared/appAlert";
import { connect, useSelector } from "react-redux";
import PropTypes from "prop-types";
import Galleyimage from '../../../assets/images/upload.png';
import { deriveErrorMessage } from "../../../core/shared/deriveErrorMessage";
import { VALIDATION_ERROR_MESSAGES } from "../../../utils/validations";
import CustomButton from "../../../core/button/button";
import { successToaster } from "../../../core/shared/toasters";
import { getAccessTokenSilentlyGlobal } from "../../../core/authentication/auth0AccessToken";
const environment = window.runtimeConfig.VITE_WALLET_TYPE

const UPLOAD_API_END_POINT = environment === 'non_custodial' ?
    window.runtimeConfig.VITE_WEB3_API_END_POINT :
    window.runtimeConfig.VITE_API_END_POINT;

const PayeesUpload = ({ showModal, setShowModal, payeeUploadData }) => {
    const [error, setError] = useState(null);
    const [loader, setLoading] = useState(false);
    const [uploadKey, setUploadKey] = useState(Date.now());
    const [fileList, setFileList] = useState([]);
    const deviceToken = async () => {return { deviceToken: (await getAccessTokenSilentlyGlobal()) } };


    const handleCancelModalPopup = useCallback(() => {
        setShowModal(false);
        setError(null);
        setUploadKey(Date.now());
        setFileList([]);
    },[]);
    const removeFile = useCallback(() => {
        setError(null);
        payeeUploadData([]);
    },[]);
    const excelChange = useCallback(({ file }) => {
        setError(null);
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (file.status === 'removed') {
            setFileList([]);
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            if (file.status === 'done') {
                setFileList([file]);
            } else if (file.status === 'error') {
                setError(deriveErrorMessage(file))
            }
        } else {
            setError(VALIDATION_ERROR_MESSAGES.ONLY_XLSX_XLS_ALLOWED);
        }
    },[]);

    const handleSave = useCallback(async () => {
        setLoading(true)
        if (fileList.length === 0) {
            setError(VALIDATION_ERROR_MESSAGES.UPLOAD_EXCEL_FILE_BEFORE_SAVING);
        } else {
            payeeUploadData(fileList[0]?.response);
            handleCancelModalPopup();
            successToaster({content:VALIDATION_ERROR_MESSAGES.PAYEES_UPLOAD_SUCCESS_MESSAGE})
            setLoading(false);
        }

    },[fileList]);
    return (
        <Modal
            className='add-merchant invoice-modal'
            title={
                <h1 className="text-2xl text-titleColor font-semibold">Upload File</h1>}
            visible={showModal}
            closeIcon={true}
            onCancel={handleCancelModalPopup}
            footer={
                <>
                    <CustomButton type='cancel' className="" onClick={handleCancelModalPopup}>
                        Cancel
                    </CustomButton>
                    <CustomButton type='primary' className="" disabled={!fileList.length || loader} onClick={handleSave} loading={loader}>
                        Save
                    </CustomButton>
                </>
            }
        >
            {error && (
                <div className="alert-flex" style={{ width: "100%" }}>
                    <AppAlert className="w-100 " type="warning" description={error} showIcon />
                    <span className="icon sm alert-close" onClick={() => setError(null)}></span>
                </div>
            )}
            <br />
            <Upload
                key={uploadKey}
                action={UPLOAD_API_END_POINT + '/' + 'Merchant/uploadpayees'}
                headers={{
                    "Authorization": `Bearer ${deviceToken?.deviceToken}`
                }}
                className='upload-list-inline card-upload text-lightWhite'
                multiple={false}
                accept='.xlsx,.xls'
                maxCount={1}
                disabled={false}
                onChange={excelChange}
                showUploadList={{ showRemoveIcon: true }}
                onRemove={removeFile}
            >
                <Button className='upload-style' loading={loader}>
                    <img src={Galleyimage} className='gallery-icon mb-1 dark:invert-0 invert' alt='card' />
                    <p className="text-sm font-medium text-lightWhite text-center">Upload File<br />
                        Excel files are allowed</p>
                </Button>
            </Upload>
        </Modal>)

}
const connectStateToProps = ({ userConfig }) => {
    return { userConfig: userConfig.details };
};
const connectDispatchToProps = (dispatch) => {
    return {
        dispatch,
    };
};
PayeesUpload.propTypes = {
    userConfig: PropTypes.object,
    dispatch: PropTypes.func,
};
export default connect(
    connectStateToProps,
    connectDispatchToProps
)(PayeesUpload);