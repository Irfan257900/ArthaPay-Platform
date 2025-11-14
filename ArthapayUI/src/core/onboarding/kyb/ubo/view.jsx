import React, { useCallback, useState } from "react";
import { Alert, Form } from "antd";
import CustomButton from "../../../button/button";
import KycDocument from "../../../shared/document.preview";
import PreviewModal from "../../../shared/preview.model";
import { formatDate } from "../../http.services";
import { decryptAES } from "../../../shared/encrypt.decrypt";

const UBOView = ({ data, onClose }) => {
    const [form] = Form.useForm();
    const [error, setError] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [previewFile, setPreviewFile] = useState("");


    const handleClosePreview = useCallback(() => {
        setIsPreviewVisible(false);
        setPreviewFile("");
    }, []);

    const handlePreview = useCallback((file) => {
        const fileUrl = file.url || file.thumbUrl || file.response?.url;
        if (fileUrl) {
            setPreviewFile(fileUrl);
            setIsPreviewVisible(true);
        } else {
            console.error("Preview URL is not available.");
        }
    }, []);
    const onDownload = useCallback((file) => {
        const fileUrl = file.url || file.response?.url;
        if (fileUrl) {
            window.open(fileUrl, "_blank");
        } else {
            console.error("Download URL is not available.");
        }
    }, [])
    const onCloseError = useCallback(() => {
        setError(null);
    }, []);
    return (
        <div>
            {error !== null && (
                <div className="alert-flex">
                    <Alert
                        type="error"
                        description={error}
                        onClose={onCloseError}
                        showIcon
                    />
                    <button
                        className="icon sm alert-close"
                        onClick={onCloseError}
                    ></button>
                </div>
            )}
            <div className="">
                <Form form={form}>
                    <div className="w-full py-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                            {data?.uboPosition && <div>
                                <label className="text-sm font-normal text-paraColor">
                                    Position
                                </label>
                                <p className="text-base font-medium text-subTextColor">
                                    {data?.uboPosition || "--"}
                                </p>
                            </div>}

                            {data?.firstName && <div>
                                <label className="text-sm font-normal text-paraColor">
                                    First Name
                                </label>
                                <p className="text-base font-medium text-subTextColor">
                                    {data?.firstName || "--"}
                                </p>
                            </div>}
                            {data?.middleName && <div>
                                <label className="text-sm font-normal text-paraColor">
                                    Middle Name
                                </label>
                                <p className="text-base font-medium text-subTextColor">
                                    {data?.middleName || "--"}
                                </p>
                            </div>}
                            {data?.lastName && <div>
                                <label className="text-sm font-normal text-paraColor">
                                    Last Name
                                </label>
                                <p className="text-base font-medium text-subTextColor">
                                    {data?.lastName || "--"}
                                </p>
                            </div>}
                            {data?.shareHolderPercentage && <div>
                                <label className="text-sm font-normal text-paraColor">
                                    Shareholder Percentage
                                </label>
                                <p className="text-base font-medium text-subTextColor capitalize">
                                    {data?.shareHolderPercentage || "--"}
                                </p>
                            </div>}
                            {data?.dob && <div>
                                <label className="text-sm font-normal text-paraColor">
                                    Date Of Birth
                                </label>
                                <p className="text-base font-medium text-subTextColor">
                                    {formatDate(data?.dob)}
                                </p>
                            </div>}
                            {data?.email && <div>
                                <label className="text-sm font-normal text-paraColor">
                                    Email
                                </label>
                                <p className="text-base font-medium text-subTextColor">
                                    {decryptAES(data?.email) || "--"}
                                </p>
                            </div>}
                            {data?.phoneNumber && <div>
                                <label className="text-sm font-normal text-paraColor">
                                    Phone Number
                                </label>
                                <p className="text-base font-medium text-subTextColor">
                                    {decryptAES(data?.phoneCode)}{' '}{decryptAES(data?.phoneNumber)}
                                </p>
                            </div>}
                        </div>
                    </div>
                    <div className=" w-full">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-semibold text-titleColor mb-5 mt-5">
                                Documents
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                            <div>
                                <label className="text-sm font-normal text-paraColor">
                                    Document Type
                                </label>
                                <p className="text-base font-medium text-subTextColor">
                                    {data?.docDetails?.type || "--"}
                                </p>
                            </div>
                            {/* <div>
                            <label className="text-sm font-normal text-paraColor">
                                ID Issued Country
                            </label>
                            <p className="text-base font-medium text-subTextColor">
                                {data?.docDetails?.idIssuingCountry || "--"}
                            </p>
                        </div> */}
                            {data?.docDetails?.number && <div>
                                <label className="text-sm font-normal text-paraColor">
                                    Document Number
                                </label>
                                <p className="text-base font-medium text-subTextColor">
                                    {decryptAES(data?.docDetails?.number) || "--"}
                                </p>
                            </div>}
                            {data?.docDetails?.expiryDate && <div>
                                <label className="text-sm font-normal text-paraColor">
                                    Document Expiry Date
                                </label>
                                <p className="text-base font-medium text-subTextColor">
                                    {formatDate(data?.docDetails?.expiryDate) || "--"}
                                </p>
                            </div>}
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 mt-4">

                            {data?.docDetails?.frontImage && <KycDocument
                                label="Front ID Photo"
                                imageUrl={data?.docDetails?.frontImage}
                                onPreview={handlePreview}
                                onDownload={onDownload}
                            />}
                            {data?.docDetails?.backImage && <KycDocument
                                label="Back ID Photo"
                                imageUrl={data?.docDetails?.backImage}
                                onPreview={handlePreview}
                                onDownload={onDownload}
                            />}
                        </div>
                    </div>
                    <div className="text-end mt-9">
                        <CustomButton
                            type="secondary"
                            htmlType="reset"
                            onClick={onClose}
                        >
                            Close
                        </CustomButton>
                    </div>
                </Form>
                {isPreviewVisible && <PreviewModal
                    isVisible={isPreviewVisible}
                    fileUrl={previewFile}
                    onClose={handleClosePreview}
                />}
            </div>
        </div>
    );
};

export default UBOView;
