import React, { useCallback, useState } from 'react';
import FileUpload from '../../../shared/file.upload';
import { Form, Input, Select } from 'antd';
import { documentNumberRegex, validations } from '../../../shared/validations';
import AppDatePicker from '../../../shared/appDatePicker';
import moment from 'moment';

const DocumentUploadForm = ({ documentTypeLu, fileLists, previewImages, handleUploadChange, removeImage, handleChange, handleFieldChange }) => {
  const isFileUploaded = fileLists?.frontImage?.length > 0 || fileLists?.backImage?.length > 0;
  const [selectedDocType, setSelectedDocType] = useState(null);

   const onFieldChange = useCallback(
    (fieldName) => (e) => {
      let value = (fieldName === "idIssuingCountry" || fieldName === "type") ? e : e?.target?.value;
      if (fieldName === "docExpiryDate") {
        value = e ? moment(e, "DD/MM/YYYY") : null;
        if (value) value = moment(value, "DD/MM/YYYY", true);
        handleFieldChange(fieldName)(value);
      } else if (fieldName === "type") {
        setSelectedDocType(value);
         handleChange(e);
      } else {
        handleFieldChange(fieldName)(value);
      }
    },
    [selectedDocType, handleChange, handleFieldChange]
  );
  return (
    <div
      className={`mt-6 w-full`}
    >
      <h3 className="text-lightWhite text-large font-semibold mb-4 mt-3">
        Upload the documents
      </h3>
      <div
        className={`grid grid-cols-1 gap-4`}
      >
        <Form.Item
          label="Document Type"
          name="type"
          className="custom-select-float mb-0"
          colon={false}
          rules={[
            { required: true, message: 'Is required' }
          ]}
        >
          <Select className="" placeholder="Select Document Type" onChange={onFieldChange("type")} allowClear>
            {documentTypeLu?.map((item) => (
              <Select.Option key={item.code} value={item.name}   >
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          className="custom-select-float"
          name="docId"
          label={'Document Number'}
          colon={false}
          rules={[
            { required: true, message: "is required" },
            { whitespace: true, message: "Invalid Document Number" }, 
            validations.regexValidator(
              "document number",
              documentNumberRegex
            ), 
          ]}
        >
          <Input
            className="custom-input-field outline-0 uppercase placeholder:capitalize"
            placeholder={'Enter Document Number'}
            type="input"
            maxLength={30}
            onChange={onFieldChange("docId")}
          />
        </Form.Item>
      </div>
      <div  className={`grid grid-cols-1 gap-4`}>
        <Form.Item
          className="custom-select-float"
          name="docExpiryDate"
          label={'Document Expiry Date (Expiry must be in the future)'}
          required
          rules={[{ required: (selectedDocType ==='Passport' || selectedDocType === 'Driver License' ), message: "is required" }]}
          colon={false}
        >
          <AppDatePicker
            className="custom-input-field outline-0"
            datesToDisable="pastAndCurrentDates"
            onChange={onFieldChange("docExpiryDate")}
          />
        </Form.Item>
        <Form.Item
          name="frontImage"
          className={`payees-input required-reverse mb-0`}
          // rules={[
          //   ({ getFieldValue }) => ({
          //     validator(_, value) {
          //       if (!getFieldValue("type")) {
          //         return Promise.resolve();
          //       }
          //       if (!value) {
          //         return Promise.reject(new Error("Is required"));
          //       }
          //       return Promise.resolve();
          //     },
          //   }),
          // ]}
            rules={[
           { required: true, message: "is required" },
          ]}
        >
          <div className="flex items-center justify-between mb-2 viewsmaple-image">
            <p className="ant-form-item-required text-labelGrey text-sm font-medium">
              Front ID Photo{" "}<span className='text-textLightRed ml-0.5'>*</span>
            </p>
          </div>
          <FileUpload
            name="frontImage"
            fileList={fileLists?.frontImage}
            previewImage={previewImages?.frontImage}
            handleUploadChange={handleUploadChange}
            handleRemoveImage={removeImage}
          />
        </Form.Item>
        <Form.Item
          name="backImage"
          className={`payees-input required-reverse mb-0`}
          rules={[
           { required: true, message: "is required" },
          ]}
        >
          <div className="flex items-center justify-between mb-2 viewsmaple-image">
            <p className="ant-form-item-required text-labelGrey text-sm font-medium">
              Back ID Photo{" "}<span className='text-textLightRed ml-0.5'>*</span>
            </p>
          </div>
          <FileUpload
            name="backImage"
            fileList={fileLists?.backImage}
            previewImage={previewImages?.backImage}
            handleUploadChange={handleUploadChange}
            handleRemoveImage={removeImage}
          />
        </Form.Item>

      </div>
    </div>
  );
};

export default DocumentUploadForm;
