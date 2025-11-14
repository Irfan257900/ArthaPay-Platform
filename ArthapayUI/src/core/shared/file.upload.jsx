import React, { useCallback, useState } from "react";
import { Upload, Button } from "antd";
import PreviewModal from "./preview.model";
import uploadImg from "../../assets/images/uploadDocument.svg";
import { PdfThumbnail } from "./pdf.preview";
import { currentApiVersion } from "../http.clients";

const UPLOAD_API_END_POINT = `${window.runtimeConfig.VITE_CORE_API_END_POINT}/${currentApiVersion}`;

// Helper function to truncate the filename with a long ellipsis
const truncateFilename = (filename, maxLength = 30) => {
  if (!filename) {
    return ;
  }
  if (filename.length <= maxLength) {
    return filename;
  }
  const extension = filename.slice(filename.lastIndexOf('.'));
  const baseName = filename.slice(0, filename.lastIndexOf('.'));
  const ellipsis = ".....";
  const startLength = Math.floor((maxLength - ellipsis.length - extension.length) / 2);
  const endLength = maxLength - ellipsis.length - startLength - extension.length;

  return `${baseName.slice(0, startLength)}${ellipsis}${baseName.slice(-endLength)}${extension}`;
};


const FileUpload = ({
  name,
  fileList,
  previewImage,
  handleUploadChange,
  handleRemoveImage,
  isImagesOnly,
  uploadEndpoint = "uploadfile"
}) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState("");
  const handlePreview = useCallback((file) => {
    const fileUrl = file?.url || file?.thumbUrl || file?.response?.url || file?.response?.fileUrl || file?.response?.fileUrl;
    if (fileUrl) {
      setPreviewFile(fileUrl);
      setIsPreviewVisible(true);
    } else {
      console.error("Preview URL is not available.");
    }
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewVisible(false);
    setPreviewFile("");
  }, []);
  const handleFileChange = useCallback(
    (info) => {
      if (info?.file?.status === "removed") {
        handleRemoveImage(name);
      } else {
        handleUploadChange(name, info);
      }
    },
    [handleRemoveImage, handleUploadChange]
  );
  const handleDownload = useCallback((file) => {
    const fileUrl = file?.url || file?.response?.url || file?.response?.[0] || file?.response?.fileUrl
    if (fileUrl) {
      window.open(fileUrl, "_self");
    } else {
      console.error("Download URL is not available.");
    }
  }, []);

  // Custom render function for the file list items
  const customItemRender = (originNode, file, fileList, actions) => {
    const truncatedName = truncateFilename(file?.name);
    return (
      <div className="ant-upload-list-item-info">
        <span className="ant-upload-list-item-icon">
          {originNode?.props?.children?.[0]}
        </span>
        <span className="ant-upload-list-item-name" title={file?.name}>
          {truncatedName}
        </span>
        <span className="ant-upload-list-item-actions">
          {originNode?.props?.children?.[2]}
        </span>
      </div>
    );
  };
  return (
    <>
      <Upload
        action={UPLOAD_API_END_POINT + uploadEndpoint}
        className="upload-list-inline card-upload"
        multiple={false}
        accept={isImagesOnly ? "image/*" : "image/*,application/pdf"}
        maxCount={1}
        onChange={handleFileChange}
        showUploadList={{
          showDownloadIcon: true,
          showPreviewIcon: true,
          showRemoveIcon: true,
        }}
        onPreview={handlePreview}
        fileList={fileList}
        onDownload={handleDownload}
        itemRender={customItemRender}
      >
        <div className="relative group">
          <Button
            className="upload-style upload-flex !h-[204px] disabled:cursor-default p-3.5 border-2  text-center !bg-BlackBg  rounded-5"
            disabled={fileList?.length > 0}
          >
            {previewImage?.endsWith(".pdf") && <PdfThumbnail />}
            {previewImage && !previewImage.endsWith(".pdf") && (
              <img
                src={previewImage}
                alt="preview"
                style={{
                  width: "100%",
                  objectFit: "Contain",
                  borderRadius: "5px",
                }}
                className="h-[168px]"
              />
            )}
            {!previewImage && (
              <div draggable={false}>
                {/* <img
                  src={uploadImg}
                  alt="upload"
                  className="mx-auto dark:invert-0 invert w-12 mb-2"
                  draggable={false}
                /> */}
                <span className="icon uploadfile"></span>
                <div className="text-center flex justify-center items-center">
                  <p className="text-paraColor text-center">
                  <strong className="!text-subTextColor xl:w-64 w-full break-words whitespace-pre-line">
                    Drag and Drop or Browse to Choose File(2MB)
                  </strong>
                  <br />
                  <p className="break-words whitespace-pre-line">
                    {isImagesOnly
                      ? "PNG, JPG, and JPEG files are allowed"
                      : "PNG, JPG, JPEG, and PDF files are allowed"}
                  </p>
                </p>
                </div>
              </div>
            )}
          </Button>
          {previewImage && (
            <button
              type="button"
              onClick={(e) => {
                e?.stopPropagation();
                e?.preventDefault();
                handlePreview({ url: previewImage });
              }}
              className="hidden group-hover:absolute w-full group-hover:flex h-full top-0 right-0 border-none p-0 items-center justify-center gap-2 bg-overlayblack left-0 bottom-0 cursor-pointer !pointer-events-auto"
            >
              <span className="icon preview-eye"></span>
              <span className="text-base font-semibold text-lightWhite">
                Preview
              </span>
            </button>
          )}
        </div>
      </Upload>
      <PreviewModal
        isVisible={isPreviewVisible}
        fileUrl={previewFile}
        onClose={handleClosePreview}
      />
    </>
  );
};

export default FileUpload;