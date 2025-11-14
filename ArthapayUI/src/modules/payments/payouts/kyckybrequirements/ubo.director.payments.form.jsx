import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Radio, Tooltip } from 'antd'; // Added Tooltip
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { NumericFormat } from 'react-number-format';
import CustomButton from '../../../../core/button/button';
import AppDatePicker from '../../../../core/shared/appDatePicker';
import PhoneCodeDropdown from '../../../../core/shared/phCodeDropdown';
import AppSelect from '../../../../core/shared/appSelect';
import AppAlert from '../../../../core/shared/appAlert';
import { numberValidateContentRules, phoneNoRegex, replaceExtraSpaces, validateDOB, validateEmail, validations } from '../../../../core/shared/validations'
import { decryptAES, encryptAES } from '../../../../core/shared/encrypt.decrypt';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, checkFileName, checkFileSize, checkValidExtension, fileValidations, updateFileList } from '../../../../core/shared/fileUploadVerifications';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookups } from '../../../../reducers/kyb.reducer';
import CompanyDataloader from '../../../../core/skeleton/kyb.loaders/companydata.loader';
import { fetchBeneficiaries, fetchUboDetails, resetState } from '../../reducers/payout.reducer'
import AppDefaults from '../../../../utils/app.config';
import FileUpload from '../../../../core/shared/file.upload';
const { TextArea } = Input;

// Regex for document number validation (Placeholder, replace with actual regex)
const documentNumberRegex = /^[a-zA-Z0-9-]{1,30}$/; 
const isShowDirector = false; // Kept as per original code

// Helper functions (handlePreview, onDownload, hideWizard are missing, assuming dummy for now)
const handlePreview = () => console.log('Preview functionality here');
const onDownload = () => console.log('Download functionality here');
const hideWizard = false; // Placeholder

const UBODrawerForm = ({ onSave, onCancel, initialItemData, drawerVisible, existingItems }) => {
    const [form] = Form.useForm();
    const useDivRef = React.useRef(null);
    const dispatch = useDispatch();
    const { data } = useSelector((storeInfo) => storeInfo?.payoutReducer?.payoutKycKybrequirementsData);
    const [uboDocuments, setUboDocuments] = useState([]); // Will store the requirements
    const [selectedPosition, setSelectedPosition] = useState('Ubo');
    const [error, setError] = useState(null);

    // New State for Dynamic Document Requirements
    const [activeDocumentRequirements, setActiveDocumentRequirements] = useState([]);

    // Document pre-filled status (used for disabling fields)
    // NOTE: isDocNumberPreFilled and isDocPhotosPreFilled are used for upload photo lock only, 
    // the document number lock has been removed as requested.
    const isDocNumberPreFilled = !!initialItemData?.docDetails?.documentNumber && initialItemData?.docDetails?.recordStatus !== 'Modified';
    const isDocPhotosPreFilled = (!!initialItemData?.docDetails?.documentFront || !!initialItemData?.docDetails?.documentBack) && initialItemData?.docDetails?.recordStatus !== 'Modified';
    
    const { loading: beneficiariesLoading, data: beneficiariesLu, error: beneficiariesError } = useSelector(state => state.payoutReducer.beneficiaries);
    const { loading: uboDetailsLoading, data: uboDetails, error: uboError } = useSelector(state => state.payoutReducer.uboDetails);
    const { data: lookups } = useSelector(state => state.kybStore.lookups)
    const overallLoading = beneficiariesLoading || uboDetailsLoading;

    // Load uboDocuments from Redux store data
    useEffect(() => {
        if (data?.kyb) {
            setUboDocuments(data?.kyb?.uboDocuments || []);
        }
    }, [data]);

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
    
    // --- Document Requirement Logic ---

    const getDocumentRequirements = useCallback((selectedCountry) => {
        if (!uboDocuments || uboDocuments.length === 0 || !selectedCountry) {
            // Fallback to Default if country is null or not found
            const defaultRequirement = uboDocuments.find(doc =>
                doc.countries.trim().toLowerCase() === 'default'
            );
            return defaultRequirement ? defaultRequirement.kycrequirements.split(',').map(req => req.trim()) : [];
        }

        // 1. Check for specific country match
        const specificRequirement = uboDocuments.find(doc =>
            doc.countries.split(',').map(c => c.trim().toLowerCase()).includes(selectedCountry.trim().toLowerCase())
        );

        if (specificRequirement) {
            return specificRequirement.kycrequirements.split(',').map(req => req.trim());
        }

        // 2. Fallback to Default
        const defaultRequirement = uboDocuments.find(doc =>
            doc.countries.trim().toLowerCase() === 'default'
        );

        if (defaultRequirement) {
            return defaultRequirement.kycrequirements.split(',').map(req => req.trim());
        }

        return [];
    }, [uboDocuments]);

    const isSectionRequired = useCallback((sectionName) => {
        // Return true if the sectionName (e.g., 'Passport', 'DocFront', 'DocumentNumber')
        // is present in the requirements array.
        return activeDocumentRequirements.includes(sectionName);
    }, [activeDocumentRequirements]);
    
    // --- End Document Requirement Logic ---

    const getFileNameFromUrl = (url) => {
        if (!url) return '';
        const parsedUrl = new URL(url);
        return parsedUrl.pathname.split("/").pop();
    };

    const createFileList = (url, fileName) => [
        {
            uid: url, // Use URL as uid for stability
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
        // Clear all document related fields and states
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
                const expiryDate = getFormattedDob(docDetails.docExpiryDate)
                const { documentFront, documentBack } = docDetails;
                
                // Set active requirements on initial load based on existing country
                const initialRequirements = getDocumentRequirements(initialItemData.country);
                setActiveDocumentRequirements(initialRequirements);

                const fieldsToSet = {
                    ...initialItemData,
                    phoneCode: decryptAES(initialItemData?.phoneCode) || '',
                    phoneNumber: decryptAES(initialItemData?.phoneNumber) ? decryptAES(initialItemData.phoneNumber).replace(initialItemData.phoneCode, '') : '',
                    email: decryptAES(initialItemData?.email) || '',
                    dob: formattedDob,
                    // Document fields - using the component's internal names
                    type: docDetails.documentType, 
                    frontImage: documentFront,
                    backImage: documentBack,
                    docId: decryptAES(docDetails.documentNumber) || docDetails.docId || '',
                    docExpiryDate: expiryDate,
                    idIssuingCountry: docDetails.idIssuingCountry,
                };
                form.setFieldsValue(fieldsToSet);
                setSelectedPosition(initialItemData.uboPosition || 'Ubo');

                const frontDocName = documentFront ? getFileNameFromUrl(documentFront) : '';
                const backDocImageName = documentBack ? getFileNameFromUrl(documentBack) : '';

                setFileLists({
                    frontImage: documentFront ? createFileList(documentFront, frontDocName) : [],
                    backImage: documentBack ? createFileList(documentBack, backDocImageName) : [],
                });

                setPreviewImages({
                    frontImage: documentFront,
                    backImage: documentBack,
                });
                setPdfPreview({
                    frontImage: documentFront,
                    backImage: documentBack,
                });
                dispatch(fetchBeneficiaries(initialItemData.uboPosition || 'Ubo'));
            } else {
                // Add mode
                form.resetFields();
                setSelectedPosition('Ubo');
                dispatch(fetchBeneficiaries('Ubo'));
                handleDocumentChange();
                
                // Get the country from the form if pre-filled, otherwise, it will pass null/undefined
                // which will trigger the 'default' requirements in getDocumentRequirements.
                const initialCountry = form.getFieldValue('country'); 
                setActiveDocumentRequirements(getDocumentRequirements(initialCountry));
            }
        }
    }, [initialItemData, drawerVisible, form, dispatch, handleDocumentChange, getDocumentRequirements]);

    // **MODIFIED useEffect to bind uboDetails including Documents**
    useEffect(() => {
        if (uboDetails) {
            const formattedDob = getFormattedDob(uboDetails.dob);
            const docDetails = uboDetails.docDetails || {};
            const expiryDate = getFormattedDob(docDetails.docExpiryDate);
            const { documentFront, documentBack } = docDetails;
            
            // --- START: Personal and Document Fields Binding ---
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
                
                // Document fields
                type: docDetails.documentType, 
                frontImage: documentFront,
                backImage: documentBack,
                docId: decryptAES(docDetails.documentNumber) || docDetails.docId || '',
                docExpiryDate: expiryDate,
                idIssuingCountry: docDetails.idIssuingCountry,
            };
            
            form.setFieldsValue(fieldsToSetFromUbo);
            // --- END: Personal and Document Fields Binding ---
            
            // Set active requirements after populating country from UBO details
            const requirements = getDocumentRequirements(uboDetails.country);
            setActiveDocumentRequirements(requirements);
            
            // --- START: Update File Lists and Previews ---
            const frontDocName = documentFront ? getFileNameFromUrl(documentFront) : '';
            const backDocImageName = documentBack ? getFileNameFromUrl(documentBack) : '';

            setFileLists({
                frontImage: documentFront ? createFileList(documentFront, frontDocName) : [],
                backImage: documentBack ? createFileList(documentBack, backDocImageName) : [],
            });

            setPreviewImages({
                frontImage: documentFront,
                backImage: documentBack,
            });
            // Update PDF previews for display logic
            setPdfPreview({
                frontImage: documentFront,
                backImage: documentBack,
            });
            // --- END: Update File Lists and Previews ---
            
            // NOTE: handleDocumentChange() is REMOVED to prevent clearing the loaded document data.
        }
    }, [uboDetails, form, getDocumentRequirements]); 

    const handleChangePosition = useCallback((e) => {
        const newPosition = e.target.value;
        setSelectedPosition(newPosition);
        form.resetFields(); // Reset all fields
        handleDocumentChange(); // Clear document fields
        form.setFieldsValue({ uboPosition: newPosition }); // Set the new position
        dispatch(resetState(["uboDetails", "beneficiaries"]));
        dispatch(fetchBeneficiaries(newPosition));
        setError(null);
        // Clear document requirements on position change (will be set on beneficiary select)
        setActiveDocumentRequirements([]); 
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
        handleDocumentChange(); // Clear docs when new beneficiary selected
        form.setFieldsValue({ uboPosition: selectedPosition }); // Set the current position
        dispatch(resetState(["uboDetails"]));
        form.setFieldValue("beneficiaries", value);
        
        // Temporarily clear requirements until UBO details with country are fetched
        setActiveDocumentRequirements([]); 

        const selected = beneficiariesLu.find(
            item => item.name?.trim().toLowerCase() === value?.trim().toLowerCase()
        );
        if (selected) {
            dispatch(fetchUboDetails(selected.id));
        }
    }, [dispatch, beneficiariesLu, form, selectedPosition, handleDocumentChange]);

    const handleFieldChange = useCallback(
        (fieldName) => (e) => {
            const value = e?.target ? e.target.value : e;
            form.setFieldValue(fieldName, value);
            
            if (fieldName === "country") {
                const requirements = getDocumentRequirements(value);
                setActiveDocumentRequirements(requirements);
                handleDocumentChange(); 
            }
        },
        [form, getDocumentRequirements, handleDocumentChange]
    );

    const onFinish = useCallback(async (values) => {
        setError(null);
        const isEditing = !!initialItemData?.id;
        const requiredDocTypes = activeDocumentRequirements.filter(req => ['Passport', 'NATIONAL_ID', 'ID_CARD'].includes(req));
        const hasDocType = requiredDocTypes.length > 0;
        if (hasDocType && !values.type) {
            setError('Document type is required based on country requirements.');
            handleScrollTop();
            return;
        }
        if (isSectionRequired("DocumentNumber") && !values.docId) {
             setError('Document Number is required.');
             handleScrollTop();
             return;
        }
        if (isSectionRequired("DocFront") && !values.frontImage) {
            setError('Front ID Photo is required.');
            handleScrollTop();
            return;
        }
        if (isSectionRequired("DocBack") && !values.backImage) {
            setError('Back ID Photo is required.');
            handleScrollTop();
            return;
        }

        const savedItem = {
            id: initialItemData?.id || uuidv4(),
            uboPosition: 'ubo',
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
                documentFront: values.frontImage,
                documentBack: values.backImage,
                documentType: values.type,
                idIssuingCountry: values.idIssuingCountry,
                documentNumber: encryptAES(values.docId),
                docExpiryDate: values.docExpiryDate ? values.docExpiryDate.format("YYYY-MM-DD") : null,
            }
        };
        onSave(savedItem);
        form.resetFields();
    }, [initialItemData, onSave, form, handleScrollTop, activeDocumentRequirements, isSectionRequired]);

    const clearErrors = useCallback(() => {
        setError(null);
    }, []);

    // NOTE: This function logic might need review based on your actual doc details structure.
    // I've kept the original implementation but noted it might need a re-sync with activeDocumentRequirements.
    const handleDocumentFieldChange = useCallback((selectedType) => {
        const docDetails = initialItemData?.docDetails || {};

        if (docDetails.documentType === selectedType) {
            const frontdocName = docDetails.documentFront ? getFileNameFromUrl(docDetails.documentFront) : '';
            const backdocImageName = docDetails.documentBack ? getFileNameFromUrl(docDetails.documentBack) : '';

            setFileLists({
                frontImage: docDetails.documentFront ? createFileList(docDetails.documentFront, frontdocName) : [],
                backImage: docDetails.documentBack ? createFileList(docDetails.documentBack, backdocImageName) : [],
            });
            setPreviewImages({
                frontImage: docDetails.documentFront,
                backImage: docDetails.documentBack,
            });
            setPdfPreview((prev) => ({
                ...prev,
                frontImage: docDetails.documentFront,
                backImage: docDetails.documentBack,
            }));

            form.setFieldsValue({
                docExpiryDate: docDetails.docExpiryDate ? moment(docDetails.docExpiryDate, "YYYY-MM-DD") : null,
                docId: decryptAES(docDetails.documentNumber) || docDetails.docId || "",
                frontImage: docDetails.documentFront || null,
                backImage: docDetails.documentBack || null,
            });
        } else {
            handleDocTypeChange();
        }
    }, [form, initialItemData, handleDocTypeChange]);


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
                
                <Form form={form} onFinish={onFinish}
                    scrollToFirstError={{
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center',
                    }}>
                    {isShowDirector && <div className='basicinfo-radioform'>
                        <Form.Item
                            name="uboPosition"
                            rules={[{ required: true, message: 'Is required' }]}
                            initialValue={selectedPosition}
                        >
                            <div className="flex items-center gap-[10px]">
                                {['Ubo'].map((position) => {
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
                    </div>}

                    <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-6 basicinfo-form mt-4">
                        <Form.Item
                            name="beneficiaries"
                            label="Select Beneficiaries"
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

                    {/* DYNAMIC DOCUMENT UPLOAD SECTION */}
                    {activeDocumentRequirements.length > 0 && 
                        <div className="mt-7 w-full rounded-5 border-dbkpiStroke mb-4">
                            <h3 className="text-2xl font-semibold text-titleColor mb-4">
                                Documents Upload
                                <Tooltip title="Please upload clear and legible copies of your identification documents. Ensure that all details are visible and not obscured by glare or shadows.">
                                    <span className='icon bank-info ml-2'></span>
                                </Tooltip>
                            </h3>
                            <div className="grid grid-cols-1 gap-5 ">
                                
                                {/* Document Type Selection based on required types */}
                                {activeDocumentRequirements.some(req => ['Passport', 'NATIONAL_ID', 'ID_CARD'].includes(req)) && (
                                    <div className={`grid gap-6`}>
                                        <Form.Item
                                            name="type"
                                            label="Document Type"
                                            rules={[{ required: true, message: "Is required" }]}
                                            className="mb-0 custom-select-float"
                                            colon={false}
                                        >
                                            <AppSelect
                                                name="type"
                                                onSelect={(value) => { form.setFieldValue("type", value); handleDocumentFieldChange(value); }}
                                                placeholder="Select Document Type"
                                                className=""
                                                options={
                                                    activeDocumentRequirements.map(req => {
                                                        if (req === 'Passport') return { label: 'Passport', value: 'Passport' };
                                                        if (req === 'NATIONAL_ID') return { label: 'National ID', value: 'NATIONAL_ID' };
                                                        if (req === 'ID_CARD') return { label: 'ID Card', value: 'ID_CARD' };
                                                        return null;
                                                    }).filter(Boolean)
                                                }
                                                fieldNames={{ label: "label", value: "value" }}
                                            />
                                        </Form.Item>
                                    </div>
                                )}
                                {/* Document Number Input */}
                                {isSectionRequired("DocumentNumber") && <div className="grid md:grid-cols-2 gap-5 ">
                                    <Form.Item
                                        className="custom-select-float mb-0"
                                        name="docId" // Harmonized name
                                        label={'Document Number'}
                                        required
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
                                            // The disabled prop has been removed to allow input when the country is changed.
                                            onBlur={handleInputBlur}
                                        />
                                    </Form.Item>
                                </div>}  
                                <div className="grid md:grid-cols-2 gap-5 ">
                                    {/* Front Image Upload */}
                                    {isSectionRequired("DocFront") && <Form.Item
                                        name="frontImage" // Harmonized name
                                        className={`payees-input required-reverse ${(!hideWizard && "!mb-4") || "mb-0"}`}
                                        rules={[{ required: isSectionRequired("DocFront"), message: "is required" }]}
                                    >
                                        <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                            <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                Front ID Photo <span className="text-requiredRed">*</span>
                                            </p>
                                        </div>
                                        <FileUpload
                                            name="frontImage" // Harmonized name
                                            fileList={fileLists.frontImage}
                                            previewImage={previewImages.frontImage || pdfPreview.frontImage || (fileLists.frontImage[0]?.url || '')}
                                            handleUploadChange={handleUploadChange}
                                            handleRemoveImage={isDocPhotosPreFilled ? null : removeImage}
                                            onPreview={handlePreview}
                                            onDownload={onDownload}
                                            disabled={isDocPhotosPreFilled}
                                        />
                                    </Form.Item>}
                                    
                                    {/* Back Image Upload */}
                                    {isSectionRequired("DocBack") && <Form.Item
                                        name="backImage" // Harmonized name
                                        className={`payees-input required-reverse ${(!hideWizard && "!mb-4") || "mb-0"}`}
                                        rules={[{ required: isSectionRequired("DocBack"), message: "is required" }]}
                                    >
                                        <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                            <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                Back ID Photo <span className="text-requiredRed">*</span>
                                            </p>
                                        </div>
                                        <FileUpload
                                            name="backImage" // Harmonized name
                                            fileList={fileLists.backImage}
                                            previewImage={previewImages.backImage || pdfPreview.backImage || (fileLists.backImage[0]?.url || '')}
                                            handleUploadChange={handleUploadChange}
                                            handleRemoveImage={isDocPhotosPreFilled ? null : removeImage}
                                            onPreview={handlePreview}
                                            onDownload={onDownload}
                                            disabled={isDocPhotosPreFilled}
                                        />
                                    </Form.Item>}
                                </div>
                            </div>
                        </div>
                    }
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