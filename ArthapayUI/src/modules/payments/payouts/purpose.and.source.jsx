// src/components/ResourceFormFields.jsx (Your purpose.and.source.jsx file)

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Form, Input, Select, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import FormInput from '../../../core/shared/formInput';
import { appClientMethods } from '../httpClients';
import SingleBarLoader from '../../../core/skeleton/bar.loader';
// Assuming validation utilities are located here:
import { validations } from '../../../core/shared/validations'; 
import { setSelectedPurpose, setSelectedSource } from '../reducers/payout.reducer'; 

// Extract necessary validation functions and define regex
const { regexValidator } = validations; 
const { Option } = Select;

// Define a regex that disallows most common special characters. 
// Allows letters (a-z, A-Z), numbers (0-9), and spaces.
const noSpecialCharsRegex = /^[a-zA-Z0-9\s]*$/;

const ResourceFormFields = ({ form, formInstance, payee, selectedCoin }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const resourceDataFromStore = useSelector(state => state.payoutAccordianReducer.resourceData);
    const resourceData = resourceDataFromStore; 

    const { fiatCurrency } = form?.getFieldsValue(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dropdownOptions, setDropdownOptions] = useState({});
    const [selectedValues, setSelectedValues] = useState({});
    
    const fieldsToReset = useMemo(() => {
        return resourceData?.map(field => field.key) || [];
    }, [resourceData]);

    const fetchDropdownOptions = useCallback(async (urlKey, apiUrl) => {
        setLoading(true);
        setError(null);
        try {
            const response = await appClientMethods.get(`${apiUrl}?id=${payee?.id}`);
            const data = response?.data?.data || [];
            setDropdownOptions(prev => ({ ...prev, [urlKey]: data }));
        } catch (err) {
            console.error(`Failed to load options for ${urlKey}:`, err);
            setError(`Failed to load options for ${urlKey}.`);
        } finally {
            setLoading(false);
        }
    }, [payee]);
    
    useEffect(() => {
        if (fieldsToReset.length > 0) {
            form.resetFields(fieldsToReset);
            
            setSelectedValues(prev => {
                const newValues = { ...prev };
                fieldsToReset.forEach(fieldKey => {
                    delete newValues[fieldKey];
                });
                return newValues;
            });
            setDropdownOptions({});
        }
    }, [payee?.id, fieldsToReset, form, fiatCurrency]);

    useEffect(() => {
        if (resourceData && resourceData?.length > 0 && payee?.id) {
            resourceData.forEach(field => {
                if (field.fieldType === 'dropdown' && field.url) {
                    fetchDropdownOptions(field.key, field.url);
                }
            });
        }
    }, [resourceData, fetchDropdownOptions, payee]);

    const handleSelectChange = useCallback((value, fieldKey, allOptions) => {
        const selectedObject = allOptions.find(option => (
            option.purposeCode === value || option.sourceOfIncomeCode === value
        ));

        if (selectedObject) {
            if (fieldKey === 'purpose') {
                dispatch(setSelectedPurpose(selectedObject));
            } else if (fieldKey === 'SourceOfFunds') {
                dispatch(setSelectedSource(selectedObject));
            }
            setSelectedValues(prev => ({ ...prev, [fieldKey]: selectedObject }));
        } else {
            setSelectedValues(prev => {
                const newValues = { ...prev };
                delete newValues[fieldKey];
                return newValues;
            });
        }
    }, [dispatch]);
    
    if (loading) {
        return <SingleBarLoader />;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon className="my-4" />;
    }

    return (
        <>
            {resourceData && resourceData.map((field) => { 
                const options = dropdownOptions[field.key];

                // 1. --- BUILD DYNAMIC RULES ARRAY (Combining all rules) ---
                const rules = [];

                // Add required validation if mandatory
                if (field.isMandatory === 'true') {
                    rules.push({ required: true, message: `Is required` });
                }

                // Add special character validation for input/text fields
                if (field.fieldType !== 'dropdown') {
                    // This is where your second validation rule is added
                    rules.push(
                        regexValidator(
                            `${field.label}`, 
                            noSpecialCharsRegex, 
                            false
                        )
                    );
                }
                
                return (
                    <div key={field.key} className="mt-6">
                        <FormInput label={field.label} isRequired={field.isMandatory === 'true'}>
                            {/* 2. --- Use a Single Form.Item to apply all combined rules --- */}
                            <Form.Item
                                className="mb-0 basicinfo-form panel-form-items-bg relative"
                                name={field.key}
                                // Apply the combined rules array here
                                rules={rules} 
                                colon={false}
                            >
                                {field.fieldType === 'dropdown' ? (
                                    <Select
                                        className=" "
                                        placeholder={`Select ${field.label}`}
                                        showSearch={true}
                                        onChange={(value) => {
                                            form.setFieldsValue({ [field.key]: value });
                                            handleSelectChange(value, field.key, options);
                                        }}
                                        value={form.getFieldValue(field.key)}
                                        loading={loading}
                                    >
                                        {options?.map(item => (
                                            <Option
                                                key={item.purposeCode || item.sourceOfIncomeCode}
                                                value={item.purposeCode || item.sourceOfIncomeCode}
                                            >
                                                {item.purpose || item.sourceOfIncome}
                                            </Option>
                                        ))}
                                    </Select>
                                ) : (
                                    <Input
                                        className="custom-input-field outline-0"
                                        placeholder={`Enter ${field.label}`}
                                        maxLength={200}
                                        type={field.fieldType === 'number' ? 'number' : 'text'}
                                    />
                                )}
                            </Form.Item>
                        </FormInput>
                    </div>
                )
            })}
        </>
    );
};

export default ResourceFormFields;