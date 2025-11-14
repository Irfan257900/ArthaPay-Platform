import React, { useCallback } from 'react';
import DocumentTypeSelect from './document.type';
import FileUpload from '../../shared/file.upload';
import { Form } from 'antd';
 
const DocumentUploadForm = ({ props, documentTypeLu, fileLists, previewImages, handleUploadChange, removeImage, uploadDataList }) => {
  const handleChange = useCallback((name) => {
    if (name === "firstDocumentType" && fileLists.firstDocument?.length > 0) {
      removeImage("firstDocument");
    } else if (name === "secondDocumentType" && fileLists.secondDocument?.length > 0) {
      removeImage("secondDocument");
    } else if (name === "thirdDocumentType" && fileLists.thirdDocument?.length > 0) {
      removeImage("thirdDocument");
    } else if (name === "fourthDocumentType" && fileLists.fourthDocument?.length > 0) {
      removeImage("fourthDocument");
    } else if (name === "fifthDocumentType" && fileLists.fifthDocument?.length > 0) {
      removeImage("fifthDocument");
    }
  }, [fileLists, removeImage]);
 
  return (
    <div
      className={`mt-6 w-full ${(!props?.hideWizard && "px-5 py-5") || ""}`}
    >
      <h3 className="text-lightWhite text-large font-semibold mb-4 mt-3">
        Upload the following:
      </h3>
      {!props?.hideWizard && (
        <ul className="pl-4 mb-8 list-disc">
          {uploadDataList?.map((item) => (
            <li key={item?.id} className="mb-3 text-sm font-normal text-labelGrey">
              {item?.list}
            </li>
          ))}
        </ul>
      )}
 
      <div
        className={`grid grid-cols-1 gap-6 ${(!props?.hideWizard && "lg:grid-cols-2 md:grid-cols-2 xl:grid-cols-2") || ""}`}
      >
        <div>
          <DocumentTypeSelect
            name="firstDocumentType"
            label="Choose document type"
            documentTypeLu={documentTypeLu}
            handleChange={handleChange}
            value="code"
          />
          <Form.Item
            name="firstDocument"
            className={`payees-input required-reverse ${(!props?.hideWizard && "!mb-4") || "mb-0"}`}
            rules={[{ required: true, message: "Is required" }]}
          >
            <div className="flex items-center justify-between mb-2 viewsmaple-image">
              <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                Upload Document{" "}
                <span className="text-requiredRed">*</span>
              </p>
            </div>
            <FileUpload
              name="firstDocument"
              fileList={fileLists?.firstDocument}
              previewImage={previewImages?.firstDocument}
              handleUploadChange={handleUploadChange}
              handleRemoveImage={removeImage}
            />
          </Form.Item>
        </div>
        <div>
          <DocumentTypeSelect
            name="secondDocumentType"
            label="Choose document type"
            documentTypeLu={documentTypeLu}
            handleChange={handleChange}
            value="code"
          />
          <Form.Item
            name="secondDocument"
            className={`payees-input required-reverse ${(!props?.hideWizard && "!mb-4") || "mb-0"}`}
            rules={[{ required: true, message: "Is required" }]}
          >
            <div className="flex items-center justify-between mb-2 viewsmaple-image">
              <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                Upload Document{" "}
                <span className="text-requiredRed">*</span>
              </p>
            </div>
            <FileUpload
              name="secondDocument"
              fileList={fileLists?.secondDocument}
              previewImage={previewImages.secondDocument}
              handleUploadChange={handleUploadChange}
              handleRemoveImage={removeImage}
            />
          </Form.Item>
        </div>
        <div>
          <DocumentTypeSelect
            name="thirdDocumentType"
            label="Choose document type"
            documentTypeLu={documentTypeLu}
            handleChange={handleChange}
            value="code"
          />
          <Form.Item
            name="thirdDocument"
            className={`payees-input required-reverse ${(!props?.hideWizard && "!mb-4") || "mb-0"}`}
            rules={[{ required: true, message: "Is required" }]}
          >
            <div className="flex items-center justify-between mb-2 viewsmaple-image">
              <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                Upload Document{" "}
                <span className="text-requiredRed">*</span>
              </p>
            </div>
            <FileUpload
              name="thirdDocument"
              fileList={fileLists?.thirdDocument}
              previewImage={previewImages.thirdDocument}
              handleUploadChange={handleUploadChange}
              handleRemoveImage={removeImage}
            />
          </Form.Item>
        </div>
        <div>
          <DocumentTypeSelect
            name="fourthDocumentType"
            label="Choose document type"
            documentTypeLu={documentTypeLu}
            handleChange={handleChange}
            value="code"
          />
          <Form.Item
            name="fourthDocument"
            className={`payees-input required-reverse ${(!props?.hideWizard && "!mb-4") || "mb-0"}`}
            rules={[{ required: true, message: "Is required" }]}
          >
            <div className="flex items-center justify-between mb-2 viewsmaple-image">
              <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                Upload Document{" "}
                <span className="text-requiredRed">*</span>
              </p>
            </div>
            <FileUpload
              name="fourthDocument"
              fileList={fileLists?.fourthDocument}
              previewImage={previewImages.fourthDocument}
              handleUploadChange={handleUploadChange}
              handleRemoveImage={removeImage}
            />
          </Form.Item>
        </div>
        <div>
          <DocumentTypeSelect
            name="fifthDocumentType"
            label="Choose document type"
            documentTypeLu={documentTypeLu}
            handleChange={handleChange}
            value="code"
          />
          <Form.Item
            name="fifthDocument"
            className={`payees-input required-reverse ${(!props?.hideWizard && "!mb-4") || "mb-0"}`}
            rules={[{ required: true, message: "Is required" }]}
          >
            <div className="flex items-center justify-between mb-2 viewsmaple-image">
              <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                Upload Document{" "}
                <span className="text-requiredRed">*</span>
              </p>
            </div>
            <FileUpload
              name="fifthDocument"
              fileList={fileLists?.fifthDocument}
              previewImage={previewImages.fifthDocument}
              handleUploadChange={handleUploadChange}
              handleRemoveImage={removeImage}
            />
          </Form.Item>
        </div>
      </div>
    </div>
  );
};
 
export default DocumentUploadForm;