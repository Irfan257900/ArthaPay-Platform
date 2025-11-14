import React, { memo, useCallback, useRef, useState } from "react";
import { Progress, Upload } from "antd";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import AppModal from "./appModal";
import { uploadFileWithProgress } from "../httpServices";
const defaultUploadList={
  showDownloadIcon:true,
  showPreviewIcon:true,
  showRemoveIcon:true,
}
const defaultFileTypes = {
  images: {
    "image/png": true,
    "image/jpg": true,
    "image/jpeg": true,
    "image/webp": true,
    "image/PNG": true,
    "image/JPG": true,
    "image/JPEG": true,
    "image/WEBP": true,
    errorMessage:
      "File is not allowed. Please upload only jpg, png, jpeg files!",
  },
  videos: {
    "video/mp4": true,
    "video/webm": true,
    "video/ogg": true,
    errorMessage:
      "File is not allowed. Please upload only mp4, webm, ogg files!",
  },
  all: true,
};
const isFileAcceptable = (file, accept, size, fileTypes) => {
  const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  if (accept && !fileTypes[accept][file.type]) {
    return { acceptable: false, error: fileTypes[accept]["errorMessage"] };
  }
  if (size && fileSizeInMB > size) {
    return {
      acceptable: false,
      error: `File Size should be less than ${size}MB! Current File size : (${fileSizeInMB}) MB`,
    };
  }
  return { acceptable: true, error: "" };
};

const AppUpload = ({
  onChange,
  onUploadError,
  onRemove,
  onDownload,
  fileList = [],
  fileSize = 2,
  fileTypes = defaultFileTypes,
  accept = "images",
  className,
  children,
  canCrop = false,
  showUploadList={defaultUploadList},
  uploading,
  setUploading,
}) => {
  const [image, setImage] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);
  const [modal, setModal] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const cropperRef = useRef(null);
  const beforeUpload = useCallback(
    (file) => {
      const { acceptable, error } = isFileAcceptable(
        file,
        accept,
        fileSize,
        fileTypes
      );
      if (acceptable && !canCrop) {
        handleManualUpload(file);
      } else if (acceptable && canCrop) {
        setCroppedFile(file);
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result);
          setModal("crop");
        };
        reader.readAsDataURL(file);
      } else {
        onRemove?.();
        onUploadError?.(error);
      }
      return false;
    },
    [accept, fileSize, fileTypes, canCrop]
  );

  const handleCrop = useCallback(() => {
    if (cropperRef.current) {
      const croppedCanvas = cropperRef.current.cropper?.getCroppedCanvas();
      if (croppedCanvas) {
        croppedCanvas.toBlob((blob) => {
          const newCroppedFile = new File([blob], croppedFile?.name, {
            type: "image/png",
          });
          setCroppedFile(newCroppedFile);
        });
      }
    }
  }, [cropperRef.current,croppedFile]);
  const handleManualUpload = async (file) => {
    onUploadError?.("")
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await uploadFileWithProgress(
        async (response) => {
          await onChange?.(
            {
              name: file.name,
              url: response,
            },
            file
          );
        },
        onUploadError,
        setUploadProgress,
        formData
      );
    } catch (error) {
      onUploadError(error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  const handleOk = useCallback(async () => {
    if (croppedFile) {
      await handleManualUpload(croppedFile);
    }
    setModal("");
  }, [croppedFile]);

  const handleCancel = useCallback(() => {
    setModal("");
    setImage(null);
  }, []);
  const onPreview = useCallback(() => {
    setModal("preview");
  });
  const onPreviewClose = useCallback(() => {
    setModal("");
  }, []);
  const rotateLeft = useCallback(() => {
    if (cropperRef?.current?.cropper) {
      cropperRef.current.cropper.rotate(-90);
    }
  }, [cropperRef.current]);
  const rotateRight = useCallback(() => {
    if (cropperRef?.current?.cropper) {
      cropperRef.current.cropper.rotate(90);
    }
  }, [cropperRef.current]);
  return (
    <>
      <Upload
        beforeUpload={beforeUpload}
        className={className}
        multiple={false}
        maxCount={1}
        showUploadList={showUploadList}
        fileList={fileList || []}
        onPreview={onPreview}
        onRemove={onRemove}
        onDownload={onDownload}
      >
        {children}
      </Upload>
      {uploadProgress > 0 && <Progress percent={uploadProgress} />}
      {canCrop && image && (
        <AppModal
          title="Crop Image"
          closeIcon={<AppModal.CloseIcon onClose={handleCancel} />}
          footer={
            <AppModal.Footer
              onOk={handleOk}
              onCancel={handleCancel}
              loading={uploading}
              okDisabled={uploading}
              cancelDisabled={uploading}
            />
          }
          isOpen={modal === "crop"}
        >
          <div>
            <Cropper
              src={image}
              style={{ height: 400, width: "100%" }}
              viewMode={1}
              ref={cropperRef}
              guides={true}
              cropBoxResizable={true}
              zoomable={true}
              background={false}
              minCropBoxWidth={100}
              minCropBoxHeight={50}
              crop={handleCrop}
            />
           <div className="flex justify-between mt-4">
           <button onClick={rotateLeft} title="Rotate left"><span className="icon md left-arrow-icon cursor-pointer"></span></button>
           <button onClick={rotateRight} title="Rotate right"><span className="icon md right-arrow-icon cursor-pointer"></span></button>
           </div>
          </div>
        </AppModal>
      )}
      {fileList?.[0]?.url && (
        <AppModal
          isOpen={modal == "preview"}
          destroyOnClose={true}
          title={
            <h1 className="text-2xl text-titleColor font-semibold">Preview</h1>
          }
          footer={null}
          onClose={onPreviewClose}
          closeIcon={<AppModal.CloseIcon onClose={onPreviewClose} />}
        >
          <div className={`text-center flex justify-center w-full h-fit mt-12`}>
            <img alt="Preview" src={fileList?.[0]?.url || ""} />
          </div>
          <AppModal.Footer
            onCancel={onPreviewClose}
            cancelText="Close"
            showOk={false}
          />
        </AppModal>
      )}
    </>
  );
};

export default memo(AppUpload);
