import React, { useCallback } from 'react';
import { Form, Select } from 'antd';
 
const DocumentTypeSelect = ({ name, label, documentTypeLu,handleChange,value="name"}) => {
  const onDropdownChange = useCallback(()=>{
    handleChange(name)
  },[name])
 
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required: true, message: "Is required" }]}
      className="custom-select-float"
    >
      <Select className="" placeholder="Select Document Type"onChange={onDropdownChange}>
        {documentTypeLu?.map((item) => (
          <Select.Option key={item.code} value={item[value]}   >
 
            {item.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};
 
export default DocumentTypeSelect;