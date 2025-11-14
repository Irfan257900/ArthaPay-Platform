// src/components/UBODrawerForm.jsx
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Radio } from 'antd';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { NumericFormat } from 'react-number-format';
import CustomButton from '../../../core/button/button';
import AppDatePicker from '../../../core/shared/appDatePicker';
import PhoneCodeDropdown from '../../../core/shared/phCodeDropdown';
import AppSelect from '../../../core/shared/appSelect';
import AppAlert from '../../../core/shared/appAlert';
import DocumentUploadForm from '../../../core/onboarding/kyb/ubo/document.details';
import { numberValidateContentRules, phoneNoRegex, replaceExtraSpaces, validateDOB, validateEmail, validations } from '../../../core/shared/validations';
import { decryptAES, encryptAES } from '../../../core/shared/encrypt.decrypt';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, checkFileName, checkFileSize, checkValidExtension, fileValidations, updateFileList } from '../../../core/shared/fileUploadVerifications';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookups } from '../../../reducers/kyb.reducer';
import CompanyDataloader from '../../../core/skeleton/kyb.loaders/companydata.loader';
import { fetchBeneficiaries, fetchUboDetails, resetState } from '../../../reducers/banks.reducer';
import AppDefaults from '../../../utils/app.config';

const { TextArea } = Input;

const UBODrawerForm = ({ onSave, onCancel, initialItemData, drawerVisible, existingItems }) => {
    const [form] = Form.useForm();
    const useDivRef = React.useRef(null);
    const dispatch = useDispatch();

    const [selectedPosition, setSelectedPosition] = useState('Ubo');
    const [error, setError] = useState(null);

    const { loading: beneficiariesLoading, data: beneficiariesLu, error: beneficiariesError } = useSelector(state => state.banks.beneficiaries);
    const { loading: uboDetailsLoading, data: uboDetails, error: uboError } = useSelector(state => state.banks.uboDetails);
    const { data: lookups } = useSelector(state => state.kybStore.lookups)
    const overallLoading = beneficiariesLoading || uboDetailsLoading;

    useEffect(() => {
        setSelectedPosition(initialItemData?.uboPosition || 'Ubo');
        dispatch(fetchLookups());
        dispatch(fetchBeneficiaries(initialItemData?.uboPosition || 'Ubo'));
    }, [dispatch, initialItemData?.uboPosition]);

    const [fileLists, setFileLists] = useState({
        frontImage: [],
        backImage: [],
    });
    const [previewImages, setPreviewImages] = useState({
        frontImage: "",
        backImage: "",
    });
    const [pdfPreview, setPdfPreview] = useState({
        frontImage: null,
        backImage: null,
    });
    const getFileNameFromUrl = (url) => {
        const parsedUrl = new URL(url);
        return parsedUrl.pathname.split("/").pop();
    };

    const createFileList = (url, fileName) => [
        {
            name: fileName,
            status: 'done',
            url: url,
        },
    ];
    const getFormattedDob = (dob) => {
        if (!dob) return null;
        // Handle both ISO format (2000-08-11T00:00:00) and date string
        const dateStr = typeof dob === 'string' ? dob.split('T')[0] : dob;
        return moment(dateStr).isValid() ? moment(dateStr) : null;
    };

    const handleScrollTop = useCallback(() => {
        if (useDivRef.current) {
            useDivRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    const handleDocumentChange = useCallback(() => {
        form.setFieldsValue({
            type: null,
            frontImage: null,
            backImage: null,
            docId: null,
            docExpiryDate: null,
            idIssuingCountry: null,
        });
        setFileLists({ frontImage: [], backImage: [] });
        setPreviewImages({ frontImage: "", backImage: "" });
        setPdfPreview({ frontImage: null, backImage: null });
    }, [form]);

    const clearPersonalDetails = useCallback(() => {
        form.resetFields();
        handleDocumentChange();
        form.setFieldsValue({ uboPosition: selectedPosition });
        dispatch(resetState(["uboDetails", "beneficiaries"]));
        dispatch(fetchBeneficiaries(selectedPosition));
    }, [form, handleDocumentChange, selectedPosition, dispatch]);

    const closeDrawer = useCallback(() => {
        form.resetFields();
        setSelectedPosition('Ubo');
        handleDocumentChange();
        setFileLists({ frontImage: [], backImage: [] });
        setPreviewImages({ frontImage: "", backImage: "" });
        setPdfPreview({ frontImage: null, backImage: null });
        dispatch(resetState(["uboDetails", "beneficiaries"]));
        onCancel();
    }, [form, onCancel, dispatch, handleDocumentChange]);

    useEffect(() => {
        if (beneficiariesError || uboError) {
            setError(beneficiariesError || uboError)
            handleScrollTop();
        }
    }, [beneficiariesError, uboError, handleScrollTop]);

    useEffect(() => {
        if (drawerVisible) {
            if (initialItemData) {
                const formattedDob = getFormattedDob(initialItemData.dob);
                const docDetails = initialItemData.docDetails || {};
                const expiryDate= getFormattedDob(docDetails.expiryDate)
                const { frontImage, backImage } = docDetails;
                const fieldsToSet = {
                    ...initialItemData,
                    phoneCode: decryptAES(initialItemData?.phoneCode) || '',
                    phoneNumber: decryptAES(initialItemData?.phoneNumber) ? decryptAES(initialItemData.phoneNumber).replace(initialItemData.phoneCode, '') : '',
                    email: decryptAES(initialItemData?.email) || '',
                    dob: formattedDob,
                    type: docDetails.type,
                    frontImage,
                    backImage,
                    docId: decryptAES(docDetails.number) || docDetails.docId || '',
                    docExpiryDate:expiryDate,
                    idIssuingCountry: docDetails.idIssuingCountry,
                };
                form.setFieldsValue(fieldsToSet);
                setSelectedPosition(initialItemData.uboPosition || 'Ubo');

                const frontDocName = frontImage ? getFileNameFromUrl(frontImage) : '';
                const backDocImageName = backImage ? getFileNameFromUrl(backImage) : '';

                setFileLists({
                    frontImage: frontImage ? createFileList(frontImage, frontDocName) : [],
                    backImage: backImage ? createFileList(backImage, backDocImageName) : [],
                });

                setPreviewImages({
                    frontImage,
                    backImage,
                });
                dispatch(fetchBeneficiaries(initialItemData.uboPosition || 'Ubo'));
            } else {
                form.resetFields();
                setSelectedPosition('Ubo');
                dispatch(fetchBeneficiaries('Ubo'));
                handleDocumentChange();
            }
        }
    }, [initialItemData, drawerVisible, form, dispatch, handleDocumentChange]);

   useEffect(() => {
        if (uboDetails) {
            const formattedDob = getFormattedDob(uboDetails.dob);
            const docDetails = uboDetails.docDetails || {};
            const expiryDate = getFormattedDob(docDetails.expiryDate);

            const fieldsToSetFromUbo = {
                firstName: uboDetails.firstName ? decryptAES(uboDetails.firstName) : undefined,
                lastName: uboDetails.lastName ? decryptAES(uboDetails.lastName) : undefined,
                middleName: uboDetails.middleName,
                email: uboDetails.email ? decryptAES(uboDetails.email) : undefined,
                shareHolderPercentage: uboDetails.shareHolderPercentage,
                dob: formattedDob,
                phoneCode: uboDetails.phoneCode ? decryptAES(uboDetails.phoneCode) : undefined,
                phoneNumber: uboDetails.phoneNumber ? decryptAES(uboDetails.phoneNumber) : undefined,
                country: uboDetails.country,
                note: uboDetails.note,
                type: docDetails.type,
                frontImage: docDetails.frontImage,
                backImage: docDetails.backImage,
                docId: docDetails.number ? decryptAES(docDetails.number) : undefined, 
                docExpiryDate: expiryDate,
                idIssuingCountry: docDetails.idIssuingCountry,
            };
            form.setFieldsValue(fieldsToSetFromUbo);

            const frontDocName = docDetails.frontImage ? getFileNameFromUrl(docDetails.frontImage) : '';
            const backDocImageName = docDetails.backImage ? getFileNameFromUrl(docDetails.backImage) : '';

            setFileLists({
                frontImage: docDetails.frontImage ? createFileList(docDetails.frontImage, frontDocName) : [],
                backImage: docDetails.backImage ? createFileList(docDetails.backImage, backDocImageName) : [],
            });

            setPreviewImages({
                frontImage: docDetails.frontImage,
                backImage: docDetails.backImage,
            });
        }
    }, [uboDetails, form]);

    const handleChangePosition = useCallback((e) => {
        const newPosition = e.target.value;
        setSelectedPosition(newPosition);
        form.resetFields(); // Reset all fields
        handleDocumentChange(); // Clear document fields
        form.setFieldsValue({ uboPosition: newPosition }); // Set the new position
        dispatch(resetState(["uboDetails", "beneficiaries"]));
        dispatch(fetchBeneficiaries(newPosition));
        setError(null);
    }, [dispatch, form, handleDocumentChange]);

    const handlePhoneNumberInput = useCallback((e) => {
        if (e.target.value.length > 16) {
            e.target.value = e.target.value.slice(0, 16);
        }
    }, []);

    const handleUploadChange = useCallback((type, { fileList }) => {
        setError(null);

        const file = fileList[0]?.name || "";
        const fileExtension = file?.split(".").pop().toLowerCase();

        const isValidFileExtension = checkValidExtension(fileExtension, ALLOWED_EXTENSIONS);
        if (!isValidFileExtension) {
            setError(fileValidations.fileExtension);
            handleScrollTop();
            return;
        }
        const isFileSizeValid = checkFileSize(fileList[0]?.size, MAX_FILE_SIZE);
        if (!isFileSizeValid) {
            setError(fileValidations.fileSize);
            handleScrollTop();
            return;
        }
        const isValidFileName = checkFileName(fileList[0]?.name);
        if (!isValidFileName) {
            setError(fileValidations.fileName);
            handleScrollTop();
            return;
        }
        const updatedFileList = updateFileList(fileList, type);
        setFileLists((prevFileLists) => ({
            ...prevFileLists,
            [type]: updatedFileList,
        }));
        handleFilePreview(fileList, type);
    }, [handleScrollTop]);

    const handleFilePreview = (fileList, type) => {
        const latestFile = fileList[fileList.length - 1];
        if (latestFile?.status === "done") {
            if (latestFile.type?.startsWith("image/")) {
                const imageUrl = latestFile?.response?.[0] || URL.createObjectURL(latestFile?.originFileObj);
                form.setFieldsValue({ [type]: imageUrl });
                setPreviewImages((prevImages) => ({ ...prevImages, [type]: imageUrl }));
            } else if (latestFile.type === "application/pdf") {
                const pdfUrl = latestFile?.response?.[0] || URL.createObjectURL(latestFile?.originFileObj);
                setPdfPreview((prev) => ({ ...prev, [type]: pdfUrl }));
                form.setFieldsValue({ [type]: pdfUrl });
                setPreviewImages((prevImages) => ({ ...prevImages, [type]: pdfUrl }));
            }
        } else if (latestFile?.status === "error") {
            setError("Upload failed. Please try again.");
        }
    };

    const removeImage = useCallback((type) => {
        setFileLists((prevFileLists) => ({
            ...prevFileLists,
            [type]: [],
        }));
        form.setFieldsValue({ [type]: null });
        setPreviewImages((prevImages) => ({ ...prevImages, [type]: "" }));
        setPdfPreview((prev) => ({ ...prev, [type]: null }));
    }, [form]);

    const handleDocTypeChange = useCallback(() => {
        setFileLists({
            frontImage: [],
            backImage: [],
        });
        form.setFieldsValue({
            frontImage: null,
            backImage: null,
            docId: null,
            docExpiryDate: null,
        });
        setPreviewImages({
            frontImage: "",
            backImage: "",
        });
        setPdfPreview({
            frontImage: null,
            backImage: null,
        });
    }, [form]);

    const handleInputBlur = useCallback((e) => {
        const { name, value } = e.target;
        form.setFieldValue(name, replaceExtraSpaces(value));
    }, [form]);

    const handleBeneficiarySelect = useCallback(async (value) => {
        setError(null);
        form.resetFields(); // Clear all fields
        form.setFieldsValue({ uboPosition: selectedPosition }); // Set the current position
        dispatch(resetState(["uboDetails"]));
        form.setFieldValue("beneficiaries", value);
        const selected = beneficiariesLu.find(
            item => item.name?.trim().toLowerCase() === value?.trim().toLowerCase()
        );
        if (selected) {
            dispatch(fetchUboDetails(selected.id));
        }
    }, [dispatch, beneficiariesLu, form, selectedPosition]);

    const handleFieldChange = useCallback(
        (fieldName) => (e) => {
            const value = e?.target ? e.target.value : e;
            form.setFieldValue(fieldName, value);
        },
        [form]
    );

    const onFinish = useCallback(async (values) => {
        setError(null);
        const isEditing = !!initialItemData?.id;
        const currentItemId = initialItemData?.id;

           if (!isEditing || (isEditing && values.uboPosition !== initialItemData.uboPosition)) {
            const isDuplicate = existingItems.some(item =>
                item.uboPosition === values.uboPosition &&
                item.recordStatus !== 'Deleted' &&
                (!isEditing || item.id !== currentItemId)
            );

            if (isDuplicate) {
                setError(`${values.uboPosition} already exists. and multiple entries are not allowed.`);
                handleScrollTop();
                return;
            }
        }

        const savedItem = {
            id: initialItemData?.id || uuidv4(),
            uboPosition: values.uboPosition,
            firstName: values.firstName,
            lastName: values.lastName,
            middleName: values.middleName,
            dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
            phoneCode: encryptAES(values.phoneCode),
            phoneNumber: encryptAES(values.phoneNumber),
            email: encryptAES(values.email),
            country: values.country,
            shareHolderPercentage: values.shareHolderPercentage,
            positionWithCompany: values.positionWithCompany,
            note: values.note,
             recordStatus: isEditing ? 'Modified' : 'Added',
            beneficiaries: values.beneficiaries,
            docDetails: {
                id: values.id || '00000000-0000-0000-0000-000000000000',
                frontImage: values.frontImage,
                backImage: values.backImage,
                type: values.type,
                idIssuingCountry: values.idIssuingCountry,
                number: encryptAES(values.docId),
                expiryDate: values.docExpiryDate ? values.docExpiryDate.format("YYYY-MM-DD") : null,
            }
        };



        onSave(savedItem);
        form.resetFields();
    }, [initialItemData, onSave, form, existingItems, handleScrollTop]);

    const clearErrors = useCallback(() => {
        setError(null);
    }, []);

    const handleDocumentFieldChange = useCallback((selectedType) => {
        const docDetails = initialItemData?.docDetails || {};

        if (docDetails.type === selectedType) {
            const frontdocName = docDetails.frontImage ? getFileNameFromUrl(docDetails.frontImage) : '';
            const backdocImageName = docDetails.backImage ? getFileNameFromUrl(docDetails.backImage) : '';

            setFileLists({
                frontImage: docDetails.frontImage ? createFileList(docDetails.frontImage, frontdocName) : [],
                backImage: docDetails.backImage ? createFileList(docDetails.backImage, backdocImageName) : [],
            });
            setPreviewImages({
                frontImage: docDetails.frontImage,
                backImage: docDetails.backImage,
            });
            setPdfPreview((prev) => ({
                ...prev,
                frontImage: docDetails.frontImage,
                backImage: docDetails.backImage,
            }));

            form.setFieldsValue({
                docExpiryDate: docDetails.docExpiryDate ? moment(docDetails.docExpiryDate, "YYYY-MM-DD") : null,
                docId: docDetails.number || "",
                frontImage: docDetails.frontImage || null,
                backImage: docDetails.backImage || null,
            });
        } else {
            handleDocTypeChange();
        }
    }, [form, initialItemData, getFileNameFromUrl, createFileList, handleDocTypeChange]);

    return (
        <div>
            <div ref={useDivRef}></div>
            {overallLoading && <CompanyDataloader />}
            {!overallLoading && <>
                {error !== null && (
                    <div className="alert-flex">
                        <AppAlert
                            type="error"
                            description={error}
                            onClose={clearErrors}
                            showIcon
                            className='items-center'
                        />
                        <button className="icon sm alert-close" onClick={clearErrors}></button>
                    </div>
                )}
                <h4 className='text-left text-lightWhite text-sm font-semibold'>
                    Choose the UBO / Director
                </h4>
                <Form form={form} onFinish={onFinish}
                    scrollToFirstError={{
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center',
                    }}>
                    <div className='basicinfo-radioform'>
                        <Form.Item
                            name="uboPosition"
                            rules={[{ required: true, message: 'Is required' }]}
                            initialValue={selectedPosition}
                        >
                            <div className="flex items-center gap-[10px]">
                                {['Ubo', 'Director'].map((position) => {
                                    const isEdit = !!initialItemData?.id;
                                    const isTaken = existingItems.some(
                                        (item) =>
                                            item.uboPosition === position &&
                                            item.id !== initialItemData?.id &&
                                            item.recordStatus !== 'Deleted'
                                    );
                                    const isDisabled = isEdit ? position !== selectedPosition : isTaken;
                                    return (
                                        <div key={position} className="flex items-center gap-[10px]">
                                            <Radio
                                                value={position}
                                                checked={selectedPosition === position}
                                                onChange={handleChangePosition}
                                                disabled={isDisabled}
                                                className={`text-sm font-normal ${selectedPosition === position && "text-lightWhite" || "text-descriptionGreyTwo"}`}
                                            >
                                                {position}
                                            </Radio>
                                        </div>
                                    );
                                })}
                            </div>
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-6 basicinfo-form mt-4">
                        <Form.Item
                            name="beneficiaries"
                            label="Beneficiaries"
                            className="mb-0 custom-select-float"
                            colon={false}
                        >
                            <AppSelect
                                showSearch
                                name="beneficiaries"
                                onSelect={handleBeneficiarySelect}
                                placeholder="Select Beneficiaries"
                                className=""
                                maxLength={30}
                                options={beneficiariesLu || []}
                                fieldNames={{ label: "name", value: "name" }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="First Name"
                            name="firstName"
                            rules={[validations.requiredValidator(), validations.whitespaceValidator('first name'), validations.textValidator('first name')]}
                            className='mb-0'
                        >
                            <Input name='firstName' placeholder='Enter First Name' maxLength={50} className='bg-transparent border-[1px] !border-inputBg text-lightWhite p-2 rounded outline-0' onBlur={handleInputBlur} />
                        </Form.Item>

                        <Form.Item
                            label="Middle Name"
                            colon={false}
                            name="middleName"
                            rules={[validations.textValidator('middle name'), { whitespace: true, message: 'Invalid Middle Name ' }]}
                            className='mb-0'
                        >
                            <Input name="middleName" onBlur={handleInputBlur} placeholder='Enter Middle Name' maxLength={50} className='bg-transparent border-[1px] border-inputBg text-lightWhite p-2 rounded outline-0' />
                        </Form.Item>

                        <Form.Item
                            label="Last Name"
                            name="lastName"
                            rules={[validations.requiredValidator(), validations.whitespaceValidator('last name'), validations.textValidator('last name')]}
                            className='mb-0'
                        >
                            <Input name="lastName" onBlur={handleInputBlur} placeholder='Enter Last Name' maxLength={50} className='bg-transparent border-[1px] border-inputBg text-lightWhite p-2 rounded outline-0' />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Is required' }, { whitespace: true, message: 'Invalid Email' }, { validator: validateEmail }]}
                            className='mb-0'
                        >
                            <Input name="email" onBlur={handleInputBlur} type="email" maxLength={100} placeholder='Enter mail' className='bg-transparent border-[1px] border-inputBg text-lightWhite p-2 rounded outline-0' />
                        </Form.Item>
                        <Form.Item
                            label="Shareholder Percentage"
                            name="shareHolderPercentage"
                            rules={[validations.requiredValidator(),
                            {
                                validator: (_, value) => {
                                    if (value && /^\s*$/.test(value)) {
                                        return Promise.reject(new Error('Invalid input'));
                                    }
                                    return Promise.resolve();
                                }
                            },
                            { validator: numberValidateContentRules }]}
                            className='mb-0'
                        >
                            <NumericFormat
                                name={'shareHolderPercentage'}
                                decimalScale={AppDefaults.fiatDecimals}
                                customInput={Input}
                                className="bg-transparent border-[1px] border-inputBg p-2 rounded outline-0 w-full text-lightWhite"
                                thousandSeparator={false}
                                allowNegative={false}
                                placeholder='Enter Percentage'
                            />
                        </Form.Item>
                        <Form.Item
                            label="Date Of Birth"
                            name="dob"
                            rules={[{ required: true, message: 'Is required' }, { validator: validateDOB }]}
                            className='mb-0'
                        >
                            <AppDatePicker
                                datesToDisable='futureAndCurrentDates'
                                className="bg-transparent border-[1px] border-inputBg p-2 rounded outline-0 w-full text-lightWhite"
                            />
                        </Form.Item>

                        <Form.Item
                            name="country"
                            label="Country"
                            rules={[{ required: true, message: "Is required" }]}
                            className="mb-0 custom-select-float"
                            colon={false}
                        >
                            <AppSelect
                                showSearch
                                name="country"
                                onSelect={handleFieldChange("country")}
                                placeholder="Select Country"
                                className=""
                                maxLength={30}
                                options={lookups?.countries || []}
                                fieldNames={{ label: "name", value: "name" }}
                            />
                        </Form.Item>

                        <div className='flex country-form-item relative select-hover'>
                            <div className="custom-input-lablel">
                                Phone number <span className="text-requiredRed">*</span>
                            </div>
                            <Form.Item
                                name="phoneCode"
                                className='mb-0 outline-none'
                                colon={false}
                                rules={[{ required: true, message: 'Is required' }, { whitespace: true, message: 'Invalid phoneCode' }]}
                            >
                                <PhoneCodeDropdown className={"!w-40"} onChange={handleFieldChange("phoneCode")} shouldUsePropsList={true} codes={lookups?.phoneCodes || []} />
                            </Form.Item>
                            <Form.Item
                                name="phoneNumber"
                                className='mb-0 w-full custom-input-ubo'
                                colon={false}
                                required
                                rules={[validations.requiredValidator(),
                                validations.whitespaceValidator('phone number'),
                                validations.regexValidator("phone number", phoneNoRegex, false)]}
                            >
                                <Input placeholder='Enter Phone Number'
                                    // type="number"
                                    onKeyDown={(e) => {
                                        if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
                                            e.preventDefault();
                                        }
                                    }}
                                    onInput={handlePhoneNumberInput}
                                    className='custom-input-field p-2 h-[52px]'
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="note"
                            className='mb-0 w-full basicinfo-form'
                            label="Note"
                            rules={[{ whitespace: true, message: 'Invalid Note' }]}
                            colon={false}
                        >
                            <TextArea name='note' onBlur={handleInputBlur} rows={4} maxLength={250} placeholder="Type your note..." className='bg-transparent border border-inputBg text-lightWhite p-2 outline-0 rounded-5 h-36' />
                        </Form.Item>

                    </div>
                    <DocumentUploadForm
                        documentTypeLu={lookups?.kycDocTypes}
                        fileLists={fileLists}
                        previewImages={previewImages || pdfPreview}
                        handleUploadChange={handleUploadChange}
                        removeImage={removeImage}
                        handleChange={handleDocumentFieldChange}
                        handleFieldChange={handleFieldChange}
                    />

                    <div className='mt-6 text-right'>
                        <CustomButton htmlType="reset" onClick={closeDrawer}>Close</CustomButton>
                        <CustomButton type='primary' className={"md:ml-3.5"} htmlType="submit">Save</CustomButton>
                    </div>
                </Form>
            </>}
        </div>
    );
};

UBODrawerForm.propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    initialItemData: PropTypes.object,
    drawerVisible: PropTypes.bool.isRequired,
    existingItems: PropTypes.array.isRequired,
};

export default UBODrawerForm;